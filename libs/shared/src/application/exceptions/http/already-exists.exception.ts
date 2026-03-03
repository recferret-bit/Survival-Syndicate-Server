import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './base.exception';
import { HttpErrorCode, HttpErrorType } from '@lib/shared/http';

export class HttpAlreadyExistsException extends BaseHttpException {
  constructor(message = 'Already exists') {
    super(
      HttpErrorType.Conflict,
      HttpErrorCode.AlreadyExists,
      message,
      HttpStatus.CONFLICT,
    );
  }
}
