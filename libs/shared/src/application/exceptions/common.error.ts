import { HttpInternalException } from './http/internal.exception';
import { HttpAlreadyExistsException } from './http/already-exists.exception';
import { HttpNotFoundException } from './http/not-found.exception';
import { HttpInvalidArgumentException } from './http/invalid-argument.exception';
import { ErrorCode } from './error-code.enum';

export class CommonError extends Error {
  constructor(
    public errorCode: ErrorCode,
    message: string | undefined = undefined,
  ) {
    super(message || 'An error occurred');
    this.message = message || 'An error occurred';
  }

  public static toHttpException(error: Error) {
    const err =
      error instanceof CommonError
        ? error
        : new CommonError(
            ErrorCode.InternalServerError,
            (error as any)?.message,
          );

    const code = err.errorCode ?? ErrorCode.InternalServerError;

    switch (code) {
      case ErrorCode.InternalServerError:
        return new HttpInternalException(err.message);
      case ErrorCode.NotFound:
        return new HttpNotFoundException(err.message);
      case ErrorCode.InvalidArgument:
        return new HttpInvalidArgumentException(err.message);
      case ErrorCode.AlreadyExists:
        return new HttpAlreadyExistsException(err.message);
    }
  }
}
