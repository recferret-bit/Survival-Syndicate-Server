export enum WsErrorType {
  Authenticate = 'authenticate_error',
  Reconnect = 'reconnect_error',
  Generic = 'error',
}

export enum WsErrorCode {
  InvalidPayload = 'INVALID_PAYLOAD',
  Unauthorized = 'UNAUTHORIZED',
  SlotNotAvailable = 'SLOT_NOT_AVAILABLE',
  GraceExpired = 'GRACE_EXPIRED',
  MatchNotFound = 'MATCH_NOT_FOUND',
}
