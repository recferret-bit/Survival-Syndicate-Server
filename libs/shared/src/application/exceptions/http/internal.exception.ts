import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './base.exception';
import { ErrorCode } from '../error-code.enum';

export class HttpInternalException extends BaseHttpException {
  constructor(message = 'Internal server problem') {
    super(
      ErrorCode.InternalServerError,
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
