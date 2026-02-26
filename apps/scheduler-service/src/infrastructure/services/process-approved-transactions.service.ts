import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentsSubjects } from '@lib/lib-analytics';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProcessApprovedTransactionsService {
  private readonly logger = new Logger(ProcessApprovedTransactionsService.name);

  constructor(
    @Inject('NATS_CLIENT')
    private readonly natsClient: ClientProxy,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processApprovedTransactions(): Promise<void> {
    try {
      this.logger.log('Processing approved transactions...');
      const result = await firstValueFrom(
        this.natsClient.send(
          PaymentsSubjects.PROCESS_APPROVED_TRANSACTIONS,
          {},
        ),
      );
      this.logger.log(`Processed ${result.processed} approved transactions`);
    } catch (error) {
      this.logger.error(
        `Error processing approved transactions: ${error.message}`,
        error.stack,
      );
    }
  }
}
