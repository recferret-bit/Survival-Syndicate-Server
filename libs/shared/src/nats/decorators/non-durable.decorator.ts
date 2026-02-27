import { SetMetadata } from '@nestjs/common';

export const NON_DURABLE_METADATA_KEY = 'nats:non-durable';

// Global registry for non-durable patterns
// This works around NestJS handler wrapping that loses metadata
const nonDurablePatterns = new Set<string>();

// Store methods that need pattern registration (deferred until patterns are available)
const pendingRegistrations = new Map<any, Set<string>>();

export function registerNonDurablePattern(pattern: string) {
  nonDurablePatterns.add(pattern);
}

export function isPatternNonDurable(pattern: string): boolean {
  return nonDurablePatterns.has(pattern);
}

export function scanAndRegisterPatterns(controllers: any[]) {
  for (const controller of controllers) {
    const prototype = controller.prototype || controller;
    const methodNames = Object.getOwnPropertyNames(prototype);

    for (const methodName of methodNames) {
      const method = prototype[methodName];
      if (typeof method !== 'function') continue;

      // Check if method has @NonDurable metadata
      const isNonDurable = Reflect.getMetadata(
        NON_DURABLE_METADATA_KEY,
        method,
      );
      if (!isNonDurable) continue;

      // Get pattern from @MessagePattern metadata - try multiple possible keys
      const patternMetadata = Reflect.getMetadata(
        'microservices:pattern_metadata',
        method,
      );
      const patternHandler = Reflect.getMetadata(
        'microservices:pattern',
        method,
      );
      const patterns = patternMetadata || patternHandler;
      if (patterns) {
        if (Array.isArray(patterns)) {
          patterns.forEach((p) => registerNonDurablePattern(p));
        } else {
          registerNonDurablePattern(patterns);
        }
      }
    }
  }
}

/**
 * Decorator to mark a NATS message handler as non-durable
 * Non-durable handlers use core NATS instead of JetStream
 * - Fail fast if service is down (no persistence)
 * - Lower latency (no JetStream overhead)
 * - No retries (message lost if handler fails)
 *
 * @example
 * ```typescript
 * @MessagePattern(BuildingSubjects.GET_BALANCE)
 * @NonDurable()
 * async getBalance(@Payload() data: GetBalanceRequest) {
 *   // This handler uses core NATS (non-durable)
 * }
 * ```
 */
export const NonDurable = () => SetMetadata(NON_DURABLE_METADATA_KEY, true);
