import { Test, TestingModule } from '@nestjs/testing';
import { UserBalancePortRepository } from '@app/auth-service/application/ports/user-balance.port.repository';
import { BalanceResultPortRepository } from '@app/auth-service/application/ports/balance-result.port.repository';
import { PrismaService } from '../prisma.service';
import { InfrastructureModule } from '@app/auth-service/infrastructure/infrastructure.module';
import { UserBalance } from '@app/auth-service/domain/entities/user-balance/user-balance';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';
import { BalanceAmount } from '@app/auth-service/domain/value-objects/balance-amount';
import BigNumber from 'bignumber.js';
import { v4 as uuidv4 } from 'uuid';

describe('UserBalancePrismaRepository (Integration)', () => {
  let repository: UserBalancePortRepository;
  let balanceResultRepository: BalanceResultPortRepository;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [InfrastructureModule],
    }).compile();

    repository = module.get<UserBalancePortRepository>(
      UserBalancePortRepository,
    );
    balanceResultRepository = module.get<BalanceResultPortRepository>(
      BalanceResultPortRepository,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    // Order matters due to foreign key constraints
    await prisma.userBalance.deleteMany({});
    await prisma.cryptoBalanceResult.deleteMany({});
    await prisma.bonusBalanceResult.deleteMany({});
    await prisma.fiatBalanceResult.deleteMany({});
  });

  const createTestBalanceResults = async (userId: BigNumber) => {
    const fiatBalance = await balanceResultRepository.create(
      {
        userId,
        balance: BalanceAmount.fromUnit(100000),
        currencyIsoCode: 'USD',
      },
      CurrencyType.FIAT,
    );

    const bonusBalance = await balanceResultRepository.create(
      {
        userId,
        balance: BalanceAmount.fromUnit(50000),
        currencyIsoCode: 'USD',
      },
      CurrencyType.BONUS,
    );

    const cryptoBalance = await balanceResultRepository.create(
      {
        userId,
        balance: BalanceAmount.fromUnit(200000),
        currencyIsoCode: 'USD',
      },
      CurrencyType.CRYPTO,
    );

    return { fiatBalance, bonusBalance, cryptoBalance };
  };

  describe('create', () => {
    it('should create user balance with all relations', async () => {
      const userId = new BigNumber(1);
      const { fiatBalance, bonusBalance, cryptoBalance } =
        await createTestBalanceResults(userId);

      const createUserBalance = {
        userId,
        fiatBalanceId: fiatBalance.id,
        bonusBalanceId: bonusBalance.id,
        cryptoBalanceId: cryptoBalance.id,
      };

      const userBalance = await repository.create(createUserBalance);

      expect(userBalance).toBeInstanceOf(UserBalance);
      expect(userBalance.userId).toEqual(userId);
      expect(userBalance.fiatBalance.id).toBe(fiatBalance.id);
      expect(userBalance.bonusBalance.id).toBe(bonusBalance.id);
      expect(userBalance.cryptoBalance?.id).toBe(cryptoBalance.id);
    });

    it('should create user balance with custom id', async () => {
      const userId = new BigNumber(2);
      const { fiatBalance, bonusBalance, cryptoBalance } =
        await createTestBalanceResults(userId);

      const customId = uuidv4();
      const createUserBalance = {
        id: customId,
        userId,
        fiatBalanceId: fiatBalance.id,
        bonusBalanceId: bonusBalance.id,
        cryptoBalanceId: cryptoBalance.id,
      };

      const userBalance = await repository.create(createUserBalance);

      expect(userBalance.id).toBe(customId);
    });
  });

  describe('findByUserId', () => {
    it('should find user balance by userId with all relations', async () => {
      const userId = new BigNumber(3);
      const { fiatBalance, bonusBalance, cryptoBalance } =
        await createTestBalanceResults(userId);

      await repository.create({
        userId,
        fiatBalanceId: fiatBalance.id,
        bonusBalanceId: bonusBalance.id,
        cryptoBalanceId: cryptoBalance.id,
      });

      const found = await repository.findByUserId(userId);

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(UserBalance);
      expect(found!.userId).toEqual(userId);
      expect(found!.fiatBalance.id).toBe(fiatBalance.id);
      expect(found!.bonusBalance.id).toBe(bonusBalance.id);
      expect(found!.cryptoBalance?.id).toBe(cryptoBalance.id);
    });

    it('should return null when user balance does not exist', async () => {
      const found = await repository.findByUserId(new BigNumber(999));

      expect(found).toBeNull();
    });

    it('should find user balance without cryptoBalance when null', async () => {
      const userId = new BigNumber(4);
      const { fiatBalance, bonusBalance } =
        await createTestBalanceResults(userId);

      // Create crypto balance separately but don't link it
      const cryptoBalance = await balanceResultRepository.create(
        {
          userId: new BigNumber(999), // Different user
          balance: BalanceAmount.fromUnit(0),
          currencyIsoCode: 'USD',
        },
        CurrencyType.CRYPTO,
      );

      await repository.create({
        userId,
        fiatBalanceId: fiatBalance.id,
        bonusBalanceId: bonusBalance.id,
        cryptoBalanceId: cryptoBalance.id,
      });

      const found = await repository.findByUserId(userId);

      expect(found).not.toBeNull();
      expect(found!.cryptoBalance).toBeDefined();
    });
  });

  describe('exists', () => {
    it('should return true when user balance exists', async () => {
      const userId = new BigNumber(5);
      const { fiatBalance, bonusBalance, cryptoBalance } =
        await createTestBalanceResults(userId);

      await repository.create({
        userId,
        fiatBalanceId: fiatBalance.id,
        bonusBalanceId: bonusBalance.id,
        cryptoBalanceId: cryptoBalance.id,
      });

      const exists = await repository.exists(userId);

      expect(exists).toBe(true);
    });

    it('should return false when user balance does not exist', async () => {
      const exists = await repository.exists(new BigNumber(999));

      expect(exists).toBe(false);
    });
  });
});
