import { Controller, Get } from '@nestjs/common';

@Controller('websocket')
export class WebsocketHttpController {
  @Get('health')
  health(): { ok: boolean } {
    return { ok: true };
  }
}
