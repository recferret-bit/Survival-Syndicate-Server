import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ZoneRegistryPort } from '@app/matchmaking-service/application/ports/zone-registry.port';
import { UpsertZoneHeartbeatCommand } from './upsert-zone-heartbeat.command';

@CommandHandler(UpsertZoneHeartbeatCommand)
export class UpsertZoneHeartbeatHandler
  implements ICommandHandler<UpsertZoneHeartbeatCommand>
{
  constructor(private readonly zoneRegistry: ZoneRegistryPort) {}

  async execute(command: UpsertZoneHeartbeatCommand): Promise<void> {
    await this.zoneRegistry.upsertHeartbeat(command.event);
  }
}
