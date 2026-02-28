import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HeartbeatService } from '@app/local-orchestrator/application/services/heartbeat.service';
import { HandleGameplayHeartbeatCommand } from './handle-gameplay-heartbeat.command';

@CommandHandler(HandleGameplayHeartbeatCommand)
export class HandleGameplayHeartbeatHandler
  implements ICommandHandler<HandleGameplayHeartbeatCommand>
{
  constructor(private readonly heartbeatService: HeartbeatService) {}

  async execute(command: HandleGameplayHeartbeatCommand): Promise<void> {
    this.heartbeatService.recordGameplayHeartbeat(command.event.serviceId);
  }
}
