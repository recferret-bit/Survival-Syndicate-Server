import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpErrorCode, HttpErrorType } from '@lib/shared/http';

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  private logger = new Logger(ZodExceptionFilter.name);

  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Format Zod errors as array of field/message pairs
    const errors = exception.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    this.logger.warn(
      `Validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`,
    );

    const errorMessage =
      errors.length === 1 ? errors[0].message : 'Validation failed';

    response.status(400).json({
      statusCode: 400,
      errorType: HttpErrorType.Validation,
      errorCode: HttpErrorCode.ValidationError,
      message: errorMessage,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
