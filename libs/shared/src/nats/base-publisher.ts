import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';

/**
 * Base class for NATS publishers with built-in durable/non-durable support
 *
 * Provides helper methods for sending requests with automatic validation
 *
 * @example
 * ```typescript
 * export class BuildingPublisher extends BasePublisher {
 *   async createUserBalance(dto: CreateUserBalanceRequest): Promise<CreateUserBalanceResponse> {
 *     return this.sendDurable(
 *       BuildingSubjects.CREATE_USER_BALANCE,
 *       dto,
 *       CreateUserBalanceRequestSchema,
 *       CreateUserBalanceResponseSchema,
 *     );
 *   }
 *
 *   async getBalance(dto: GetBalanceRequest): Promise<GetBalanceResponse> {
 *     return this.sendNonDurable(
 *       BuildingSubjects.GET_BALANCE,
 *       dto,
 *       GetBalanceRequestSchema,
 *       GetBalanceResponseSchema,
 *     );
 *   }
 * }
 * ```
 */
export abstract class BasePublisher {
  protected readonly logger: Logger;

  constructor(
    @Inject('NATS_CLIENT') protected readonly durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE')
    protected readonly nonDurableClient: ClientProxy,
    loggerContext: string,
  ) {
    this.logger = new Logger(loggerContext);
  }

  /**
   * Send a durable request (uses JetStream with persistence)
   * Use for critical operations that must not be lost
   *
   * @param subject - NATS subject
   * @param data - Request data
   * @param requestSchema - Zod schema for request validation (optional)
   * @param responseSchema - Zod schema for response validation (required)
   * @returns Validated response
   */
  protected async sendDurable<TRequest, TResponse>(
    subject: string,
    data: TRequest,
    requestSchema?: z.ZodSchema<TRequest>,
    responseSchema?: z.ZodSchema<TResponse>,
  ): Promise<TResponse> {
    // Validate request if schema provided
    if (requestSchema) {
      requestSchema.parse(data);
    }

    // Send request
    const response = await firstValueFrom(
      this.durableClient.send<TResponse>(subject, data),
    );

    // Validate response
    return this.validateResponse(subject, response, responseSchema);
  }

  /**
   * Emit a durable event (fire-and-forget via JetStream with persistence)
   * Use for broadcast events that must not be lost (e.g. user-registered)
   *
   * @param subject - NATS subject
   * @param data - Event data
   * @param requestSchema - Zod schema for request validation (optional)
   */
  protected async emitDurable<T>(
    subject: string,
    data: T,
    requestSchema?: z.ZodSchema<T>,
  ): Promise<void> {
    if (requestSchema) {
      requestSchema.parse(data);
    }
    await firstValueFrom(this.durableClient.emit(subject, data));
  }

  /**
   * Send a non-durable request (uses core NATS, fails fast if service is down)
   * Use for read operations or non-critical operations
   *
   * @param subject - NATS subject
   * @param data - Request data
   * @param requestSchema - Zod schema for request validation (optional)
   * @param responseSchema - Zod schema for response validation (required)
   * @returns Validated response
   */
  protected async sendNonDurable<TRequest, TResponse>(
    subject: string,
    data: TRequest,
    requestSchema?: z.ZodSchema<TRequest>,
    responseSchema?: z.ZodSchema<TResponse>,
  ): Promise<TResponse> {
    // Validate request if schema provided
    if (requestSchema) {
      requestSchema.parse(data);
    }

    // Send request
    const response = await firstValueFrom(
      this.nonDurableClient.send<TResponse>(subject, data),
    );

    // Validate response
    return this.validateResponse(subject, response, responseSchema);
  }

  /**
   * Validate response with schema and null checks
   */
  private validateResponse<TResponse>(
    subject: string,
    response: TResponse | null | undefined,
    responseSchema?: z.ZodSchema<TResponse>,
  ): TResponse {
    // Check if response exists
    if (!response) {
      this.logger.error(
        `Received undefined response from subject '${subject}'`,
      );
      throw new Error(
        `Service did not return a valid response for '${subject}'. The service may be unavailable or the request timed out.`,
      );
    }

    // Check if response is a server-side error reply
    if (
      typeof response === 'object' &&
      (response as any).error &&
      (response as any).statusCode
    ) {
      const errMsg = (response as any).error;
      this.logger.error(`Server error from subject '${subject}': ${errMsg}`);
      throw new Error(`Service returned an error for '${subject}': ${errMsg}`);
    }

    // Validate response schema if provided
    if (responseSchema) {
      try {
        return responseSchema.parse(response);
      } catch (error) {
        let responseStr: string;
        try {
          responseStr = JSON.stringify(response);
        } catch {
          responseStr = String(response);
        }
        this.logger.error(
          `Invalid response format from subject '${subject}': ${error instanceof Error ? error.message : String(error)}. Response: ${responseStr}`,
        );
        throw new Error(
          `Service returned an invalid response format for '${subject}': ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return response;
  }
}
