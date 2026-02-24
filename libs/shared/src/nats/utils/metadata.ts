import {
  NON_DURABLE_METADATA_KEY,
  isPatternNonDurable,
} from '../decorators/non-durable.decorator';

/**
 * Check if a handler is marked as non-durable
 * @param handler - Message handler function (from NestJS MessageHandler)
 * @param pattern - Optional pattern string to check against global registry
 * @returns true if handler has @NonDurable decorator
 */
export function isHandlerNonDurable(
  handler: Function,
  pattern?: string,
): boolean {
  // PREFERRED: Check global pattern registry first (works even with wrapped handlers)
  if (pattern && isPatternNonDurable(pattern)) {
    return true;
  }

  // FALLBACK: Try to read metadata from handler (may not work with wrapped handlers)
  // NestJS microservices pass handlers that may be:
  // 1. Direct prototype methods (metadata available)
  // 2. Bound methods from controller instance (metadata available on instance method)
  // 3. Wrapped functions (need to unwrap)

  // Method 1: Check the handler function directly (works for instance methods)
  const metadata = Reflect.getMetadata(NON_DURABLE_METADATA_KEY, handler);
  if (metadata === true) {
    return true;
  }

  // Method 2: Check if it's a NestJS wrapper with a callback property
  if ((handler as any).callback) {
    const callbackMetadata = Reflect.getMetadata(
      NON_DURABLE_METADATA_KEY,
      (handler as any).callback,
    );
    if (callbackMetadata === true) {
      return true;
    }
  }

  // Method 3: Check target/originalHandler properties (NestJS may wrap in different ways)
  if ((handler as any).target) {
    const targetMetadata = Reflect.getMetadata(
      NON_DURABLE_METADATA_KEY,
      (handler as any).target,
    );
    if (targetMetadata === true) {
      return true;
    }
  }

  if ((handler as any).originalHandler) {
    const originalMetadata = Reflect.getMetadata(
      NON_DURABLE_METADATA_KEY,
      (handler as any).originalHandler,
    );
    if (originalMetadata === true) {
      return true;
    }
  }

  // Method 4: For bound methods, check if metadata keys exist
  // Bound methods lose metadata, but let's check anyway
  const keys = Reflect.getMetadataKeys(handler);
  if (keys && keys.length > 0 && keys.includes(NON_DURABLE_METADATA_KEY)) {
    return Reflect.getMetadata(NON_DURABLE_METADATA_KEY, handler) === true;
  }

  // If all methods fail, return false (treat as durable for safety)
  return false;
}
