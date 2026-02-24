import { NatsConnection } from 'nats';

export interface ConnectionOptions {
  servers: string[];
  user?: string;
  pass?: string;
  token?: string;
}

/**
 * Build NATS connection options from configuration
 */
export function buildConnectOptions(options: ConnectionOptions): any {
  const connectOptions: any = {
    servers: options.servers,
    debug: false,
    verbose: false,
  };

  if (options.user) connectOptions.user = options.user;
  if (options.pass) connectOptions.pass = options.pass;
  if (options.token) connectOptions.token = options.token;

  return connectOptions;
}

/**
 * Ensure NATS connection is valid and open
 * @throws Error if connection is not initialized or closed
 */
export function ensureConnection(nc: NatsConnection | null | undefined): void {
  if (!nc) {
    throw new Error('NATS connection not initialized');
  }
  if (nc.isClosed()) {
    throw new Error('NATS connection is closed');
  }
}
