import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './base.exception';
import { ErrorCode } from '../error-code.enum';

export class HttpNotFoundException extends BaseHttpException {
  constructor(message = 'Not found') {
    super(ErrorCode.NotFound, message, HttpStatus.NOT_FOUND);
  }
}
