import { HttpStatus } from '@nestjs/common';

import { SerializedException } from '../error/core-exception.types';
import { CoreException } from '../error/core.exception';

export class ValidationException extends CoreException {
  readonly statusCode = HttpStatus.BAD_REQUEST;
  readonly errorCode = 'VALIDATION_ERROR';
  readonly validationErrors: Record<string, string[] | undefined>;

  constructor(validationErrors: Record<string, string[] | undefined>) {
    super({
      message: 'Validation Error',
      // traceIdService: RequestContextService, // TODO: Implement RequestContextService if needed
    });
    this.validationErrors = validationErrors;
  }

  override toJSON(): SerializedException {
    return {
      message: String(this.message),
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      traceId: this.traceIdService?.getTraceId(),
      stack: this.stack,
      cause: JSON.stringify(this.cause),
      validationErrors: this.validationErrors,
    };
  }
}
