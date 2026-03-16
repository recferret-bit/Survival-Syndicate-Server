import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NonDurable, logNatsHandlerError } from '@lib/shared/nats';
import { HandleStartSimulationCommand } from '@app/gameplay-service/application/use-cases/handle-start-simulation/handle-start-simulation.command';
import { HandleRemovePlayerCommand } from '@app/gameplay-service/application/use-cases/handle-remove-player/handle-remove-player.command';
import {
  type GameplayRemovePlayerEvent,
  GameplayRemovePlayerEventSchema,
  type GameplayStartSimulationEvent,
  GameplayStartSimulationEventSchema,
  LocalOrchestratorSubjects,
} from '@lib/lib-local-orchestrator';

@Controller()
export class GameplayNatsController {
  private readonly logger = new Logger(GameplayNatsController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(LocalOrchestratorSubjects.GAMEPLAY_START_SIMULATION)
  @NonDurable()
  async handleStartSimulation(
    @Payload() data: GameplayStartSimulationEvent,
  ): Promise<void> {
    try {
      const event = GameplayStartSimulationEventSchema.parse(data);
      await this.commandBus.execute(new HandleStartSimulationCommand(event));
    } catch (error) {
      logNatsHandlerError(this.logger, 'handleStartSimulation', error);
      throw error;
    }
  }

  @EventPattern(LocalOrchestratorSubjects.GAMEPLAY_REMOVE_PLAYER)
  @NonDurable()
  async handleRemovePlayer(
    @Payload() data: GameplayRemovePlayerEvent,
  ): Promise<void> {
    try {
      const event = GameplayRemovePlayerEventSchema.parse(data);
      await this.commandBus.execute(new HandleRemovePlayerCommand(event));
    } catch (error) {
      logNatsHandlerError(this.logger, 'handleRemovePlayer', error);
      throw error;
    }
  }
}
