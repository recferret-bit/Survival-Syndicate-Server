import type { JobQueueName } from '@app/scheduler-service/domain/entities/scheduled-job/scheduled-job.type';

export class ListJobsQuery {
  constructor(public readonly queueName?: JobQueueName) {}
}
