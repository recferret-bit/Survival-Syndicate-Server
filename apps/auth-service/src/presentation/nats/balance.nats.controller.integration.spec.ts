import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@app/balance/app.module';
import { BalancePublisher, BalanceSubjects } from '@lib/lib-balance';
import type {
  CreateUserBalanceRequest,
  CreateUserBalanceResponse,
} from '@lib/lib-balance';
import { PrismaService } from '@app/balance/infrastructure/prisma/prisma.service';
import { CurrencyCode } from '@lib/shared/currency';
import { stringToBigNumber } from '@lib/shared';

describe('BalanceNatsController (Integration)', () => {
  let app: INestApplication;
  let balancePublisher: BalancePublisher;
  let prisma: PrismaService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    // Requires: docker-compose up -d nats-1 nats-2 nats-3 postgres
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    balancePublisher = app.get(BalancePublisher);
    prisma = app.get(PrismaService);
    await prisma.$connect();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    await moduleRef.close();
  });

  beforeEach(async () => {
    // Clean test data before each test
    // Order matters due to foreign key constraints
    await prisma.balanceLedgerEntry.deleteMany({});
    await prisma.cryptoBalanceResult.deleteMany({});
    await prisma.bonusBalanceResult.deleteMany({});
    await prisma.fiatBalanceResult.deleteMany({});
    await prisma.userBalance.deleteMany({});
  });

  describe('handleCreateUserBalance', () => {
    it('should create user balance via real NATS using publisher', async () => {
      const request: CreateUserBalanceRequest = {
        userId: '1',
        currencyIsoCodes: [CurrencyCode.USD],
      };

      // Sends message through real NATS.io
      const response: CreateUserBalanceResponse =
        await balancePublisher.createUserBalance(request);

      // Verify response
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.userId).toBe('1');

      // Verify database state
      const userIdBigNumber = stringToBigNumber('1');
      const userBalance = await prisma.userBalance.findFirst({
        where: {
          userId: BigInt(userIdBigNumber.toString()),
        },
        include: {
          fiatBalance: true,
          bonusBalance: true,
          cryptoBalance: true,
        },
      });

      expect(userBalance).toBeDefined();
      expect(userBalance?.fiatBalance).toBeDefined();
      expect(userBalance?.bonusBalance).toBeDefined();
      expect(userBalance?.cryptoBalance).toBeDefined();
      expect(userBalance?.fiatBalance.currencyIsoCode).toBe(CurrencyCode.USD);
      expect(userBalance?.bonusBalance.currencyIsoCode).toBe(CurrencyCode.USD);
      expect(userBalance?.cryptoBalance.currencyIsoCode).toBe(CurrencyCode.USD);
    });

    it('should create user balance with multiple currencies', async () => {
      const request: CreateUserBalanceRequest = {
        userId: '2',
        currencyIsoCodes: [CurrencyCode.USD, CurrencyCode.EUR],
      };

      const response: CreateUserBalanceResponse =
        await balancePublisher.createUserBalance(request);

      expect(response.success).toBe(true);
      expect(response.userId).toBe('2');

      // Verify database state
      const userIdBigNumber = stringToBigNumber('2');
      const userBalance = await prisma.userBalance.findFirst({
        where: {
          userId: BigInt(userIdBigNumber.toString()),
        },
        include: {
          fiatBalance: true,
          bonusBalance: true,
          cryptoBalance: true,
        },
      });

      expect(userBalance).toBeDefined();
      // Primary currency (first in array) should be USD
      expect(userBalance?.fiatBalance.currencyIsoCode).toBe(CurrencyCode.USD);
    });

    it('should reject request with empty currencyIsoCodes array', async () => {
      const invalidRequest = {
        userId: '3',
        currencyIsoCodes: [], // Invalid: must have at least one
      };

      await expect(
        balancePublisher.createUserBalance(
          invalidRequest as CreateUserBalanceRequest,
        ),
      ).rejects.toThrow();
    });

    it('should reject request with missing currencyIsoCodes', async () => {
      const invalidRequest = {
        userId: '4',
        // Missing currencyIsoCodes
      };

      await expect(
        balancePublisher.createUserBalance(
          invalidRequest as CreateUserBalanceRequest,
        ),
      ).rejects.toThrow();
    });

    it('should reject request with invalid userId format', async () => {
      const invalidRequest: CreateUserBalanceRequest = {
        userId: '-1', // Invalid: must be positive
        currencyIsoCodes: [CurrencyCode.USD],
      };

      await expect(
        balancePublisher.createUserBalance(invalidRequest),
      ).rejects.toThrow();
    });

    it('should use correct NATS subject from BalanceSubjects', () => {
      // Verify the subject constant is exported correctly
      expect(BalanceSubjects.CREATE_USER_BALANCE).toBe(
        'balance.create-user-balance.v1',
      );
    });
  });
});
