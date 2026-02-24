import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

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

    // Check if this is a ZodValidationException with detailed errors
    const exceptionResponse = exception.getResponse();
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;

      // Check if message is an array (Zod validation format from @anatine/zod-nestjs)
      if (Array.isArray(responseObj.message)) {
        // Format Zod validation errors into structured format
        const errors = responseObj.message.map((msg: string) => {
          // Parse "field: error message" format
          const colonIndex = msg.indexOf(':');
          if (colonIndex > 0) {
            const field = msg.substring(0, colonIndex).trim();
            const message = msg.substring(colonIndex + 1).trim();
            return { field, message };
          }
          return { field: 'unknown', message: msg };
        });

        response.status(status).json({
          statusCode: status,
          message:
            errors.length === 1 ? errors[0].message : 'Validation failed',
          errors,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        return;
      }

      // Check if errors array exists (alternative Zod format)
      if (Array.isArray(responseObj.errors)) {
        response.status(status).json({
          statusCode: status,
          message: responseObj.message || exception.message,
          errors: responseObj.errors,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        return;
      }
    }

    // Default response for other HttpExceptions
    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
