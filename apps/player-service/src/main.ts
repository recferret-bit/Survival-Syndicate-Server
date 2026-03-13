import { ApplicationBootstrapBuilder } from '@lib/shared';
import { name, version } from '../package.json';
import { AppModule } from './app.module';

class App {
  async bootstrap() {
    const appBootstrap = await new ApplicationBootstrapBuilder(
      name,
      version,
    ).createApp(AppModule);

    const playerPort = appBootstrap.envService.get('PLAYER_APP_PORT');
    const healthPort = appBootstrap.envService.getHealthPort(playerPort);
    const metricsPort = appBootstrap.envService.getMetricsPort(playerPort);
    const playerApiPrefix = appBootstrap.envService.get(
      'PLAYER_APP_HTTP_PREFIX',
    );

    await appBootstrap.startHttpServer(playerPort, playerApiPrefix);
    await appBootstrap.setupHealthCheckApp(healthPort);
    await appBootstrap.setupMetricsApp(metricsPort);
    await appBootstrap.startNatsMicroservice();
  }
}

const app = new App();
void app.bootstrap();
