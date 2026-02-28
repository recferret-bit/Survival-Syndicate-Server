import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NonDurable } from '@lib/shared/nats';
import { ZodError } from 'zod';
import {
  GameServerSubjects,
  GameplayStartSimulationEventSchema,
  GameplayRemovePlayerEventSchema,
} from '@lib/lib-game-server';
import type {
  GameplayStartSimulationEvent,
  GameplayRemovePlayerEvent,
} from '@lib/lib-game-server';
import { HandleStartSimulationCommand } from '@app/gameplay-service/application/use-cases/handle-start-simulation/handle-start-simulation.command';
import { HandleRemovePlayerCommand } from '@app/gameplay-service/application/use-cases/handle-remove-player/handle-remove-player.command';

@Controller()
export class GameplayNatsController {
  private readonly logger = new Logger(GameplayNatsController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(GameServerSubjects.GAMEPLAY_START_SIMULATION)
  @NonDurable()
  async handleStartSimulation(
    @Payload() data: GameplayStartSimulationEvent,
  ): Promise<void> {
    try {
      const event = GameplayStartSimulationEventSchema.parse(data);
      await this.commandBus.execute(new HandleStartSimulationCommand(event));
    } catch (error) {
      this.logError('handleStartSimulation', error);
      throw error;
    }
  }

  @EventPattern(GameServerSubjects.GAMEPLAY_REMOVE_PLAYER)
  @NonDurable()
  async handleRemovePlayer(
    @Payload() data: GameplayRemovePlayerEvent,
  ): Promise<void> {
    try {
      const event = GameplayRemovePlayerEventSchema.parse(data);
      await this.commandBus.execute(new HandleRemovePlayerCommand(event));
    } catch (error) {
      this.logError('handleRemovePlayer', error);
      throw error;
    }
  }

  private logError(method: string, error: unknown): void {
    if (error instanceof ZodError) {
      this.logger.error(
        `${method} validation error: ${JSON.stringify(error.issues)}`,
      );
      return;
    }
    if (error instanceof Error) {
      this.logger.error(`${method} failed: ${error.message}`, error.stack);
      return;
    }
    this.logger.error(`${method} failed: ${String(error)}`);
  }
}
