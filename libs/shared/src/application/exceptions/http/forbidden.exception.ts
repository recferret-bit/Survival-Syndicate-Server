import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './base.exception';
import { HttpErrorCode, HttpErrorType } from '@lib/shared/http';

export class HttpForbiddenException extends BaseHttpException {
  constructor(message = 'Forbidden') {
    super(
      HttpErrorType.Forbidden,
      HttpErrorCode.Forbidden,
      message,
      HttpStatus.FORBIDDEN,
    );
  }
}
