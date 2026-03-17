import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetMatchHistoryQuery } from '@app/history-service/application/use-cases/get-match-history/get-match-history.query';
import {
  type GetMatchHistoryResponseDto,
  GetMatchHistoryResponseHttpDto,
} from '@app/history-service/application/use-cases/get-match-history/get-match-history.dto';

@Controller('history')
@ApiTags('History')
export class HistoryHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':matchId')
  @ApiOperation({ summary: 'Get match history (stub)' })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({ status: 200, type: GetMatchHistoryResponseHttpDto })
  async getMatchHistory(
    @Param('matchId') matchId: string,
  ): Promise<GetMatchHistoryResponseDto> {
    return this.queryBus.execute(new GetMatchHistoryQuery(matchId));
  }
}
