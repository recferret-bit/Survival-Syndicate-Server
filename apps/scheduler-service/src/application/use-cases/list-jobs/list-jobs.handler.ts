import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListJobsQuery } from './list-jobs.query';
import {
  type ListJobsResponseDto,
  ListJobsResponseSchema,
} from './list-jobs.dto';
import { ScheduledJobPortRepository } from '@app/scheduler-service/application/ports/scheduled-job.port.repository';

@QueryHandler(ListJobsQuery)
export class ListJobsHandler
  implements IQueryHandler<ListJobsQuery, ListJobsResponseDto>
{
  constructor(
    private readonly scheduledJobRepository: ScheduledJobPortRepository,
  ) {}

  async execute(query: ListJobsQuery): Promise<ListJobsResponseDto> {
    const jobs = query.queueName
      ? await this.scheduledJobRepository.findByQueueName(query.queueName)
      : await Promise.all([
          this.scheduledJobRepository.findByQueueName('passive-income'),
          this.scheduledJobRepository.findByQueueName('job-reset'),
          this.scheduledJobRepository.findByQueueName('shop-rotation'),
          this.scheduledJobRepository.findByQueueName('leaderboard'),
        ]).then((arr) => arr.flat());

    const result = {
      jobs: jobs.map((j) => ({
        id: j.id,
        queueName: j.queueName,
        jobName: j.jobName,
        payload: j.payload,
        cronExpression: j.cronExpression,
        scheduledAt: j.scheduledAt.toISOString(),
        completedAt: j.completedAt?.toISOString(),
      })),
    };

    return ListJobsResponseSchema.parse(result);
  }
}
