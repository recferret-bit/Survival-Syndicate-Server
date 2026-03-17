import { Module } from '@nestjs/common';
import { AuthJwtModule } from '@lib/shared';
import { InfrastructureModule } from '@app/history-service/infrastructure/infrastructure.module';
import { GetMatchHistoryHandler } from '@app/history-service/application/use-cases/get-match-history/get-match-history.handler';
import { HandleMatchFinishedHandler } from '@app/history-service/application/use-cases/handle-match-finished/handle-match-finished.handler';

@Module({
  imports: [AuthJwtModule, InfrastructureModule],
  providers: [GetMatchHistoryHandler, HandleMatchFinishedHandler],
  exports: [GetMatchHistoryHandler, HandleMatchFinishedHandler],
})
export class ApplicationModule {}
