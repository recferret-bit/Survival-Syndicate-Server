export type JobQueueName =
  | 'passive-income'
  | 'job-reset'
  | 'shop-rotation'
  | 'leaderboard';

export interface ScheduledJobProps {
  id: string;
  queueName: JobQueueName;
  jobName: string;
  payload: Record<string, unknown>;
  cronExpression?: string;
  scheduledAt: Date;
  completedAt?: Date;
}

export type CreateScheduledJob = Omit<
  ScheduledJobProps,
  'id' | 'scheduledAt' | 'completedAt'
> & {
  scheduledAt?: Date;
  completedAt?: Date;
};
