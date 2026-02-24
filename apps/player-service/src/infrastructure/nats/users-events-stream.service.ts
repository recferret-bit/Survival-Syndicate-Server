import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect, RetentionPolicy } from 'nats';
import { EnvService } from '@lib/shared/application';
import { buildConnectOptions } from '@lib/shared/nats/utils/connection';
import { createStream } from '@lib/shared/nats/utils/stream-manager';

const USERS_EVENTS_STREAM_NAME = 'users-events';
const USERS_EVENTS_SUBJECTS = ['users.>'];

@Injectable()
export class UsersEventsStreamService implements OnModuleInit {
  private readonly logger = new Logger(UsersEventsStreamService.name);

  constructor(private readonly envService: EnvService) {}

  async onModuleInit(): Promise<void> {
    try {
      const servers = this.envService.getNatsServers();
      const user = this.envService.getNatsUser();
      const pass = this.envService.getNatsPassword();
      const token = this.envService.getNatsToken();

      const nc = await connect(
        buildConnectOptions({ servers, user, pass, token }),
      );

      const jsm = await nc.jetstreamManager();
      await createStream(
        jsm,
        USERS_EVENTS_STREAM_NAME,
        USERS_EVENTS_SUBJECTS,
        { retention: RetentionPolicy.Interest },
        this.logger,
      );
      await nc.close();
      this.logger.log(
        `Users events stream '${USERS_EVENTS_STREAM_NAME}' ensured`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create users-events stream: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
