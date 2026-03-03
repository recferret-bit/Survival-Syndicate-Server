import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './base.exception';
import { HttpErrorCode, HttpErrorType } from '@lib/shared/http';

export class HttpConflictException extends BaseHttpException {
  constructor(message = 'Conflict') {
    super(
      HttpErrorType.Conflict,
      HttpErrorCode.Conflict,
      message,
      HttpStatus.CONFLICT,
    );
  }
}
