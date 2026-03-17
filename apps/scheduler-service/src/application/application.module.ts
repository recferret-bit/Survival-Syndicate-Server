import { Module } from '@nestjs/common';
import { AuthJwtModule } from '@lib/shared';
import { InfrastructureModule } from '@app/scheduler-service/infrastructure/infrastructure.module';
import { ListJobsHandler } from '@app/scheduler-service/application/use-cases/list-jobs/list-jobs.handler';

@Module({
  imports: [AuthJwtModule, InfrastructureModule],
  providers: [ListJobsHandler],
  exports: [ListJobsHandler],
})
export class ApplicationModule {}
