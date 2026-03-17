import { z } from 'zod';

/**
 * Placeholder schemas for Collector service (phase_1_19)
 */
export const CollectorSubjects = {
  PUBLISH_EVENT: 'collector.publish-event.v1',
} as const;

export const PublishEventRequestSchema = z.object({
  eventType: z.string(),
  payload: z.record(z.unknown()),
});

export type PublishEventRequest = z.infer<typeof PublishEventRequestSchema>;
