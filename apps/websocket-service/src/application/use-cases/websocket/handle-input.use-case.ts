import { Injectable } from '@nestjs/common';
import { ConnectionManagerService } from '@app/websocket-service/application/services/connection-manager.service';
import { ClientInputSchema } from '@app/websocket-service/application/schemas/ws-messages.schema';
import { WsGatewayResult } from './ws-gateway-result.type';

type HandleInputInput = {
  clientId: string;
  payload: Record<string, unknown>;
};

@Injectable()
export class HandleInputUseCase {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  execute(input: HandleInputInput): WsGatewayResult {
    const info = this.connectionManager.get(input.clientId);
    if (!info) return {};

    ClientInputSchema.safeParse(input.payload);
    const sequenceNumber =
      typeof input.payload.sequenceNumber === 'number'
        ? input.payload.sequenceNumber
        : 0;

    return {
      response: {
        type: 'state',
        serverTick: 0,
        serverTimestamp: Date.now(),
        lastProcessedInput: sequenceNumber,
        entities_full: [],
        entities_delta: [],
        entities_removed: [],
        events: [],
      },
    };
  }
}
