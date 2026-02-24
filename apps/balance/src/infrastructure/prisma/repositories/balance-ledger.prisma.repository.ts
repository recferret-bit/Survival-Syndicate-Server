import BigNumber from 'bignumber.js';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BalanceLedgerPortRepository } from '@app/balance/application/ports/balance-ledger.port.repository';
import { BalanceLedgerEntry } from '@app/balance/domain/entities/balance-ledger-entry/balance-ledger-entry';
import { CreateBalanceLedgerEntry } from '@app/balance/domain/entities/balance-ledger-entry/balance-ledger-entry.type';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';
import { BalanceLedgerPrismaMapper } from '@app/balance/infrastructure/prisma/mapper/balance-ledger.prisma.mapper';

@Injectable()
export class BalanceLedgerPrismaRepository extends BalanceLedgerPortRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  private getLedgerModel(currencyType: CurrencyType) {
    switch (currencyType) {
      case CurrencyType.FIAT:
        return this.prisma.fiatBalanceLedger;
      case CurrencyType.BONUS:
        return this.prisma.bonusBalanceLedger;
      case CurrencyType.CRYPTO:
        return this.prisma.cryptoBalanceLedger;
      default:
        throw new Error(`Unsupported currency type: ${currencyType}`);
    }
  }

  async create(
    data: CreateBalanceLedgerEntry,
    currencyType: CurrencyType,
  ): Promise<BalanceLedgerEntry> {
    const model = this.getLedgerModel(currencyType);
    const prismaData = BalanceLedgerPrismaMapper.toPrisma(data, currencyType);

    const entity = await (model as any).create({
      data: prismaData,
    });

    return BalanceLedgerPrismaMapper.toDomain(entity, currencyType);
  }

  async findByOperationId(
    userId: BigNumber,
    operationId: string,
    currencyType: CurrencyType,
  ): Promise<BalanceLedgerEntry | null> {
    const model = this.getLedgerModel(currencyType);
    const userIdBigint = BigInt(userId.toString());

    const entity = await (model as any).findUnique({
      where: {
        userId_operationId: {
          userId: userIdBigint,
          operationId,
        },
      },
    });

    return entity
      ? BalanceLedgerPrismaMapper.toDomain(entity, currencyType)
      : null;
  }

  async findByUserId(
    userId: BigNumber,
    currencyType: CurrencyType,
    limit?: number,
    offset?: number,
  ): Promise<BalanceLedgerEntry[]> {
    const model = this.getLedgerModel(currencyType);
    const userIdBigint = BigInt(userId.toString());

    const entities = await (model as any).findMany({
      where: { userId: userIdBigint },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
    });

    return entities.map((entity) =>
      BalanceLedgerPrismaMapper.toDomain(entity, currencyType),
    );
  }

  async findAfterLedgerId(
    userId: BigNumber,
    currencyType: CurrencyType,
    lastLedgerId: string,
    limit: number = 1000,
  ): Promise<BalanceLedgerEntry[]> {
    const model = this.getLedgerModel(currencyType);
    const userIdBigint = BigInt(userId.toString());

    // First, get the last ledger entry to get its createdAt timestamp
    const lastEntry = await (model as any).findUnique({
      where: { id: lastLedgerId },
      select: { createdAt: true },
    });

    if (!lastEntry) {
      throw new Error(`Ledger entry with id ${lastLedgerId} not found`);
    }

    // Find all entries for this user created after the last entry's timestamp
    const entities = await (model as any).findMany({
      where: {
        userId: userIdBigint,
        createdAt: {
          gt: lastEntry.createdAt,
        },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return entities.map((entity) =>
      BalanceLedgerPrismaMapper.toDomain(entity, currencyType),
    );
  }

  async countByUserId(
    userId: BigNumber,
    currencyType: CurrencyType,
  ): Promise<number> {
    const model = this.getLedgerModel(currencyType);
    const userIdBigint = BigInt(userId.toString());

    return (model as any).count({
      where: { userId: userIdBigint },
    });
  }
}
