import { ApplicationBootstrapBuilder } from '@lib/shared';
import { name, version } from '../package.json';
import { AppModule } from './app.module';
import { registerNonDurablePattern } from '@lib/shared/nats';
import { BuildingSubjects } from '@lib/lib-building';

class App {
  async bootstrap() {
    // Register non-durable patterns before creating app
    registerNonDurablePattern(BuildingSubjects.CREATE_USER_BALANCE);
    registerNonDurablePattern(BuildingSubjects.ADD_BALANCE_ENTRY);

    const appBootstrap = await new ApplicationBootstrapBuilder(
      name,
      version,
    ).createApp(AppModule);

    const balancePort = appBootstrap.envService.get('BALANCE_APP_PORT');
    const healthPort = appBootstrap.envService.getHealthPort(balancePort);
    const metricsPort = appBootstrap.envService.getMetricsPort(balancePort);
    const balanceApiPrefix = appBootstrap.envService.get(
      'BALANCE_APP_HTTP_PREFIX',
    );

    await appBootstrap.startHttpServer(balancePort, balanceApiPrefix);
    await appBootstrap.setupHealthCheckApp(healthPort);
    await appBootstrap.setupMetricsApp(metricsPort);
    await appBootstrap.startNatsMicroservice('balance');
  }
}

const app = new App();
void app.bootstrap();
