import BigNumber from 'bignumber.js';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserBalancePortRepository } from '@app/auth-service/application/ports/user-balance.port.repository';
import { UserBalance } from '@app/auth-service/domain/entities/user-balance/user-balance';
import { CreateUserBalance } from '@app/auth-service/domain/entities/user-balance/user-balance.type';
import { UserBalancePrismaMapper } from '../mapper/user-balance.prisma.mapper';
import { Prisma } from '@prisma/catalog';

@Injectable()
export class UserBalancePrismaRepository extends UserBalancePortRepository {
  private readonly repository: PrismaService['userBalance'];

  constructor(private prisma: PrismaService) {
    super();
    this.repository = prisma.userBalance;
  }

  async findByUserId(userId: BigNumber): Promise<UserBalance | null> {
    const userIdBigint = BigInt(userId.toString());
    const result = await this.repository.findUnique({
      where: { userId: userIdBigint },
      include: {
        fiatBalance: true,
        bonusBalance: true,
        cryptoBalance: true,
      },
    });

    if (!result) {
      return null;
    }

    return UserBalancePrismaMapper.toDomain(result);
  }

  async create(data: CreateUserBalance): Promise<UserBalance> {
    const prismaData: Prisma.UserBalanceUncheckedCreateInput =
      UserBalancePrismaMapper.toPrisma(data);

    const result = await this.repository.create({
      data: prismaData,
      include: {
        fiatBalance: true,
        bonusBalance: true,
        cryptoBalance: true,
      },
    });

    return UserBalancePrismaMapper.toDomain(result);
  }

  async exists(userId: BigNumber): Promise<boolean> {
    const userIdBigint = BigInt(userId.toString());
    const count = await this.repository.count({
      where: { userId: userIdBigint },
    });

    return count > 0;
  }
}
