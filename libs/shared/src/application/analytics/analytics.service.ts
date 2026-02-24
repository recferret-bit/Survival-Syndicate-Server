import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from '../env/env.service';
import axios from 'axios';
import { AnalyticsDto, AnalyticsEventName } from './analytics.interface';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  gaUrl: string;

  constructor(private envService: EnvService) {
    const gaApiSecret = envService.get('GA_API_KEY');
    const gaMeasurementId = envService.get('GA_MEASUREMENT_ID');
    this.gaUrl = `https://www.google-analytics.com/mp/collect?api_secret=${gaApiSecret}&measurement_id=${gaMeasurementId}`;
  }

  async sendEvent({ gaClientId, yaClientId, userId, event }: AnalyticsDto) {
    this.logger.log('Send analytics event', {
      userId,
      gaClientId,
      yaClientId,
      event,
    });

    if (gaClientId && this.envService.isProd()) {
      await axios
        .post(this.gaUrl, {
          client_id: gaClientId,
          user_id: `${userId}`,
          timestamp_micros: Date.now() + '000',
          events: [
            {
              name: event.name,
              params: { ...event.params, user_id: `${userId}` },
            },
          ],
        })
        .catch((e) => {
          this.logger.error('Error send event GA', {
            userId,
            event: event.name,
            message: e.message,
          });
        });
    }

    if (yaClientId) {
      let depositParams = {};
      if (event.name === AnalyticsEventName.depositSuccess) {
        depositParams = { cu: event.params.currency, ev: event.params.value };
      }
      const params = event.params;
      if (Object.keys(params).includes('currency')) {
        delete params['currency']; // do not transfer currency in params
      }
      await axios
        .get('https://mc.yandex.ru/collect', {
          params: {
            tid: this.envService.get('YA_COUNTER_ID'),
            ms: this.envService.get('YA_SECRET_TOKEN'),
            cid: yaClientId,
            t: 'event',
            ea: event.name,
            params: JSON.stringify({ ...params, userId }),
            et: Math.floor(Date.now() / 1000),
            ...depositParams,
          },
        })
        .catch((e) => {
          this.logger.error('Error send event YA', {
            userId,
            event: event.name,
            message: e.message,
          });
        });
    }

    this.logger.log('Success send analytics event', { userId });
  }
}
