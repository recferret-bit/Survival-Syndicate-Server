import { z } from 'zod';

/**
 * Zod validation schemas for Local Orchestrator service
 */

export const TestLocalOrchestratorRequestSchema = z.object({});

export const TestLocalOrchestratorResponseSchema = z.object({
  success: z.boolean(),
});

export type TestLocalOrchestratorRequest = z.infer<
  typeof TestLocalOrchestratorRequestSchema
>;
export type TestLocalOrchestratorResponse = z.infer<
  typeof TestLocalOrchestratorResponseSchema
>;

/**
 * Subject definitions for NATS
 */
export const LocalOrchestratorSubjects = {
  TEST: 'local-orchestrator.test.v1',
} as const;

export type LocalOrchestratorSubject =
  (typeof LocalOrchestratorSubjects)[keyof typeof LocalOrchestratorSubjects];
