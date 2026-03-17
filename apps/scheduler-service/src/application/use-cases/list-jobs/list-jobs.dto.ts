import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';

const JobQueueNameSchema = z.enum([
  'passive-income',
  'job-reset',
  'shop-rotation',
  'leaderboard',
]);

export const ScheduledJobDtoSchema = z.object({
  id: z.string(),
  queueName: JobQueueNameSchema,
  jobName: z.string(),
  payload: z.record(z.unknown()),
  cronExpression: z.string().optional(),
  scheduledAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});

export const ListJobsResponseSchema = z.object({
  jobs: z.array(ScheduledJobDtoSchema),
});

export type ListJobsResponseDto = z.infer<typeof ListJobsResponseSchema>;

export class ListJobsResponseHttpDto extends createZodDto(
  ListJobsResponseSchema,
) {
  @ApiProperty({ description: 'List of scheduled jobs' })
  declare jobs: z.infer<typeof ScheduledJobDtoSchema>[];
}
