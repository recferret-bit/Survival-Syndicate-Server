import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseHttpException extends HttpException {
  constructor(
    errorCode: string,
    message: string,
    httpStatus = HttpStatus.BAD_REQUEST,
    details: any = null,
  ) {
    super(
      {
        errorMessage: message,
        errorCode,
        details,
      },
      httpStatus,
    );
  }
}
