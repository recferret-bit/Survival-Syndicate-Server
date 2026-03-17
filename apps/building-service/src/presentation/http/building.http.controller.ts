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
import { GetBuildingsQuery } from '@app/building-service/application/use-cases/get-buildings/get-buildings.query';
import {
  type GetBuildingsResponseDto,
  GetBuildingsResponseHttpDto,
} from '@app/building-service/application/use-cases/get-buildings/get-buildings.dto';

interface RequestWithSession extends Request {
  session?: UserSession;
}

@Controller('characters')
@ApiTags('Buildings')
export class BuildingHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':characterId/buildings')
  @UseGuards(AuthJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get character buildings (stub)' })
  @ApiParam({ name: 'characterId', description: 'Character ID' })
  @ApiResponse({ status: 200, type: GetBuildingsResponseHttpDto })
  async getBuildings(
    @Req() _req: RequestWithSession,
    @Param('characterId') characterId: string,
  ): Promise<GetBuildingsResponseDto> {
    return this.queryBus.execute(new GetBuildingsQuery(characterId));
  }
}
