import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { GameServerPublisher } from '@lib/lib-game-server';
import { SimulationManagerService } from '@app/gameplay-service/application/services/simulation-manager.service';
import { HandleStartSimulationHandler } from '@app/gameplay-service/application/use-cases/handle-start-simulation/handle-start-simulation.handler';
import { HandleRemovePlayerHandler } from '@app/gameplay-service/application/use-cases/handle-remove-player/handle-remove-player.handler';
import { GameplayNatsController } from './gameplay.nats.controller';

describe('GameplayNatsController (Integration)', () => {
  let simulationManager: SimulationManagerService;

  afterEach(() => {
    simulationManager?.destroy('match-1');
  });

  it('start_simulation creates simulation', async () => {
    const publishWorldState = jest.fn().mockResolvedValue(undefined);
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule.forRoot()],
      controllers: [GameplayNatsController],
      providers: [
        SimulationManagerService,
        HandleStartSimulationHandler,
        HandleRemovePlayerHandler,
        {
          provide: GameServerPublisher,
          useValue: { publishWorldState },
        },
      ],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    const controller = moduleRef.get(GameplayNatsController);
    simulationManager = moduleRef.get(SimulationManagerService);

    await controller.handleStartSimulation({
      matchId: 'match-1',
      playerIds: ['10', '11'],
      zoneId: 'zone-a',
    });

    const sim = simulationManager.get('match-1');
    expect(sim).toBeDefined();
    expect(sim?.matchId).toBe('match-1');
    expect(sim?.playerIds).toEqual(['10', '11']);

    await app.close();
  });
});
