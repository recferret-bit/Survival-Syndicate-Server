import { Injectable } from '@nestjs/common';
import { stringToBigNumber } from '@lib/shared';
import { PlayerPortRepository } from '@app/player-service/application/ports/player.port.repository';
import { Player } from '@app/player-service/domain/entities/player/player';
import { CreatePlayer } from '@app/player-service/domain/entities/player/player.type';
import { PrismaService } from '@app/player-service/infrastructure/prisma/prisma.service';
import { PlayerPrismaMapper } from '@app/player-service/infrastructure/prisma/mapper/player.prisma.mapper';

@Injectable()
export class PlayerPrismaRepository extends PlayerPortRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: CreatePlayer): Promise<Player> {
    const entity = await this.prisma.player.create({
      data: PlayerPrismaMapper.toPrismaCreate(data),
    });
    return PlayerPrismaMapper.toDomain(entity);
  }

  async findById(playerId: string): Promise<Player | null> {
    const entity = await this.prisma.player.findUnique({
      where: { id: BigInt(playerId) },
    });
    return entity ? PlayerPrismaMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Player | null> {
    const entity = await this.prisma.player.findUnique({
      where: { userId: BigInt(userId) },
    });
    return entity ? PlayerPrismaMapper.toDomain(entity) : null;
  }
}
