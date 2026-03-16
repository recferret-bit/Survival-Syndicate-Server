import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BasePublisher } from '@lib/shared/nats';
import {
  GameplayRemovePlayerEvent,
  GameplayRemovePlayerEventSchema,
  GameplayStartSimulationEvent,
  GameplayStartSimulationEventSchema,
  LocalOrchestratorSubjects,
  OrchestratorZoneHeartbeatEvent,
  OrchestratorZoneHeartbeatEventSchema,
} from '@lib/lib-local-orchestrator';

@Injectable()
export class LocalOrchestratorPublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, LocalOrchestratorPublisher.name);
  }

  async publishOrchestratorZoneHeartbeat(
    dto: OrchestratorZoneHeartbeatEvent,
  ): Promise<void> {
    await this.emitDurable(
      LocalOrchestratorSubjects.ORCHESTRATOR_ZONE_HEARTBEAT,
      dto,
      OrchestratorZoneHeartbeatEventSchema,
    );
  }

  async publishGameplayStartSimulation(
    dto: GameplayStartSimulationEvent,
  ): Promise<void> {
    await this.emitDurable(
      LocalOrchestratorSubjects.GAMEPLAY_START_SIMULATION,
      dto,
      GameplayStartSimulationEventSchema,
    );
  }

  async publishGameplayRemovePlayer(
    dto: GameplayRemovePlayerEvent,
  ): Promise<void> {
    await this.emitDurable(
      LocalOrchestratorSubjects.GAMEPLAY_REMOVE_PLAYER,
      dto,
      GameplayRemovePlayerEventSchema,
    );
  }
}
