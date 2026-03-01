import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { GameServerPublisher } from '@lib/lib-game-server';
import { SlotManagerService } from '@app/local-orchestrator/application/services/slot-manager.service';
import { GracePeriodService } from '@app/local-orchestrator/application/services/grace-period.service';
import { HandleFoundMatchHandler } from '@app/local-orchestrator/application/use-cases/handle-found-match/handle-found-match.handler';
import { HandlePlayerConnectionStatusHandler } from '@app/local-orchestrator/application/use-cases/handle-player-connection-status/handle-player-connection-status.handler';
import { ReconnectRequestHandler } from '@app/local-orchestrator/application/use-cases/reconnect-request/reconnect-request.handler';
import { LocalOrchestratorNatsController } from './local-orchestrator.nats.controller';

describe('LocalOrchestratorNatsController (Integration)', () => {
  it('handles reconnect request request/reply pipeline', async () => {
    const publisher = {
      publishGameplayStartSimulation: jest.fn().mockResolvedValue(undefined),
      publishGameplayRemovePlayer: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule.forRoot()],
      controllers: [LocalOrchestratorNatsController],
      providers: [
        SlotManagerService,
        GracePeriodService,
        HandleFoundMatchHandler,
        HandlePlayerConnectionStatusHandler,
        ReconnectRequestHandler,
        {
          provide: GameServerPublisher,
          useValue: publisher,
        },
      ],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    const controller = moduleRef.get(LocalOrchestratorNatsController);
    await controller.handleFoundMatch({
      matchId: 'match-1',
      lobbyId: 'lobby-1',
      zoneId: 'zone-a',
      websocketUrl: 'ws://zone-a',
      playerIds: ['10'],
    });

    const response = await controller.handleReconnectRequest({
      matchId: 'match-1',
      playerId: '10',
    });
    expect(response.status).toBe('success');
    expect(publisher.publishGameplayStartSimulation).toHaveBeenCalled();

    await app.close();
  });
});
