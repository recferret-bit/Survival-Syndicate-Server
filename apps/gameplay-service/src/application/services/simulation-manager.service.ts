import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { GameSimulationStub } from './game-simulation-stub';
import { GameplayPublisher } from '@lib/lib-gameplay';

@Injectable()
export class SimulationManagerService implements OnModuleDestroy {
  private readonly simulations = new Map<string, GameSimulationStub>();

  constructor(private readonly gameplayPublisher: GameplayPublisher) {}

  create(matchId: string, playerIds: string[]): GameSimulationStub {
    const stub = new GameSimulationStub(
      matchId,
      playerIds,
      (state) => {
        void this.gameplayPublisher.publishWorldState(matchId, state);
      },
      100,
    );
    stub.startPublishLoop();
    this.simulations.set(matchId, stub);
    return stub;
  }

  get(matchId: string): GameSimulationStub | undefined {
    return this.simulations.get(matchId);
  }

  removePlayer(matchId: string, playerId: string): void {
    const sim = this.simulations.get(matchId);
    if (sim) sim.removePlayer(playerId);
  }

  destroy(matchId: string): void {
    const sim = this.simulations.get(matchId);
    if (sim) {
      sim.stopPublishLoop();
      this.simulations.delete(matchId);
    }
  }

  onModuleDestroy(): void {
    for (const [matchId] of this.simulations) {
      this.destroy(matchId);
    }
  }
}
