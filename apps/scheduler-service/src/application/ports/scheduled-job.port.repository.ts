import { ScheduledJob } from '@app/scheduler-service/domain/entities/scheduled-job/scheduled-job';
import { CreateScheduledJob } from '@app/scheduler-service/domain/entities/scheduled-job/scheduled-job.type';
import type { JobQueueName } from '@app/scheduler-service/domain/entities/scheduled-job/scheduled-job.type';

export abstract class ScheduledJobPortRepository {
  abstract create(data: CreateScheduledJob): Promise<ScheduledJob>;
  abstract findById(id: string): Promise<ScheduledJob | null>;
  abstract findByQueueName(queueName: JobQueueName): Promise<ScheduledJob[]>;
}
