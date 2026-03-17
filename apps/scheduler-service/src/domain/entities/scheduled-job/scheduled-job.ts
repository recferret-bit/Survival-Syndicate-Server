import { ValidationException } from '@lib/shared/application';
import { Entity } from '@lib/shared';
import { ScheduledJobProps, type JobQueueName } from './scheduled-job.type';

const VALID_QUEUES: JobQueueName[] = [
  'passive-income',
  'job-reset',
  'shop-rotation',
  'leaderboard',
];

export class ScheduledJob extends Entity<ScheduledJobProps> {
  constructor(props: ScheduledJobProps) {
    super(props);
    this.validate();
  }

  private validate(): void {
    if (!this.props.queueName || !VALID_QUEUES.includes(this.props.queueName)) {
      throw new ValidationException({
        queueName: ['Invalid queue name.'],
      });
    }
    if (!this.props.jobName || this.props.jobName.trim().length === 0) {
      throw new ValidationException({
        jobName: ['Job name is required.'],
      });
    }
  }

  get id(): string {
    return this.props.id;
  }

  get queueName(): JobQueueName {
    return this.props.queueName;
  }

  get jobName(): string {
    return this.props.jobName;
  }

  get payload(): Record<string, unknown> {
    return this.props.payload;
  }

  get cronExpression(): string | undefined {
    return this.props.cronExpression;
  }

  get scheduledAt(): Date {
    return this.props.scheduledAt;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }
}
