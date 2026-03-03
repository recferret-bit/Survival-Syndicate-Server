import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './base.exception';
import { HttpErrorCode, HttpErrorType } from '@lib/shared/http';

export class HttpServiceUnavailableException extends BaseHttpException {
  constructor(message = 'Service unavailable') {
    super(
      HttpErrorType.ServiceUnavailable,
      HttpErrorCode.ServiceUnavailable,
      message,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
