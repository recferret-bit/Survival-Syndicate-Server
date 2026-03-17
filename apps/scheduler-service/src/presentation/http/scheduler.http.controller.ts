import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListJobsQuery } from '@app/scheduler-service/application/use-cases/list-jobs/list-jobs.query';
import {
  type ListJobsResponseDto,
  ListJobsResponseHttpDto,
} from '@app/scheduler-service/application/use-cases/list-jobs/list-jobs.dto';
import type { JobQueueName } from '@app/scheduler-service/domain/entities/scheduled-job/scheduled-job.type';

@Controller('jobs')
@ApiTags('Scheduler')
export class SchedulerHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'List scheduled jobs (stub)' })
  @ApiQuery({
    name: 'queue',
    required: false,
    enum: ['passive-income', 'job-reset', 'shop-rotation', 'leaderboard'],
  })
  @ApiResponse({ status: 200, type: ListJobsResponseHttpDto })
  async listJobs(
    @Query('queue') queue?: JobQueueName,
  ): Promise<ListJobsResponseDto> {
    return this.queryBus.execute(new ListJobsQuery(queue));
  }
}
