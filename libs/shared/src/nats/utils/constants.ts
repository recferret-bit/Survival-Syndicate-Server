/**
 * NATS JetStream error codes
 */
export const NATS_ERROR_CODES = {
  STREAM_NOT_FOUND: '404',
  STREAM_NOT_FOUND_ALT: '10059',
  STREAM_EXISTS: '10058',
  SUBJECTS_OVERLAP: '10065',
  CONSUMER_EXISTS: '10013',
} as const;

/**
 * Default timeout values in milliseconds
 */
export const DEFAULT_TIMEOUTS = {
  REQUEST_TIMEOUT: 3000, // 3 seconds
  STREAM_MAX_AGE_NS: 3600000000000, // 1 hour in nanoseconds
} as const;

/**
 * Default stream limits
 */
export const DEFAULT_STREAM_LIMITS = {
  MAX_MSGS: 1000000,
  MAX_BYTES: 1024 * 1024 * 1024, // 1GB
} as const;

/**
 * Generate a unique inbox ID for NATS reply subjects
 */
export function generateInboxId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Generate a unique message ID for NATS messages
 */
export function generateMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
