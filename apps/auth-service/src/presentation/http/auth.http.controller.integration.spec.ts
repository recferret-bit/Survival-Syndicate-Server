import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import request from 'supertest';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthHttpController } from './auth.http.controller';
import { RegisterHandler } from '@app/auth-service/application/use-cases/register/register.handler';
import { LoginHandler } from '@app/auth-service/application/use-cases/login/login.handler';
import { RefreshHandler } from '@app/auth-service/application/use-cases/refresh/refresh.handler';
import { LogoutHandler } from '@app/auth-service/application/use-cases/logout/logout.handler';
import { TokenService } from '@app/auth-service/application/services/token.service';
import { RefreshTokenStoreService } from '@app/auth-service/application/services/refresh-token-store.service';
import { AuthUserPortRepository } from '@app/auth-service/application/ports/auth-user.port.repository';
import {
  HttpExceptionsFilter,
  ZodExceptionFilter,
  EnvService,
} from '@lib/shared/application';
import { BearerTokenHashCacheService } from '@lib/shared/redis';
import { PlayerPublisher } from '@lib/lib-player';
import { AuthUser } from '@app/auth-service/domain/entities/auth-user/auth-user';

class InMemoryAuthUserRepository extends AuthUserPortRepository {
  private users = new Map<string, AuthUser>();
  private byId = new Map<string, AuthUser>();
  private seq = 1n;

  async create(data: {
    email: string;
    username: string;
    passwordHash: string;
    currencyIsoCode: string;
    languageIsoCode: string;
    country?: string;
  }): Promise<AuthUser> {
    const user = new AuthUser({
      id: this.seq++,
      email: data.email,
      username: data.username,
      passwordHash: data.passwordHash,
      currencyIsoCode: data.currencyIsoCode,
      languageIsoCode: data.languageIsoCode,
      country: data.country,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.set(user.email, user);
    this.byId.set(user.id.toString(), user);
    return user;
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.users.get(email) ?? null;
  }

  async findById(userId: string): Promise<AuthUser | null> {
    return this.byId.get(userId) ?? null;
  }

  async updateBearerTokenHash(): Promise<void> {}
}

describe('AuthHttpController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule.forRoot()],
      controllers: [AuthHttpController],
      providers: [
        RegisterHandler,
        LoginHandler,
        RefreshHandler,
        LogoutHandler,
        TokenService,
        {
          provide: EnvService,
          useValue: {
            get: (key: string) =>
              key === 'JWT_SECRET' || key === 'PASSWORD_SECRET'
                ? 'test-secret'
                : undefined,
          },
        },
        {
          provide: AuthUserPortRepository,
          useClass: InMemoryAuthUserRepository,
        },
        {
          provide: RefreshTokenStoreService,
          useValue: {
            store: new Map<string, string>(),
            async set(this: any, userId: string, hash: string) {
              this.store.set(userId, hash);
            },
            async get(this: any, userId: string) {
              return this.store.get(userId) ?? null;
            },
            async remove(this: any, userId: string) {
              this.store.delete(userId);
            },
          },
        },
        {
          provide: BearerTokenHashCacheService,
          useValue: {
            async setBearerTokenHash() {},
            async removeBearerTokenHash() {},
          },
        },
        {
          provide: PlayerPublisher,
          useValue: {
            async publishUserRegistered() {},
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v2');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: false,
        transform: true,
      }),
      new ZodValidationPipe(),
    );
    app.useGlobalFilters(new ZodExceptionFilter(), new HttpExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register -> POST /auth/login -> POST /auth/refresh pipeline works', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v2/auth/register')
      .send({
        email: 'user@example.com',
        username: 'playerOne',
        password: 'StrongPassword123',
      })
      .expect(200);

    expect(registerResponse.body.tokens.accessToken).toBeDefined();
    expect(registerResponse.body.tokens.refreshToken).toBeDefined();

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v2/auth/login')
      .send({
        email: 'user@example.com',
        password: 'StrongPassword123',
      })
      .expect(200);

    expect(loginResponse.body.tokens.refreshToken).toBeDefined();

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/v2/auth/refresh')
      .send({
        refreshToken: loginResponse.body.tokens.refreshToken,
      })
      .expect(200);

    expect(refreshResponse.body.tokens.accessToken).toBeDefined();
    expect(refreshResponse.body.tokens.refreshToken).toBeDefined();
  });
});
