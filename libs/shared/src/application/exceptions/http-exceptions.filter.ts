import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpErrorCode, HttpErrorType } from '@lib/shared/http';

const HTTP_ERROR_MAP: Record<
  number,
  { errorType: HttpErrorType; errorCode: HttpErrorCode }
> = {
  400: {
    errorType: HttpErrorType.BadRequest,
    errorCode: HttpErrorCode.InvalidArgument,
  },
  401: {
    errorType: HttpErrorType.Unauthorized,
    errorCode: HttpErrorCode.Unauthorized,
  },
  403: {
    errorType: HttpErrorType.Forbidden,
    errorCode: HttpErrorCode.Forbidden,
  },
  404: {
    errorType: HttpErrorType.NotFound,
    errorCode: HttpErrorCode.NotFound,
  },
  409: {
    errorType: HttpErrorType.Conflict,
    errorCode: HttpErrorCode.Conflict,
  },
  422: {
    errorType: HttpErrorType.Validation,
    errorCode: HttpErrorCode.ValidationError,
  },
  500: {
    errorType: HttpErrorType.InternalServerError,
    errorCode: HttpErrorCode.InternalServerError,
  },
  503: {
    errorType: HttpErrorType.ServiceUnavailable,
    errorCode: HttpErrorCode.ServiceUnavailable,
  },
};

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  private logger = new Logger(HttpExceptionsFilter.name);
  // private errorCodeToHttpStatusMap = new Map<ErrorCode, HttpStatus>([
  //   [ErrorCode.NotFound, HttpStatus.NOT_FOUND],
  //   [ErrorCode.InternalServerError, HttpStatus.INTERNAL_SERVER_ERROR],
  //   [ErrorCode.InvalidArgument, HttpStatus.BAD_REQUEST],
  //   [ErrorCode.AlreadyExists, HttpStatus.CONFLICT],
  // ]);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    this.logger.error(exception.name, exception.message);
    const exceptionResponse = exception.getResponse();
    let message = exception.message;
    let errors: Array<{ field: string; message: string }> | undefined;
    let details: unknown;
    let errorType: HttpErrorType | undefined;
    let errorCode: HttpErrorCode | undefined;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as Record<string, unknown>;

      if (Array.isArray(responseObj.message)) {
        const parsedErrors = responseObj.message.map((msg) => {
          const normalizedMessage = typeof msg === 'string' ? msg : String(msg);
          const colonIndex = normalizedMessage.indexOf(':');
          if (colonIndex > 0) {
            const field = normalizedMessage.substring(0, colonIndex).trim();
            const errorMessage = normalizedMessage
              .substring(colonIndex + 1)
              .trim();
            return { field, message: errorMessage };
          }
          return { field: 'unknown', message: normalizedMessage };
        });
        errors = parsedErrors;
        message =
          parsedErrors.length === 1
            ? parsedErrors[0].message
            : 'Validation failed';
        errorType = HttpErrorType.Validation;
        errorCode = HttpErrorCode.ValidationError;
      }

      if (Array.isArray(responseObj.errors)) {
        errors = responseObj.errors.map((errorItem) => {
          if (typeof errorItem === 'object' && errorItem !== null) {
            const candidate = errorItem as {
              field?: unknown;
              message?: unknown;
            };
            return {
              field: String(candidate.field ?? 'unknown'),
              message: String(candidate.message ?? errorItem),
            };
          }
          return { field: 'unknown', message: String(errorItem) };
        });
        message =
          typeof responseObj.message === 'string'
            ? responseObj.message
            : exception.message;
      }

      if (typeof responseObj.message === 'string') {
        message = responseObj.message;
      }
      if (typeof responseObj.errorMessage === 'string') {
        message = responseObj.errorMessage;
      }
      if (responseObj.details !== undefined) {
        details = responseObj.details;
      }
      if (typeof responseObj.errorType === 'string') {
        errorType = responseObj.errorType as HttpErrorType;
      }
      if (typeof responseObj.errorCode === 'string') {
        errorCode = responseObj.errorCode as HttpErrorCode;
      }
    }

    if (!errorType || !errorCode) {
      const fallback = HTTP_ERROR_MAP[status] ?? HTTP_ERROR_MAP[500];
      errorType = errorType ?? fallback.errorType;
      errorCode = errorCode ?? fallback.errorCode;
    }

    response.status(status).json({
      statusCode: status,
      errorType,
      errorCode,
      message,
      ...(details !== undefined ? { details } : {}),
      ...(errors ? { errors } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
