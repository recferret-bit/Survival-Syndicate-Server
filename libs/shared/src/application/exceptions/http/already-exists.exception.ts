import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './base.exception';
import { ErrorCode } from '../error-code.enum';

export class HttpAlreadyExistsException extends BaseHttpException {
  constructor(message = 'Already exists') {
    super(ErrorCode.AlreadyExists, message, HttpStatus.CONFLICT);
  }
}
