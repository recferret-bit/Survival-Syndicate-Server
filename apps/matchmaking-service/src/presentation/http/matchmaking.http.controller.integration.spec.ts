import {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import request from 'supertest';
import { GameServerPublisher } from '@lib/lib-game-server';
import { AuthJwtGuard } from '@lib/shared/auth';
import { MatchmakingHttpController } from './matchmaking.http.controller';
import { MatchmakingNatsController } from '@app/matchmaking-service/presentation/nats/matchmaking.nats.controller';
import { CreateLobbyHandler } from '@app/matchmaking-service/application/use-cases/create-lobby/create-lobby.handler';
import { JoinLobbyHandler } from '@app/matchmaking-service/application/use-cases/join-lobby/join-lobby.handler';
import { LeaveLobbyHandler } from '@app/matchmaking-service/application/use-cases/leave-lobby/leave-lobby.handler';
import { StartMatchHandler } from '@app/matchmaking-service/application/use-cases/start-match/start-match.handler';
import { JoinSoloHandler } from '@app/matchmaking-service/application/use-cases/join-solo/join-solo.handler';
import { UpsertZoneHeartbeatHandler } from '@app/matchmaking-service/application/use-cases/upsert-zone-heartbeat/upsert-zone-heartbeat.handler';
import { HandleMatchFinishedHandler } from '@app/matchmaking-service/application/use-cases/handle-match-finished/handle-match-finished.handler';
import { LobbyPortRepository } from '@app/matchmaking-service/application/ports/lobby.port.repository';
import { ZoneRegistryPort } from '@app/matchmaking-service/application/ports/zone-registry.port';
import { LobbyInMemoryRepository } from '@app/matchmaking-service/infrastructure/repositories/lobby.in-memory.repository';
import { ZoneRegistryInMemoryRepository } from '@app/matchmaking-service/infrastructure/repositories/zone-registry.in-memory.repository';

class TestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const headerValue = request.headers['x-player-id'];
    const playerId = Array.isArray(headerValue)
      ? headerValue[0]
      : (headerValue as string | undefined);
    request.session = { id: playerId ?? '1' };
    return true;
  }
}

describe('Matchmaking HTTP pipeline (Integration)', () => {
  let app: INestApplication;
  const gameServerPublisher = {
    publishMatchmakingFoundMatch: jest.fn().mockResolvedValue(undefined),
  };
  let natsController: MatchmakingNatsController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule.forRoot()],
      controllers: [MatchmakingHttpController, MatchmakingNatsController],
      providers: [
        CreateLobbyHandler,
        JoinLobbyHandler,
        LeaveLobbyHandler,
        StartMatchHandler,
        JoinSoloHandler,
        UpsertZoneHeartbeatHandler,
        HandleMatchFinishedHandler,
        {
          provide: LobbyPortRepository,
          useClass: LobbyInMemoryRepository,
        },
        {
          provide: ZoneRegistryPort,
          useClass: ZoneRegistryInMemoryRepository,
        },
        {
          provide: GameServerPublisher,
          useValue: gameServerPublisher,
        },
      ],
    })
      .overrideGuard(AuthJwtGuard)
      .useClass(TestAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    natsController = moduleRef.get(MatchmakingNatsController);
  });

  afterAll(async () => {
    await app.close();
  });

  it('runs lobby create -> join -> start and publishes found_match', async () => {
    await natsController.handleZoneHeartbeat({
      zoneId: 'zone-a',
      websocketUrl: 'ws://zone-a',
    });

    const createResponse = await request(app.getHttpServer())
      .post('/api/lobbies/create')
      .set('x-player-id', '1')
      .send({ maxPlayers: 4 })
      .expect(200);

    const lobbyId = createResponse.body.lobbyId as string;
    expect(lobbyId).toBeDefined();

    const joinResponse = await request(app.getHttpServer())
      .post(`/api/lobbies/${lobbyId}/join`)
      .set('x-player-id', '2')
      .send({})
      .expect(200);

    expect(joinResponse.body.playerIds).toEqual(['1', '2']);

    const startResponse = await request(app.getHttpServer())
      .post(`/api/lobbies/${lobbyId}/start`)
      .set('x-player-id', '1')
      .send({})
      .expect(200);

    expect(startResponse.body.status).toBe('started');
    expect(gameServerPublisher.publishMatchmakingFoundMatch).toHaveBeenCalled();
  });
});
