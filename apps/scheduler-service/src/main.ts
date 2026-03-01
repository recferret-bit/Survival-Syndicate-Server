import { ApplicationBootstrapBuilder } from '@lib/shared';
import { name, version } from 'package.json';
import { AppModule } from './app.module';

class App {
  async bootstrap() {
    const appBootstrap = await new ApplicationBootstrapBuilder(
      name,
      version,
    ).createApp(AppModule);

    const cronPort = appBootstrap.envService.get('CRON_APP_PORT');
    const healthPort = appBootstrap.envService.getHealthPort(cronPort);
    const metricsPort = appBootstrap.envService.getMetricsPort(cronPort);

    await appBootstrap.build();
    await appBootstrap.startNatsMicroservice('cron');
    await appBootstrap.setupHealthCheckApp(healthPort);
    await appBootstrap.setupMetricsApp(metricsPort);
  }
}

const app = new App();
void app.bootstrap();
