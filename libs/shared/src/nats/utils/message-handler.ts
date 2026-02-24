import { NatsConnection, JsMsg, Msg } from 'nats';
import { Logger } from '@nestjs/common';

/**
 * Parse message data from NATS message
 */
export function parseMessageData<T = unknown>(msg: JsMsg | Msg): T {
  return JSON.parse(msg.data.toString()) as T;
}

/**
 * Send reply to a NATS request if reply subject exists
 */
export async function sendReply<T>(
  nc: NatsConnection,
  replySubject: string | undefined,
  result: T,
  pattern: string,
  logger: Logger,
  messageType: 'durable' | 'non-durable' = 'durable',
): Promise<void> {
  if (!replySubject) return;

  const replyData = JSON.stringify(result);
  await nc.publish(replySubject, new TextEncoder().encode(replyData));
}

/**
 * Handle a JetStream message (durable)
 */
export async function handleJetStreamMessage(
  msg: JsMsg,
  handler: Function,
  pattern: string,
  nc: NatsConnection,
  logger: Logger,
): Promise<void> {
  try {
    const data = parseMessageData(msg);
    const replySubject = msg.headers?.get('reply');

    const result = await handler(data);

    await sendReply(nc, replySubject, result, pattern, logger, 'durable');

    msg.ack();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    logger.error(
      `Error handling message on pattern '${pattern}': ${message}`,
      stack,
    );
    msg.nak();
  }
}

/**
 * Handle a core NATS message (non-durable)
 */
export async function handleCoreNatsMessage(
  msg: Msg,
  handler: Function,
  pattern: string,
  nc: NatsConnection,
  logger: Logger,
): Promise<void> {
  const replySubject = msg.headers?.get('reply');
  try {
    const data = parseMessageData(msg);

    const result = await handler(data);

    await sendReply(nc, replySubject, result, pattern, logger, 'non-durable');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    logger.error(
      `Error handling non-durable message on pattern '${pattern}': ${message}`,
      stack,
    );
    // Send error reply so the requesting client receives a proper error
    if (replySubject) {
      try {
        const errorReply = JSON.stringify({
          error: message || 'Internal server error',
          statusCode: 500,
        });
        nc.publish(replySubject, new TextEncoder().encode(errorReply));
      } catch {
        // Ignore reply send failures
      }
    }
  }
}
