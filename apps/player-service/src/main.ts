import { ApplicationBootstrapBuilder } from '@lib/shared';
import { name, version } from '../package.json';
import { AppModule } from './app.module';

class App {
  async bootstrap() {
    const appBootstrap = await new ApplicationBootstrapBuilder(
      name,
      version,
    ).createApp(AppModule);

    const usersPort = appBootstrap.envService.get('USERS_APP_PORT');
    const healthPort = appBootstrap.envService.getHealthPort(usersPort);
    const metricsPort = appBootstrap.envService.getMetricsPort(usersPort);
    const usersApiPrefix = appBootstrap.envService.get('USERS_APP_HTTP_PREFIX');

    await appBootstrap.startHttpServer(usersPort, usersApiPrefix);
    await appBootstrap.setupHealthCheckApp(healthPort);
    await appBootstrap.setupMetricsApp(metricsPort);
    await appBootstrap.startNatsMicroservice('users');
  }
}

const app = new App();
void app.bootstrap();
