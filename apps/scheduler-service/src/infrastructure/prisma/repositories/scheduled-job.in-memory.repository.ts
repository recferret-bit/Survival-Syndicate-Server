import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ScheduledJobPortRepository } from '@app/scheduler-service/application/ports/scheduled-job.port.repository';
import { CreateScheduledJob } from '@app/scheduler-service/domain/entities/scheduled-job/scheduled-job.type';
import { ScheduledJob } from '@app/scheduler-service/domain/entities/scheduled-job/scheduled-job';
import type { JobQueueName } from '@app/scheduler-service/domain/entities/scheduled-job/scheduled-job.type';

@Injectable()
export class ScheduledJobInMemoryRepository extends ScheduledJobPortRepository {
  private readonly jobs = new Map<string, ScheduledJob>();

  async create(data: CreateScheduledJob): Promise<ScheduledJob> {
    const now = new Date();
    const entity = new ScheduledJob({
      id: randomUUID(),
      queueName: data.queueName,
      jobName: data.jobName,
      payload: data.payload ?? {},
      cronExpression: data.cronExpression,
      scheduledAt: data.scheduledAt ?? now,
      completedAt: data.completedAt,
    });
    this.jobs.set(entity.id, entity);
    return entity;
  }

  async findById(id: string): Promise<ScheduledJob | null> {
    return this.jobs.get(id) ?? null;
  }

  async findByQueueName(queueName: JobQueueName): Promise<ScheduledJob[]> {
    return Array.from(this.jobs.values()).filter(
      (j) => j.queueName === queueName,
    );
  }
}
