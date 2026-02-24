import { DynamicModule, Module } from '@nestjs/common';
import {
  ClientsModule,
  CustomClientOptions,
  ClientProxy,
} from '@nestjs/microservices';
import { Type } from '@nestjs/common';
import { EnvModule, EnvService } from '../application';
import {
  JetStreamClientProxy,
  JetStreamClientOptions,
} from './jetstream-client';

export interface NatsClientModuleOptions {
  /**
   * Stream name for NATS JetStream client (required)
   */
  streamName: string;
  /**
   * Request timeout in milliseconds
   * Default: 3000 (3 seconds)
   */
  requestTimeout?: number;
}

@Module({})
export class NatsClientModule {
  /**
   * Register NATS client module with both durable and non-durable clients
   *
   * @param options - Configuration options for NATS client (streamName is required)
   * @returns Dynamic module configuration
   *
   * @example
   * ```typescript
   * // In your module with specific stream name
   * imports: [
   *   NatsClientModule.forRoot({ streamName: 'users' }),
   * ]
   *
   * // With custom timeout
   * imports: [
   *   NatsClientModule.forRoot({ streamName: 'balance', requestTimeout: 60000 }),
   * ]
   *
   * // Then inject both clients:
   * constructor(
   *   @Inject('NATS_CLIENT') private readonly durableClient: ClientProxy,
   *   @Inject('NATS_CLIENT_NON_DURABLE') private readonly nonDurableClient: ClientProxy,
   * ) {}
   * ```
   */
  static forRoot(options: NatsClientModuleOptions): DynamicModule {
    const createClientFactory = (
      envService: EnvService,
      isNonDurable: boolean,
    ): CustomClientOptions => {
      const clientOptions: JetStreamClientOptions = {
        servers: envService.getNatsServers(),
        streamName: options.streamName,
        requestTimeout: options.requestTimeout ?? 3000,
        nonDurable: isNonDurable,
        ...(envService.getNatsUser() && {
          user: envService.getNatsUser(),
        }),
        ...(envService.getNatsPassword() && {
          pass: envService.getNatsPassword(),
        }),
        ...(envService.getNatsToken() && {
          token: envService.getNatsToken(),
        }),
      };

      return {
        customClass: JetStreamClientProxy as unknown as Type<ClientProxy>,
        options: clientOptions,
      };
    };

    return {
      module: NatsClientModule,
      imports: [
        ClientsModule.registerAsync([
          // Durable client (default)
          {
            name: 'NATS_CLIENT',
            imports: [EnvModule.forRoot()],
            inject: [EnvService],
            useFactory: (envService: EnvService) =>
              createClientFactory(envService, false),
          },
          // Non-durable client
          {
            name: 'NATS_CLIENT_NON_DURABLE',
            imports: [EnvModule.forRoot()],
            inject: [EnvService],
            useFactory: (envService: EnvService) =>
              createClientFactory(envService, true),
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
