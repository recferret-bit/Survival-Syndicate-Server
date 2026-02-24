import { JetStreamManager, AckPolicy, DeliverPolicy } from 'nats';
import { Logger } from '@nestjs/common';
import { NATS_ERROR_CODES } from './constants';

/**
 * Generate consumer name from durable name and pattern
 */
export function getConsumerName(durableName: string, pattern: string): string {
  return `${durableName}-${pattern.replace(/\./g, '-')}`;
}

/**
 * Create a JetStream consumer for a specific subject pattern
 */
export async function createConsumer(
  jsm: JetStreamManager,
  streamName: string,
  consumerName: string,
  pattern: string,
  logger: Logger,
): Promise<void> {
  try {
    await jsm.consumers.add(streamName, {
      durable_name: consumerName,
      filter_subject: pattern,
      ack_policy: AckPolicy.Explicit,
      max_deliver: 3, // Retry up to 3 times
      deliver_policy: DeliverPolicy.All,
    });
  } catch (error: any) {
    if (error.code === NATS_ERROR_CODES.CONSUMER_EXISTS) {
      // Consumer already exists - no log needed
    } else {
      throw error;
    }
  }
}
