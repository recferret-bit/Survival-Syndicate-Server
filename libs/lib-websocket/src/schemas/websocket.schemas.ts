import { z } from 'zod';

/**
 * Zod validation schemas for Websocket service
 */

export const TestWebsocketRequestSchema = z.object({});

export const TestWebsocketResponseSchema = z.object({
  success: z.boolean(),
});

export type TestWebsocketRequest = z.infer<typeof TestWebsocketRequestSchema>;
export type TestWebsocketResponse = z.infer<typeof TestWebsocketResponseSchema>;

/**
 * Subject definitions for NATS
 */
export const WebsocketSubjects = {
  TEST: 'websocket.test.v1',
} as const;

export type WebsocketSubject =
  (typeof WebsocketSubjects)[keyof typeof WebsocketSubjects];
