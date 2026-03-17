import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthJwtGuard, UserSession } from '@lib/shared/auth';
import { GetCombatProfileQuery } from '@app/combat-progress-service/application/use-cases/get-combat-profile/get-combat-profile.query';
import {
  type GetCombatProfileResponseDto,
  GetCombatProfileResponseHttpDto,
} from '@app/combat-progress-service/application/use-cases/get-combat-profile/get-combat-profile.dto';

interface RequestWithSession extends Request {
  session?: UserSession;
}

@Controller('characters')
@ApiTags('Combat Progress')
export class CombatProgressHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':characterId/combat')
  @UseGuards(AuthJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get character combat profile (stub)' })
  @ApiParam({ name: 'characterId', description: 'Character ID' })
  @ApiResponse({ status: 200, type: GetCombatProfileResponseHttpDto })
  async getCombatProfile(
    @Req() _req: RequestWithSession,
    @Param('characterId') characterId: string,
  ): Promise<GetCombatProfileResponseDto> {
    return this.queryBus.execute(new GetCombatProfileQuery(characterId));
  }
}
