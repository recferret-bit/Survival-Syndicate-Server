import {
  SerializedException,
  SerializedExceptionForResponse,
  TraceIdService,
} from './core-exception.types';

export abstract class CoreException extends Error {
  abstract readonly statusCode: number | string;
  abstract readonly errorCode: string;

  protected traceIdService?: TraceIdService;
  public override cause?: unknown;

  protected constructor(params?: {
    message?: string | number;
    cause?: unknown;
    traceIdService?: TraceIdService;
  }) {
    if (!params) {
      params = {};
    }

    const { cause, traceIdService } = params;
    let { message } = params;

    if (!message) {
      if (cause instanceof Error) {
        message = cause.message;
      } else {
        message = 'An error occurred';
      }
    }

    if (typeof message === 'number') {
      message = String(message);
    }

    super(message);

    this.message = message;

    if (cause && cause instanceof Error) {
      this.stack = cause.stack;
      this.cause = cause;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }

    if (traceIdService) {
      this.traceIdService = traceIdService;
    }
  }

  setTraceIdService(traceIdService: TraceIdService) {
    this.traceIdService = traceIdService;
  }

  toJSON(): SerializedException {
    return {
      traceId: this.traceIdService?.getTraceId(),
      message: String(this.message),
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      stack: this.stack,
      cause: this.cause ? JSON.stringify(this.cause) : undefined,
    };
  }

  toResponse(): SerializedExceptionForResponse {
    return {
      traceId: this.traceIdService?.getTraceId(),
      message: String(this.message),
      statusCode: this.statusCode,
      errorCode: this.errorCode,
    };
  }
}
