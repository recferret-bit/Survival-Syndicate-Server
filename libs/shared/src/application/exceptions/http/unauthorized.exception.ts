import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './base.exception';
import { HttpErrorCode, HttpErrorType } from '@lib/shared/http';

export class HttpUnauthorizedException extends BaseHttpException {
  constructor(message = 'Unauthorized') {
    super(
      HttpErrorType.Unauthorized,
      HttpErrorCode.Unauthorized,
      message,
      HttpStatus.UNAUTHORIZED,
    );
  }
}
