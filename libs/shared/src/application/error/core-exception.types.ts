export interface SerializedException {
  message: string;
  statusCode: string | number;
  errorCode: string;
  traceId?: string;
  stack?: string;
  cause?: string;
  validationErrors?: Record<string, string[] | undefined>;
}

export interface SerializedExceptionForResponse {
  message: string;
  statusCode: string | number;
  errorCode: string;
  traceId?: string;
  validationErrors?: Record<string, string[] | undefined>;
}

export interface TraceIdService {
  getTraceId(): string | undefined;
}
