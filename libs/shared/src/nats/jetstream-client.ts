import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { connect, NatsConnection, JetStreamClient, headers } from 'nats';
import { Logger } from '@nestjs/common';
import { DEFAULT_NATS_CLIENT_STREAM_NAME } from './nats.config';
import {
  buildConnectOptions,
  ensureConnection as validateConnection,
} from './utils/connection';
import {
  generateInboxId,
  generateMessageId,
  DEFAULT_TIMEOUTS,
} from './utils/constants';

export interface JetStreamClientOptions {
  servers: string[];
  user?: string;
  pass?: string;
  token?: string;
  streamName?: string;
  requestTimeout?: number; // in milliseconds
  nonDurable?: boolean; // If true, uses core NATS instead of JetStream
}

export interface JetStreamClientEvents extends Record<string, Function> {
  disconnect: (data?: string | number) => void;
  reconnect: (data?: string | number) => void;
  error: (error: Error) => void;
}

export class JetStreamClientProxy extends ClientProxy<JetStreamClientEvents> {
  private readonly logger = new Logger(JetStreamClientProxy.name);
  private nc: NatsConnection;
  private js: JetStreamClient;
  private options: JetStreamClientOptions;
  private streamName: string;
  private requestTimeout: number;
  private isNonDurable: boolean;
  private isConnected = false;

  constructor(options: JetStreamClientOptions) {
    super();
    this.options = options;
    this.streamName = options.streamName || DEFAULT_NATS_CLIENT_STREAM_NAME;
    this.requestTimeout =
      options.requestTimeout || DEFAULT_TIMEOUTS.REQUEST_TIMEOUT;
    this.isNonDurable = options.nonDurable === true;
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.nc && !this.nc.isClosed()) {
      return;
    }

    try {
      const connectOptions = buildConnectOptions({
        servers: this.options.servers,
        user: this.options.user,
        pass: this.options.pass,
        token: this.options.token,
      });

      this.nc = await connect(connectOptions);

      // Only initialize JetStream if not non-durable
      if (!this.isNonDurable) {
        this.js = this.nc.jetstream();
      }
      this.isConnected = true;
    } catch (error) {
      this.logger.error('Failed to connect JetStream client', error);
      this.isConnected = false;
      throw error;
    }
  }

  async close() {
    if (this.nc && !this.nc.isClosed()) {
      await this.nc.close();
      this.isConnected = false;
    }
  }

  unwrap<T>(): T {
    // Return the NATS connection by default
    // Users can cast to specific types if needed:
    // - unwrap<NatsConnection>() for connection
    // - unwrap<JetStreamClient>() for JetStream client
    if (!this.nc) {
      throw new Error('NATS connection not initialized');
    }
    return this.nc as T;
  }

  on<EventKey extends keyof JetStreamClientEvents>(
    event: EventKey,
    callback: JetStreamClientEvents[EventKey],
  ): void {
    // Event handling can be implemented if needed
    // For now, this is a no-op
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
    if (this.isNonDurable) {
      throw new Error('JetStream client not available for non-durable client');
    }
    if (!this.js) {
      throw new Error('JetStream client not initialized');
    }
    return this.js;
  }

  protected publish(
    packet: ReadPacket,
    callback: (packet: WritePacket) => void,
  ): () => void {
    const { pattern, data } = packet;
    const subject = pattern as string;
    const replySubject = `_INBOX.${generateInboxId()}`;
    const msgId = generateMessageId();

    // Ensure connection before proceeding
    const ensureConnection = async () => {
      if (!this.isConnected || !this.nc || this.nc.isClosed()) {
        await this.connect();
      }
    };

    // Subscribe to reply
    const replySub = ensureConnection().then(() => {
      if (!this.nc || this.nc.isClosed()) {
        throw new Error('NATS connection not available');
      }
      return this.nc.subscribe(replySubject, {
        max: 1,
        timeout: this.requestTimeout,
      });
    });

    // Handle reply subscription
    replySub
      .then(async (sub) => {
        try {
          // Ensure connection is still valid
          if (!this.nc || this.nc.isClosed()) {
            await this.connect();
          }

          // Create headers with reply subject and message ID
          const msgHeaders = headers();
          msgHeaders.set('reply', replySubject);
          msgHeaders.set('Nats-Msg-Id', msgId);

          // Choose publish method based on durability
          if (this.isNonDurable) {
            // Use core NATS (non-durable, fail-fast if no subscribers)
            await this.nc.publish(
              subject,
              new TextEncoder().encode(JSON.stringify(data)),
              { headers: msgHeaders },
            );
          } else {
            // Use JetStream (durable, persistent)
            if (!this.js) {
              this.js = this.nc.jetstream();
            }
            await this.js.publish(
              subject,
              new TextEncoder().encode(JSON.stringify(data)),
              {
                headers: msgHeaders,
              },
            );
          }

          // Wait for reply with timeout
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error(`Request timeout for '${subject}'`));
            }, this.requestTimeout);
          });

          const replyPromise = (async () => {
            for await (const msg of sub) {
              const response = JSON.parse(msg.data.toString());
              return response;
            }
            throw new Error('No reply received');
          })();

          try {
            const response = await Promise.race([replyPromise, timeoutPromise]);
            callback({ response, isDisposed: true });
          } catch (error: any) {
            this.logger.error(
              `Error waiting for reply on '${subject}': ${error.message}`,
            );
            callback({ err: error, isDisposed: true });
          }
        } catch (error) {
          this.logger.error(`Error publishing to '${subject}'`, error);
          callback({ err: error, isDisposed: true });
        } finally {
          sub.unsubscribe();
        }
      })
      .catch((error) => {
        this.logger.error(
          `Failed to subscribe to reply '${replySubject}'`,
          error,
        );
        callback({ err: error, isDisposed: true });
      });

    // Return unsubscribe function
    return () => {
      replySub
        .then((sub) => sub.unsubscribe())
        .catch(() => {
          // Ignore errors during cleanup
        });
    };
  }

  protected dispatchEvent(packet: ReadPacket): Promise<any> {
    const { pattern, data } = packet;
    const subject = pattern as string;
    const msgId = generateMessageId();

    // Ensure connection
    if (!this.isConnected || !this.nc || this.nc.isClosed()) {
      return this.connect().then(() => this.dispatchEvent(packet));
    }

    // For events (not request/reply), use regular JetStream publish
    const msgHeaders = headers();
    msgHeaders.set('Nats-Msg-Id', msgId);

    return this.js.publish(
      subject,
      new TextEncoder().encode(JSON.stringify(data)),
      {
        headers: msgHeaders,
      },
    );
  }
}
