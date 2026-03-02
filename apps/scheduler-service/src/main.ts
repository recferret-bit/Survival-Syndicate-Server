import { ApplicationBootstrapBuilder } from '@lib/shared';
import { name, version } from '../package.json';
import { AppModule } from './app.module';

class App {
  async bootstrap() {
    const appBootstrap = await new ApplicationBootstrapBuilder(
      name,
      version,
    ).createApp(AppModule);

    const schedulerPort = appBootstrap.envService.get('SCHEDULER_APP_PORT');
    const healthPort = appBootstrap.envService.getHealthPort(schedulerPort);
    const metricsPort = appBootstrap.envService.getMetricsPort(schedulerPort);

    await appBootstrap.build();
    await appBootstrap.startNatsMicroservice('scheduler');
    await appBootstrap.setupHealthCheckApp(healthPort);
    await appBootstrap.setupMetricsApp(metricsPort);
  }
}

const app = new App();
void app.bootstrap();
