import { WsErrorCode } from '@lib/lib-websocket/enum';
import { OrchestratorPlayerReconnectResponse } from '@lib/lib-websocket/schemas/websocket.schemas';

type OrchestratorReconnectErrorStatus = Exclude<
  OrchestratorPlayerReconnectResponse['status'],
  'success'
>;

const ORCHESTRATOR_RECONNECT_ERROR_CODE_MAP: Record<
  OrchestratorReconnectErrorStatus,
  WsErrorCode
> = {
  [WsErrorCode.SlotNotAvailable]: WsErrorCode.SlotNotAvailable,
  [WsErrorCode.GraceExpired]: WsErrorCode.GraceExpired,
  [WsErrorCode.MatchNotFound]: WsErrorCode.MatchNotFound,
};

export const mapReconnectStatusToErrorCode = (
  status: OrchestratorReconnectErrorStatus,
): WsErrorCode => {
  return ORCHESTRATOR_RECONNECT_ERROR_CODE_MAP[status];
};
