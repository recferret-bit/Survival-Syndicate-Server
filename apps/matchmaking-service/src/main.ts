import { ApplicationBootstrapBuilder } from '@lib/shared';
import { name, version } from '../package.json';
import { AppModule } from './app.module';

class App {
  async bootstrap() {
    const appBootstrap = await new ApplicationBootstrapBuilder(
      name,
      version,
    ).createApp(AppModule);

    const servicePort = appBootstrap.envService.get('MATCHMAKING_APP_PORT');
    const healthPort = appBootstrap.envService.getHealthPort(servicePort);
    const metricsPort = appBootstrap.envService.getMetricsPort(servicePort);
    const apiPrefix = appBootstrap.envService.get(
      'MATCHMAKING_APP_HTTP_PREFIX',
    );

    await appBootstrap.startHttpServer(servicePort, apiPrefix);
    await appBootstrap.setupHealthCheckApp(healthPort);
    await appBootstrap.setupMetricsApp(metricsPort);
    await appBootstrap.startNatsMicroservice('matchmaking');
    await appBootstrap.startAllMicroservices();
  }
}

const app = new App();
void app.bootstrap();
