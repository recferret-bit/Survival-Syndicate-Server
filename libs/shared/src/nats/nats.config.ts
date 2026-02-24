/**
 * NATS Stream Configuration
 *
 * Centralized configuration for NATS JetStream stream names.
 * Stream names can be configured via environment variables, passed as parameters, or use defaults.
 */

/**
 * Default stream name for client requests
 */
export const DEFAULT_NATS_CLIENT_STREAM_NAME = 'casino-requests';

/**
 * Get the NATS client stream name
 *
 * @param envStreamName - Optional stream name from environment variable
 * @param defaultStreamName - Optional default stream name (overrides DEFAULT_NATS_CLIENT_STREAM_NAME)
 * @returns The stream name to use (env value or default)
 */
export function getNatsClientStreamName(
  envStreamName?: string,
  defaultStreamName?: string,
): string {
  return envStreamName || defaultStreamName || DEFAULT_NATS_CLIENT_STREAM_NAME;
}

/**
 * NATS Stream Configuration Constants
 */
export const NatsStreamConfig = {
  /**
   * Default stream name for client-side requests
   */
  DEFAULT_CLIENT_STREAM: DEFAULT_NATS_CLIENT_STREAM_NAME,

  /**
   * Get client stream name with optional override
   */
  getClientStreamName: getNatsClientStreamName,
} as const;
