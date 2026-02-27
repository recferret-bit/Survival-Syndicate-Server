import { Prisma } from '@prisma/meta';
import { bigIntToBigNumber } from '@lib/shared';
import { Player } from '@app/player-service/domain/entities/player/player';
import { CreatePlayer } from '@app/player-service/domain/entities/player/player.type';

type PrismaPlayer = Prisma.PlayerGetPayload<{}>;

export class PlayerPrismaMapper {
  static toDomain(entity: PrismaPlayer): Player {
    return new Player({
      id: bigIntToBigNumber(entity.id),
      userId: bigIntToBigNumber(entity.userId),
      username: entity.username,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPrismaCreate(data: CreatePlayer): Prisma.PlayerUncheckedCreateInput {
    return {
      userId: BigInt(data.userId.toString()),
      username: data.username,
    };
  }
}
