import { ApplicationBootstrapBuilder } from '@lib/shared';
import { name, version } from '../package.json';
import { AppModule } from './app.module';

class App {
  async bootstrap() {
    const appBootstrap = await new ApplicationBootstrapBuilder(
      name,
      version,
    ).createApp(AppModule);

    const authPort = appBootstrap.envService.get('USERS_APP_PORT');
    const healthPort = appBootstrap.envService.getHealthPort(authPort);
    const metricsPort = appBootstrap.envService.getMetricsPort(authPort);
    const authApiPrefix = appBootstrap.envService.get('USERS_APP_HTTP_PREFIX');

    await appBootstrap.startHttpServer(authPort, authApiPrefix);
    await appBootstrap.setupHealthCheckApp(healthPort);
    await appBootstrap.setupMetricsApp(metricsPort);
    await appBootstrap.startNatsMicroservice();
    await appBootstrap.startAllMicroservices();
  }
}

const app = new App();
void app.bootstrap();
