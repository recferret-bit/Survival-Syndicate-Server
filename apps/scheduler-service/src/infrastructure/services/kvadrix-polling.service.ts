import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentsSubjects } from '@lib/lib-payments';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KvadrixPollingService {
  private readonly logger = new Logger(KvadrixPollingService.name);

  constructor(
    @Inject('NATS_CLIENT')
    private readonly natsClient: ClientProxy,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async updatePollingTransactions(): Promise<void> {
    try {
      this.logger.log('Updating polling transactions...');
      const result = await firstValueFrom(
        this.natsClient.send(PaymentsSubjects.UPDATE_POLLING_TRANSACTIONS, {}),
      );
      this.logger.log(
        `Polling transactions: checked=${result.checked}, updated=${result.updated}, errors=${result.errors}`,
      );
    } catch (error) {
      this.logger.error(
        `Error updating polling transactions: ${error.message}`,
        error.stack,
      );
    }
  }
}
