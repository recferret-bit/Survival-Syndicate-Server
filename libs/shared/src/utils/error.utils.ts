import { PrismaClientKnownRequestError } from '@prisma/client-runtime-utils';

/**
 * Safely extracts error message from unknown error type
 * @param error - Unknown error object
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Unknown error occurred';
}

/**
 * Type guard to check if error is a PrismaClientKnownRequestError
 * @param error - Unknown error object
 * @returns True if error is PrismaClientKnownRequestError
 */
export function isPrismaKnownRequestError(
  error: unknown,
): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError;
}

/**
 * Checks if error is any Prisma error type
 * @param error - Unknown error object
 * @returns True if error is a Prisma error
 */
export function isPrismaError(error: unknown): boolean {
  if (error instanceof PrismaClientKnownRequestError) {
    return true;
  }
  // Check for other Prisma error types by checking for Prisma-specific properties
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string' &&
    (error as { code: string }).code.startsWith('P')
  ) {
    return true;
  }
  return false;
}
