import { Logger } from '@nestjs/common';
import { ZodError } from 'zod';

export const logNatsHandlerError = (
  logger: Logger,
  method: string,
  error: unknown,
): void => {
  if (error instanceof ZodError) {
    logger.error(`${method} validation error: ${error.message}`);
    return;
  }

  if (error instanceof Error) {
    logger.error(`${method} failed: ${error.message}`, error.stack);
    return;
  }

  logger.error(`${method} failed: ${String(error)}`);
};
