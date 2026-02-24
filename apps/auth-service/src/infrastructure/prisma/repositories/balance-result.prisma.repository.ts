import BigNumber from 'bignumber.js';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BalanceResultPortRepository } from '@app/balance/application/ports/balance-result.port.repository';
import { BalanceResult } from '@app/balance/domain/entities/balance-result/balance-result';
import {
  CreateBalanceResult,
  UpdateBalanceResult,
} from '@app/balance/domain/entities/balance-result/balance-result.type';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';
import { BalanceResultPrismaMapper } from '@app/balance/infrastructure/prisma/mapper/balance-result.prisma.mapper';

@Injectable()
export class BalanceResultPrismaRepository extends BalanceResultPortRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  private getResultModel(currencyType: CurrencyType) {
    switch (currencyType) {
      case CurrencyType.FIAT:
        return this.prisma.fiatBalanceResult;
      case CurrencyType.BONUS:
        return this.prisma.bonusBalanceResult;
      case CurrencyType.CRYPTO:
        return this.prisma.cryptoBalanceResult;
      default:
        throw new Error(`Unsupported currency type: ${currencyType}`);
    }
  }

  async create(
    data: CreateBalanceResult,
    currencyType: CurrencyType,
  ): Promise<BalanceResult> {
    const model = this.getResultModel(currencyType);
    const prismaData = BalanceResultPrismaMapper.toPrismaCreate(data);

    const entity = await (model as any).create({
      data: prismaData,
    });

    return BalanceResultPrismaMapper.toDomain(entity);
  }

  async findByUserId(
    userId: BigNumber,
    currencyType: CurrencyType,
  ): Promise<BalanceResult | null> {
    const model = this.getResultModel(currencyType);
    const userIdBigint = BigInt(userId.toString());

    const entity = await (model as any).findUnique({
      where: { userId: userIdBigint },
    });

    return entity ? BalanceResultPrismaMapper.toDomain(entity) : null;
  }

  async update(
    userId: BigNumber,
    currencyType: CurrencyType,
    data: UpdateBalanceResult,
  ): Promise<BalanceResult> {
    const model = this.getResultModel(currencyType);
    const prismaData = BalanceResultPrismaMapper.toPrismaUpdate(data);
    const userIdBigint = BigInt(userId.toString());

    const entity = await (model as any).update({
      where: { userId: userIdBigint },
      data: prismaData,
    });

    return BalanceResultPrismaMapper.toDomain(entity);
  }

  async upsert(
    userId: BigNumber,
    currencyType: CurrencyType,
    createData: CreateBalanceResult,
    updateData: UpdateBalanceResult,
  ): Promise<BalanceResult> {
    const model = this.getResultModel(currencyType);
    const createPrismaData =
      BalanceResultPrismaMapper.toPrismaCreate(createData);
    const updatePrismaData =
      BalanceResultPrismaMapper.toPrismaUpdate(updateData);
    const userIdBigint = BigInt(userId.toString());

    const entity = await (model as any).upsert({
      where: { userId: userIdBigint },
      create: createPrismaData,
      update: updatePrismaData,
    });

    return BalanceResultPrismaMapper.toDomain(entity);
  }
}
