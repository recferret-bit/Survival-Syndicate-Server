import {
  CustomTransportStrategy,
  Server,
  WritePacket,
} from '@nestjs/microservices';
import {
  connect,
  NatsConnection,
  JetStreamClient,
  JetStreamManager,
} from 'nats';
import { Logger } from '@nestjs/common';
import { buildConnectOptions } from './utils/connection';
import { isHandlerNonDurable } from './utils/metadata';
import {
  deleteOldStreamIfOverlapping,
  createStream,
  StreamConfig,
} from './utils/stream-manager';
import { createConsumer, getConsumerName } from './utils/consumer-manager';
import {
  handleJetStreamMessage,
  handleCoreNatsMessage,
} from './utils/message-handler';

export interface JetStreamTransportOptions {
  servers: string[];
  user?: string;
  pass?: string;
  token?: string;
  streamName: string;
  durableName?: string;
  maxAge?: number; // in nanoseconds
  maxMsgs?: number;
  maxBytes?: number;
}

export interface JetStreamEvents extends Record<string, Function> {
  disconnect: (data?: string | number) => void;
  reconnect: (data?: string | number) => void;
  error: (error: Error) => void;
}

export class JetStreamTransportStrategy
  extends Server<JetStreamEvents>
  implements CustomTransportStrategy
{
  protected readonly logger = new Logger(JetStreamTransportStrategy.name);
  private nc: NatsConnection;
  private js: JetStreamClient;
  private jsm: JetStreamManager;
  private options: JetStreamTransportOptions;
  private streamName: string;
  private durableName: string;
  private coreNatsSubscriptions: Map<string, any> = new Map();
  private patternDurabilityMap: Map<string, boolean> = new Map();

  constructor(options: JetStreamTransportOptions) {
    super();
    this.options = options;
    this.streamName = options.streamName;
    this.durableName = options.durableName || options.streamName;
  }

  on<EventKey extends keyof JetStreamEvents>(
    event: EventKey,
    callback: JetStreamEvents[EventKey],
  ): this {
    // Event handling can be implemented if needed
    // For now, return this for chaining
    return this;
  }

  unwrap<T>(): T {
    // Return the NATS connection by default
    // Users can cast to specific types if needed:
    // - unwrap<NatsConnection>() for connection
    // - unwrap<JetStreamClient>() for JetStream client
    // - unwrap<JetStreamManager>() for JetStream manager
    if (!this.nc) {
      throw new Error('NATS connection not initialized');
    }
    return this.nc as T;
  }

  /**
   * Get the NATS connection directly
   */
  getConnection(): NatsConnection {
    if (!this.nc) {
      throw new Error('NATS connection not initialized');
    }
    return this.nc;
  }

  /**
   * Get the JetStream client directly
   */
  getJetStreamClient(): JetStreamClient {
    if (!this.js) {
      throw new Error('JetStream client not initialized');
    }
    return this.js;
  }

  /**
   * Get the JetStream manager directly
   */
  getJetStreamManager(): JetStreamManager {
    if (!this.jsm) {
      throw new Error('JetStream manager not initialized');
    }
    return this.jsm;
  }

  async listen(callback: () => void) {
    try {
      // Connect to NATS
      const connectOptions = buildConnectOptions({
        servers: this.options.servers,
        user: this.options.user,
        pass: this.options.pass,
        token: this.options.token,
      });

      this.nc = await connect(connectOptions);
      this.js = this.nc.jetstream();
      this.jsm = await this.nc.jetstreamManager();

      // Build pattern durability map early
      await this.buildPatternDurabilityMap();

      // Ensure stream exists
      await this.ensureStream();

      // Setup consumers for each message pattern
      await this.setupConsumers();

      // Setup core NATS subscriptions for non-durable handlers
      await this.setupCoreNatsSubscriptions();

      callback();
    } catch (error) {
      this.logger.error('Failed to start JetStream microservice', error);
      throw error;
    }
  }

  private async buildPatternDurabilityMap() {
    const handlers = this.getHandlers();

    for (const [pattern, handler] of handlers) {
      // Pass pattern to metadata checker to use global registry
      const isNonDurable = isHandlerNonDurable(handler, pattern);
      this.patternDurabilityMap.set(pattern, !isNonDurable);
    }
  }

  private async ensureStream() {
    const handlers = this.getHandlers();
    const { durableSubjects, allSubjects } = this.collectSubjects(handlers);

    // CRITICAL: Delete old stream with overlapping subjects before creating new stream
    await deleteOldStreamIfOverlapping(
      this.jsm,
      this.streamName,
      allSubjects,
      this.logger,
    );

    // If no durable handlers, skip stream creation
    if (durableSubjects.length === 0) {
      return;
    }

    // Create stream with durable subjects only
    const durableStreamName = `${this.streamName}-durable`;
    await createStream(
      this.jsm,
      durableStreamName,
      durableSubjects,
      {
        maxAge: this.options.maxAge,
        maxMsgs: this.options.maxMsgs,
        maxBytes: this.options.maxBytes,
      },
      this.logger,
    );

    // Update streamName for consumers
    this.streamName = durableStreamName;
  }

  /**
   * Collect all subjects from handlers, separated by durability
   */
  private collectSubjects(handlers: Map<any, Function>): {
    durableSubjects: string[];
    allSubjects: string[];
  } {
    const durableSubjects: string[] = [];
    const allSubjects: string[] = [];

    for (const [pattern] of handlers) {
      allSubjects.push(pattern as string);

      // Use pre-built durability map
      const isDurable =
        this.patternDurabilityMap.get(pattern as string) ?? true;

      if (isDurable) {
        durableSubjects.push(pattern as string);
      }
    }

    return { durableSubjects, allSubjects };
  }

  private async setupConsumers() {
    const handlers = this.getHandlers();

    if (handlers.size === 0) {
      return;
    }

    for (const [pattern, handler] of handlers) {
      const isDurable = this.patternDurabilityMap.get(pattern) ?? true;

      if (!isDurable) {
        continue;
      }

      const consumerName = getConsumerName(this.durableName, pattern);

      try {
        await createConsumer(
          this.jsm,
          this.streamName,
          consumerName,
          pattern,
          this.logger,
        );

        // Subscribe to consumer
        const consumer = await this.js.consumers.get(
          this.streamName,
          consumerName,
        );

        // Start consuming messages - don't await the loop but ensure it starts
        const consumeMessages = async () => {
          try {
            const messages = await consumer.consume();
            for await (const msg of messages) {
              await handleJetStreamMessage(
                msg,
                handler,
                pattern,
                this.nc,
                this.logger,
              );
            }
          } catch (error) {
            this.logger.error(
              `Error consuming messages for pattern '${pattern}'`,
              error,
            );
          }
        };

        // Start the consumer loop immediately
        consumeMessages();
      } catch (error) {
        this.logger.error(
          `Failed to setup consumer for pattern '${pattern}'`,
          error,
        );
      }
    }
  }

  private async setupCoreNatsSubscriptions() {
    const handlers = this.getHandlers();

    for (const [pattern, handler] of handlers) {
      const isDurable = this.patternDurabilityMap.get(pattern) ?? true;

      if (isDurable) {
        continue; // Skip - handled by JetStream
      }

      try {
        // Subscribe to core NATS (non-durable) with queue group
        // to ensure at-most-once delivery per service instance
        const subscription = this.nc.subscribe(pattern, {
          queue: `q-${this.durableName}`,
          callback: async (err, msg) => {
            if (err) {
              this.logger.error(
                `Error in core NATS subscription for '${pattern}'`,
                err,
              );
              return;
            }

            await handleCoreNatsMessage(
              msg,
              handler,
              pattern,
              this.nc,
              this.logger,
            );
          },
        });

        this.coreNatsSubscriptions.set(pattern, subscription);
      } catch (error) {
        this.logger.error(
          `Failed to setup core NATS subscription for pattern '${pattern}'`,
          error,
        );
      }
    }
  }

  async close() {
    // Unsubscribe from core NATS subscriptions
    for (const [, subscription] of this.coreNatsSubscriptions) {
      subscription.unsubscribe();
    }
    this.coreNatsSubscriptions.clear();

    if (this.nc) {
      await this.nc.close();
    }
  }
}
