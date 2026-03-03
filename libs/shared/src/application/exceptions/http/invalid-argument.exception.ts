import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './base.exception';
import { HttpErrorCode, HttpErrorType } from '@lib/shared/http';

export class HttpInvalidArgumentException extends BaseHttpException {
  constructor(message = 'Invalid argument') {
    super(
      HttpErrorType.BadRequest,
      HttpErrorCode.InvalidArgument,
      message,
      HttpStatus.BAD_REQUEST,
    );
  }
}
