import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './base.exception';
import { ErrorCode } from '../error-code.enum';

export class HttpInvalidArgumentException extends BaseHttpException {
  constructor(message = 'Invalid argument') {
    super(ErrorCode.InvalidArgument, message, HttpStatus.BAD_REQUEST);
  }
}
