import { Controller, Get } from '@nestjs/common';

@Controller('local-orchestrator')
export class LocalOrchestratorHttpController {
  @Get('health')
  health(): { ok: boolean } {
    return { ok: true };
  }
}
