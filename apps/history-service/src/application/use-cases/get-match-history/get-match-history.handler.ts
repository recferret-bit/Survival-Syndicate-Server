import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMatchHistoryQuery } from './get-match-history.query';
import {
  type GetMatchHistoryResponseDto,
  GetMatchHistoryResponseSchema,
} from './get-match-history.dto';
import { MatchHistoryPortRepository } from '@app/history-service/application/ports/match-history.port.repository';

@QueryHandler(GetMatchHistoryQuery)
export class GetMatchHistoryHandler
  implements IQueryHandler<GetMatchHistoryQuery, GetMatchHistoryResponseDto>
{
  constructor(
    private readonly matchHistoryRepository: MatchHistoryPortRepository,
  ) {}

  async execute(
    query: GetMatchHistoryQuery,
  ): Promise<GetMatchHistoryResponseDto> {
    const matchHistory = await this.matchHistoryRepository.findByMatchId(
      query.matchId,
    );

    const result = {
      matchHistory: matchHistory
        ? {
            id: matchHistory.id,
            matchId: matchHistory.matchId,
            finishedAt: matchHistory.finishedAt.toISOString(),
          }
        : null,
    };

    return GetMatchHistoryResponseSchema.parse(result);
  }
}
