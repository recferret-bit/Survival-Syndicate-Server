import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import request from 'supertest';
import { AppModule } from '@app/auth-service/app.module';
import { AdminApiKeyGuard } from '@lib/shared/admin/guards/admin-api-key.guard';
import {
  ZodExceptionFilter,
  HttpExceptionsFilter,
} from '@lib/shared/application';
import { PrismaService } from '@app/auth-service/infrastructure/prisma/prisma.service';
import { UserBalancePortRepository } from '@app/auth-service/application/ports/user-balance.port.repository';
import { BalanceResultPortRepository } from '@app/auth-service/application/ports/balance-result.port.repository';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';
import { BalanceAmount } from '@app/auth-service/domain/value-objects/balance-amount';
import { stringToBigNumber } from '@lib/shared';
import { CurrencyCode } from '@lib/shared/currency';

describe('BalanceAdminHttpController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let moduleRef: TestingModule;
  let userBalanceRepository: UserBalancePortRepository;
  let balanceResultRepository: BalanceResultPortRepository;
  const adminApiKey = 'test-admin-api-key';

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AdminApiKeyGuard)
      .useValue({
        canActivate: async (context: ExecutionContext) => {
          await Promise.resolve();
          const req = context.switchToHttp().getRequest();
          const key = req.headers['admin-api-key'];
          if (key) {
            req.admin = { id: 'test-admin-1', email: 'admin@test.com' };
            return true;
          }
          throw new UnauthorizedException('Admin API key is required');
        },
      })
      .compile();

    prisma = moduleRef.get<PrismaService>(PrismaService);
    await prisma.$connect();

    userBalanceRepository = moduleRef.get<UserBalancePortRepository>(
      UserBalancePortRepository,
    );
    balanceResultRepository = moduleRef.get<BalanceResultPortRepository>(
      BalanceResultPortRepository,
    );

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v2');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: false,
        transform: true,
        forbidNonWhitelisted: false,
        transformOptions: {
          enableImplicitConversion: true,
        },
        skipMissingProperties: false,
      }),
      new ZodValidationPipe(),
    );
    app.useGlobalFilters(new ZodExceptionFilter(), new HttpExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    await moduleRef.close();
  });

  beforeEach(async () => {
    await prisma.fiatBalanceLedger.deleteMany({});
    await prisma.userBalance.deleteMany({});
    await prisma.cryptoBalanceResult.deleteMany({});
    await prisma.bonusBalanceResult.deleteMany({});
    await prisma.fiatBalanceResult.deleteMany({});
  });

  const createTestUserBalance = async (
    userId: string,
    fiatAmount: number = 100000,
    bonusAmount: number = 50000,
  ) => {
    const userIdBigNumber = stringToBigNumber(userId);

    const fiatBalance = await balanceResultRepository.create(
      {
        userId: userIdBigNumber,
        balance: BalanceAmount.fromUnit(fiatAmount),
        currencyIsoCode: CurrencyCode.USD,
      },
      CurrencyType.FIAT,
    );

    const bonusBalance = await balanceResultRepository.create(
      {
        userId: userIdBigNumber,
        balance: BalanceAmount.fromUnit(bonusAmount),
        currencyIsoCode: CurrencyCode.USD,
      },
      CurrencyType.BONUS,
    );

    const cryptoBalance = await balanceResultRepository.create(
      {
        userId: userIdBigNumber,
        balance: BalanceAmount.fromUnit(0),
        currencyIsoCode: CurrencyCode.USD,
      },
      CurrencyType.CRYPTO,
    );

    await userBalanceRepository.create({
      userId: userIdBigNumber,
      fiatBalanceId: fiatBalance.id,
      bonusBalanceId: bonusBalance.id,
      cryptoBalanceId: cryptoBalance.id,
    });
  };

  describe('POST /admin/balance/increase', () => {
    it('should require AdminApiKeyGuard authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v2/admin/balance/increase')
        .send({ userId: '1', amount: '10000' })
        .expect(401);

      expect(response.body).toHaveProperty('statusCode', 401);
    });

    it('should increase fiat balance with valid admin API key', async () => {
      const userId = '100';
      await createTestUserBalance(userId, 50000, 0);

      const response = await request(app.getHttpServer())
        .post('/api/v2/admin/balance/increase')
        .set('admin-api-key', adminApiKey)
        .send({ userId, amount: '10000' })
        .expect(200);

      expect(response.body).toHaveProperty('statusCode', 200);
      expect(response.body.data).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('ledgerEntryId');
      expect(typeof response.body.data.ledgerEntryId).toBe('string');

      const fiatResult = await prisma.fiatBalanceResult.findUnique({
        where: { userId: BigInt(userId) },
      });
      expect(fiatResult).toBeDefined();
      expect(fiatResult!.balance.toString()).toBe('60000');
    });

    it('should return 400 when validation fails', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v2/admin/balance/increase')
        .set('admin-api-key', adminApiKey)
        .send({ userId: 'invalid', amount: '10000' })
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('should be idempotent when operationId is provided', async () => {
      const userId = '101';
      await createTestUserBalance(userId, 10000, 0);
      const operationId = 'admin-increase-idempotent-test-1';

      const response1 = await request(app.getHttpServer())
        .post('/api/v2/admin/balance/increase')
        .set('admin-api-key', adminApiKey)
        .send({ userId, amount: '5000', operationId })
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .post('/api/v2/admin/balance/increase')
        .set('admin-api-key', adminApiKey)
        .send({ userId, amount: '5000', operationId })
        .expect(200);

      expect(response1.body.data.ledgerEntryId).toBe(
        response2.body.data.ledgerEntryId,
      );

      const fiatResult = await prisma.fiatBalanceResult.findUnique({
        where: { userId: BigInt(userId) },
      });
      expect(fiatResult!.balance.toString()).toBe('15000');
    });
  });
});
