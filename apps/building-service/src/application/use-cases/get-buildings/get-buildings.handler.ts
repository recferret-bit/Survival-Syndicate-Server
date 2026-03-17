import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBuildingsQuery } from './get-buildings.query';
import {
  type GetBuildingsResponseDto,
  GetBuildingsResponseSchema,
} from './get-buildings.dto';
import { BuildingPortRepository } from '@app/building-service/application/ports/building.port.repository';

const STUB_TOTAL_SLOTS = 8;

@QueryHandler(GetBuildingsQuery)
export class GetBuildingsHandler
  implements IQueryHandler<GetBuildingsQuery, GetBuildingsResponseDto>
{
  constructor(private readonly buildingRepository: BuildingPortRepository) {}

  async execute(query: GetBuildingsQuery): Promise<GetBuildingsResponseDto> {
    const buildings = await this.buildingRepository.findByCharacterId(
      query.characterId,
    );
    const usedSlots = buildings.length;

    const result = {
      buildings: buildings.map((b) => ({
        id: b.id,
        buildingId: b.buildingId,
        level: b.level,
        slot: b.slot,
        upgradedAt: b.upgradedAt.toISOString(),
      })),
      totalSlots: STUB_TOTAL_SLOTS,
      usedSlots,
    };

    return GetBuildingsResponseSchema.parse(result);
  }
}
