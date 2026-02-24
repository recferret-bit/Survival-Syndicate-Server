import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import request from 'supertest';
import { AppModule } from '@app/balance/app.module';
import { AuthJwtService, UserSession } from '@lib/shared/auth';
import { CurrencyCode } from '@lib/shared/currency';
import {
  ZodExceptionFilter,
  HttpExceptionsFilter,
} from '@lib/shared/application';
import { PrismaService } from '@app/balance/infrastructure/prisma/prisma.service';
import { UserBalancePortRepository } from '@app/balance/application/ports/user-balance.port.repository';
import { BalanceResultPortRepository } from '@app/balance/application/ports/balance-result.port.repository';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';
import { BalanceAmount } from '@app/balance/domain/value-objects/balance-amount';
import { stringToBigNumber } from '@lib/shared';

describe('BalanceHttpController (Integration)', () => {
  let app: INestApplication;
  let authJwtService: AuthJwtService;
  let prisma: PrismaService;
  let moduleRef: TestingModule;
  let userBalanceRepository: UserBalancePortRepository;
  let balanceResultRepository: BalanceResultPortRepository;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get<PrismaService>(PrismaService);
    await prisma.$connect();

    userBalanceRepository = moduleRef.get<UserBalancePortRepository>(
      UserBalancePortRepository,
    );
    balanceResultRepository = moduleRef.get<BalanceResultPortRepository>(
      BalanceResultPortRepository,
    );
    authJwtService = moduleRef.get<AuthJwtService>(AuthJwtService);

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
    // Register ZodExceptionFilter before HttpExceptionsFilter to catch Zod errors first
    app.useGlobalFilters(new ZodExceptionFilter(), new HttpExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    await moduleRef.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    // Order matters due to foreign key constraints
    await prisma.userBalance.deleteMany({});
    await prisma.cryptoBalanceResult.deleteMany({});
    await prisma.bonusBalanceResult.deleteMany({});
    await prisma.fiatBalanceResult.deleteMany({});
  });

  const generateToken = async (userId: string | number): Promise<string> => {
    const session: UserSession = {
      id: String(userId),
      email: 'test@example.com',
      phone: '+1234567890',
      currencyCode: CurrencyCode.USD,
      geo: 'USA',
      createdAt: Date.now(),
      isTestUser: false,
    };
    return authJwtService.generateToken(session);
  };

  const createTestUserBalance = async (
    userId: string,
    fiatAmount: number = 100000,
    bonusAmount: number = 50000,
  ) => {
    const userIdBigNumber = stringToBigNumber(userId);

    // Create balance results
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

    // Create user balance aggregate
    await userBalanceRepository.create({
      userId: userIdBigNumber,
      fiatBalanceId: fiatBalance.id,
      bonusBalanceId: bonusBalance.id,
      cryptoBalanceId: cryptoBalance.id,
    });
  };

  describe('GET /balance', () => {
    it('should reject request without JWT token', async () => {
      await request(app.getHttpServer()).get('/api/v2/balance').expect(401);
    });

    it('should reject request with invalid JWT token', async () => {
      await request(app.getHttpServer())
        .get('/api/v2/balance')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });

    it('should return 404 when user balance does not exist', async () => {
      const userId = '999';
      const token = await generateToken(userId);

      await request(app.getHttpServer())
        .get('/api/v2/balance')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should get balance with valid JWT token', async () => {
      const userId = '1';
      await createTestUserBalance(userId, 100000, 50000);
      const token = await generateToken(userId);

      const response = await request(app.getHttpServer())
        .get('/api/v2/balance')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('balances');
      expect(Array.isArray(response.body.balances)).toBe(true);
      expect(response.body.balances.length).toBeGreaterThanOrEqual(2);

      // Verify balance structure
      const fiatBalance = response.body.balances.find(
        (b: any) => b.currencyType === CurrencyType.FIAT,
      );
      expect(fiatBalance).toBeDefined();
      expect(fiatBalance.currencyIsoCode).toBe(CurrencyCode.USD);
      expect(fiatBalance.balance).toBe('100000');
      expect(fiatBalance.balanceDecimal).toBe(1000.0);

      const bonusBalance = response.body.balances.find(
        (b: any) => b.currencyType === CurrencyType.BONUS,
      );
      expect(bonusBalance).toBeDefined();
      expect(bonusBalance.currencyIsoCode).toBe(CurrencyCode.USD);
      expect(bonusBalance.balance).toBe('50000');
      expect(bonusBalance.balanceDecimal).toBe(500.0);
    });

    it('should return balance for authenticated user with correct structure', async () => {
      const userId = '2';
      await createTestUserBalance(userId, 200000, 75000);
      const token = await generateToken(userId);

      const response = await request(app.getHttpServer())
        .get('/api/v2/balance')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.balances).toBeDefined();
      expect(Array.isArray(response.body.balances)).toBe(true);
      // Should have at least FIAT and BONUS balances, and optionally CRYPTO
      expect(response.body.balances.length).toBeGreaterThanOrEqual(2);
      expect(response.body.balances.length).toBeLessThanOrEqual(3);

      // Verify all balances have required fields
      response.body.balances.forEach((balance: any) => {
        expect(balance).toHaveProperty('currencyIsoCode');
        expect(balance).toHaveProperty('balance');
        expect(balance).toHaveProperty('balanceDecimal');
        expect(balance).toHaveProperty('currencyType');
        expect(typeof balance.currencyIsoCode).toBe('string');
        expect(typeof balance.balance).toBe('string');
        expect(typeof balance.balanceDecimal).toBe('number');
        expect(Object.values(CurrencyType)).toContain(balance.currencyType);
      });
    });
  });
});
