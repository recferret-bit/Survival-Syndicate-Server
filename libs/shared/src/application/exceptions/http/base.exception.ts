import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpErrorCode, HttpErrorType } from '@lib/shared/http';

export class BaseHttpException extends HttpException {
  constructor(
    errorType: HttpErrorType,
    errorCode: HttpErrorCode,
    message: string,
    httpStatus = HttpStatus.BAD_REQUEST,
    details: unknown = null,
  ) {
    super(
      {
        errorType,
        errorCode,
        errorMessage: message,
        message,
        details,
      },
      httpStatus,
    );
  }
}
