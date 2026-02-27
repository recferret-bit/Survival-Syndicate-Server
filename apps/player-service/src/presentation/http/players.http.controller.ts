import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthJwtGuard, UserSession } from '@lib/shared/auth';
import { GetMyPlayerQuery } from '@app/player-service/application/use-cases/get-my-player/get-my-player.query';
import { GetPlayerResponseDto } from '@app/player-service/application/use-cases/get-player/get-player.dto';

interface RequestWithSession extends Request {
  session?: UserSession;
}

@Controller('players')
@ApiTags('Players')
export class PlayersHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('me')
  @UseGuards(AuthJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current player profile' })
  @ApiResponse({ status: 200, type: GetPlayerResponseDto })
  async me(@Req() req: RequestWithSession): Promise<GetPlayerResponseDto> {
    return this.queryBus.execute(new GetMyPlayerQuery(req.session!.id));
  }
}
