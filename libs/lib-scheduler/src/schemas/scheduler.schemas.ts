import { z } from 'zod';

/**
 * Placeholder schemas for Scheduler service (phase_1_18)
 */
export const SchedulerSubjects = {
  RUN_JOB: 'scheduler.run-job.v1',
} as const;

export const RunJobRequestSchema = z.object({
  jobId: z.string().min(1),
});

export const RunJobResponseSchema = z.object({
  success: z.boolean(),
});

export type RunJobRequest = z.infer<typeof RunJobRequestSchema>;
export type RunJobResponse = z.infer<typeof RunJobResponseSchema>;
