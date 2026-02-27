import { Controller, Get } from '@nestjs/common';

@Controller('gameplay')
export class GameplayHttpController {
  @Get('health')
  health(): { ok: boolean } {
    return { ok: true };
  }
}
