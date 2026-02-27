import { Controller, Get } from '@nestjs/common';

@Controller('matchmaking')
export class MatchmakingHttpController {
  @Get('health')
  health(): { ok: boolean } {
    return { ok: true };
  }
}
