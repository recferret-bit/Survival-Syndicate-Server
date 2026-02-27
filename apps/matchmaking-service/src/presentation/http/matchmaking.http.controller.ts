import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Logger,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthJwtGuard, UserSession } from '@lib/shared/auth';
import { CreateLobbyCommand } from '@app/matchmaking-service/application/use-cases/create-lobby/create-lobby.command';
import {
  CreateLobbyHttpDto,
  LobbyResponseDto,
} from '@app/matchmaking-service/application/use-cases/create-lobby/create-lobby.dto';
import { JoinLobbyCommand } from '@app/matchmaking-service/application/use-cases/join-lobby/join-lobby.command';
import { LeaveLobbyCommand } from '@app/matchmaking-service/application/use-cases/leave-lobby/leave-lobby.command';
import { StartMatchCommand } from '@app/matchmaking-service/application/use-cases/start-match/start-match.command';
import { JoinSoloCommand } from '@app/matchmaking-service/application/use-cases/join-solo/join-solo.command';
import {
  JoinSoloHttpDto,
  JoinSoloResponseDto,
} from '@app/matchmaking-service/application/use-cases/join-solo/join-solo.dto';

interface RequestWithSession extends Request {
  session?: UserSession;
}

@Controller()
@ApiTags('Matchmaking')
@UseGuards(AuthJwtGuard)
@ApiBearerAuth()
export class MatchmakingHttpController {
  private readonly logger = new Logger(MatchmakingHttpController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post('lobbies/create')
  @HttpCode(200)
  @ApiOperation({ summary: 'Create lobby' })
  @ApiResponse({ status: 200, type: LobbyResponseDto })
  async createLobby(
    @Req() req: RequestWithSession,
    @Body() dto: CreateLobbyHttpDto,
  ): Promise<LobbyResponseDto> {
    return this.commandBus.execute(
      new CreateLobbyCommand(req.session!.id, dto),
    );
  }

  @Post('lobbies/:id/join')
  @HttpCode(200)
  @ApiOperation({ summary: 'Join lobby' })
  @ApiResponse({ status: 200, type: LobbyResponseDto })
  async joinLobby(
    @Req() req: RequestWithSession,
    @Param('id') lobbyId: string,
  ): Promise<LobbyResponseDto> {
    return this.commandBus.execute(
      new JoinLobbyCommand(lobbyId, req.session!.id),
    );
  }

  @Delete('lobbies/:id/leave')
  @HttpCode(200)
  @ApiOperation({ summary: 'Leave lobby' })
  @ApiResponse({ status: 200, type: LobbyResponseDto })
  async leaveLobby(
    @Req() req: RequestWithSession,
    @Param('id') lobbyId: string,
  ): Promise<LobbyResponseDto> {
    return this.commandBus.execute(
      new LeaveLobbyCommand(lobbyId, req.session!.id),
    );
  }

  @Post('lobbies/:id/start')
  @HttpCode(200)
  @ApiOperation({ summary: 'Start lobby match' })
  @ApiResponse({ status: 200, type: LobbyResponseDto })
  async startLobby(
    @Req() req: RequestWithSession,
    @Param('id') lobbyId: string,
  ): Promise<LobbyResponseDto> {
    return this.commandBus.execute(
      new StartMatchCommand(lobbyId, req.session!.id),
    );
  }

  @Post('matchmaking/join-solo')
  @HttpCode(200)
  @ApiOperation({ summary: 'Join solo matchmaking' })
  @ApiResponse({ status: 200, type: JoinSoloResponseDto })
  async joinSolo(
    @Req() req: RequestWithSession,
    @Body() _dto: JoinSoloHttpDto,
  ): Promise<JoinSoloResponseDto> {
    this.logger.log(`Solo matchmaking requested by player ${req.session!.id}`);
    return this.commandBus.execute(new JoinSoloCommand(req.session!.id));
  }
}
