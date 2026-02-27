import {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import request from 'supertest';
import { stringToBigNumber } from '@lib/shared';
import { AuthJwtGuard } from '@lib/shared/auth';
import { PlayerPortRepository } from '@app/player-service/application/ports/player.port.repository';
import { Player } from '@app/player-service/domain/entities/player/player';
import { CreateProfileHandler } from '@app/player-service/application/use-cases/create-profile/create-profile.handler';
import { GetMyPlayerHandler } from '@app/player-service/application/use-cases/get-my-player/get-my-player.handler';
import { PlayersHttpController } from './players.http.controller';
import { UsersNatsController } from '@app/player-service/presentation/nats/users.nats.controller';

class TestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.session = { id: '101' };
    return true;
  }
}

class InMemoryPlayerRepository extends PlayerPortRepository {
  private byId = new Map<string, Player>();
  private byUserId = new Map<string, Player>();
  private seq = 1n;

  async create(data: { userId: any; username: string }): Promise<Player> {
    const now = new Date();
    const player = new Player({
      id: stringToBigNumber(this.seq.toString()),
      userId: stringToBigNumber(data.userId.toString()),
      username: data.username,
      createdAt: now,
      updatedAt: now,
    });
    this.seq += 1n;
    this.byId.set(player.id.toString(), player);
    this.byUserId.set(player.userId.toString(), player);
    return player;
  }

  async findById(playerId: string): Promise<Player | null> {
    return this.byId.get(playerId) ?? null;
  }

  async findByUserId(userId: string): Promise<Player | null> {
    return this.byUserId.get(userId) ?? null;
  }
}

describe('Players integration pipeline', () => {
  let app: INestApplication;
  let usersNatsController: UsersNatsController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule.forRoot()],
      controllers: [PlayersHttpController, UsersNatsController],
      providers: [
        CreateProfileHandler,
        GetMyPlayerHandler,
        { provide: PlayerPortRepository, useClass: InMemoryPlayerRepository },
      ],
    })
      .overrideGuard(AuthJwtGuard)
      .useClass(TestAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    usersNatsController = moduleRef.get(UsersNatsController);
  });

  afterAll(async () => {
    await app.close();
  });

  it('handles user.registered event and returns profile via GET /api/players/me', async () => {
    await usersNatsController.handleUserRegistered({
      userId: '101',
      currencyIsoCode: 'USD',
    });

    const response = await request(app.getHttpServer())
      .get('/api/players/me')
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    expect(response.body.userId).toBe('101');
    expect(response.body.username).toBe('player_101');
    expect(response.body.playerId).toBeDefined();
  });
});
