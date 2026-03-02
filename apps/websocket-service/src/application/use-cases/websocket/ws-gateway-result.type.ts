export type WsGatewayResult = {
  response?: Record<string, unknown>;
  closeClient?: boolean;
  notifyClientIds?: string[];
  notifyPayload?: Record<string, unknown>;
  selfPayloads?: Record<string, unknown>[];
};
