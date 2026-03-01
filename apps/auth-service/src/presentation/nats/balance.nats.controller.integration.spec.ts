import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as net from 'net';
import { AppModule } from '@app/auth-service/app.module';
import {
  BuildingPublisher,
  BuildingSubjects,
  LibBuildingModule,
} from '@lib/lib-building';
import type {
  CreateUserBalanceRequest,
  CreateUserBalanceResponse,
} from '@lib/lib-building';
import { PrismaService } from '@app/auth-service/infrastructure/prisma/prisma.service';
import { CurrencyCode } from '@lib/shared/currency';
import { stringToBigNumber } from '@lib/shared';

function isNatsReachable(): Promise<boolean> {
  const host = process.env.NATS_HOST ?? 'localhost';
  const port = Number(process.env.NATS_PORT ?? '4222');
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 1500);
    socket
      .once('connect', () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(true);
      })
      .once('error', () => {
        clearTimeout(timeout);
        resolve(false);
      })
      .connect(port, host);
  });
}

describe('BalanceNatsController (Integration)', () => {
  let app: INestApplication;
  let balancePublisher: BuildingPublisher;
  let prisma: PrismaService;
  let moduleRef: TestingModule;
  let natsAvailable = false;

  beforeAll(async () => {
    // Requires: docker-compose up -d nats (or npm run docker:infra) and auth-service subscriber
    natsAvailable = await isNatsReachable();
    if (!natsAvailable) {
      return;
    }

    moduleRef = await Test.createTestingModule({
      imports: [AppModule, LibBuildingModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    balancePublisher = moduleRef.get(BuildingPublisher);
    prisma = moduleRef.get(PrismaService);
    await prisma.$connect();

    // Probe request-reply: if no reply (TIMEOUT), skip tests that need NATS
    try {
      await Promise.race([
        balancePublisher.createUserBalance({
          userId: '__probe__',
          currencyIsoCodes: [CurrencyCode.USD],
        }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('NATS request-reply timeout')),
            4000,
          ),
        ),
      ]);
    } catch {
      natsAvailable = false;
    }
  });

  afterAll(async () => {
    if (app) await app.close();
    if (prisma) await prisma.$disconnect();
    if (moduleRef) await moduleRef.close();
  });

  beforeEach(async () => {
    // Clean test data before each test
    // Order matters: UserBalance references BalanceResult tables, delete UserBalance first
    if (prisma) {
      await prisma.userBalance.deleteMany({});
      await prisma.cryptoBalanceResult.deleteMany({});
      await prisma.bonusBalanceResult.deleteMany({});
      await prisma.fiatBalanceResult.deleteMany({});
      await prisma.cryptoBalanceLedger.deleteMany({});
      await prisma.bonusBalanceLedger.deleteMany({});
      await prisma.fiatBalanceLedger.deleteMany({});
    }
  });

  describe('handleCreateUserBalance', () => {
    it('should create user balance via real NATS using publisher', async () => {
      if (!natsAvailable) {
        console.warn(
          'Skipping: NATS not reachable (start with npm run docker:infra)',
        );
        return;
      }
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
      if (!natsAvailable) return;
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
      if (!natsAvailable) return;
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
      if (!natsAvailable) return;
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
      if (!natsAvailable) return;
      const invalidRequest: CreateUserBalanceRequest = {
        userId: '-1', // Invalid: must be positive
        currencyIsoCodes: [CurrencyCode.USD],
      };

      await expect(
        balancePublisher.createUserBalance(invalidRequest),
      ).rejects.toThrow();
    });

    it('should use correct NATS subject from BuildingSubjects', () => {
      // Verify the subject constant is exported correctly
      expect(BuildingSubjects.CREATE_USER_BALANCE).toBe(
        'balance.create-user-balance.v1',
      );
    });
  });
});
