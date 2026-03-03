import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './base.exception';
import { HttpErrorCode, HttpErrorType } from '@lib/shared/http';

export class HttpInternalException extends BaseHttpException {
  constructor(message = 'Internal server problem') {
    super(
      HttpErrorType.InternalServerError,
      HttpErrorCode.InternalServerError,
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
