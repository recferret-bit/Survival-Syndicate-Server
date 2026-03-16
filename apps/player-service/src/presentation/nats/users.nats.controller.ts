import { Controller, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { logNatsHandlerError, NonDurable } from '@lib/shared/nats';
import {
  type GetPlayerRequest,
  GetPlayerRequestSchema,
  GetPlayerResponse,
  GetPlayerResponseSchema,
  PlayerSubjects,
} from '@lib/lib-player';
import { CreateProfileCommand } from '@app/player-service/application/use-cases/create-profile/create-profile.command';
import { GetPlayerQuery } from '@app/player-service/application/use-cases/get-player/get-player.query';
import {
  type UserRegisteredEvent,
  UserRegisteredEventSchema,
  UsersSubjects,
} from '@lib/lib-users';

@Controller()
export class UsersNatsController {
  private readonly logger = new Logger(UsersNatsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern(PlayerSubjects.GET_PLAYER)
  @NonDurable()
  async handleGetPlayer(
    @Payload() data: GetPlayerRequest,
  ): Promise<GetPlayerResponse> {
    try {
      const validatedRequest = GetPlayerRequestSchema.parse(data);
      const result = await this.queryBus.execute(
        new GetPlayerQuery(validatedRequest.playerId),
      );
      return GetPlayerResponseSchema.parse(result);
    } catch (error) {
      logNatsHandlerError(this.logger, 'handleGetPlayer', error);
      throw error;
    }
  }

  @EventPattern(UsersSubjects.USER_REGISTERED)
  @NonDurable()
  async handleUserRegistered(
    @Payload() data: UserRegisteredEvent,
  ): Promise<void> {
    try {
      const event = UserRegisteredEventSchema.parse(data);
      await this.commandBus.execute(new CreateProfileCommand(event));
    } catch (error) {
      logNatsHandlerError(this.logger, 'handleUserRegistered', error);
      throw error;
    }
  }
}
