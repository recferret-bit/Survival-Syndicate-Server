import { ApplicationBootstrapBuilder } from '@lib/shared';
import { WsAdapter } from '@nestjs/platform-ws';
import { name, version } from '../package.json';
import { AppModule } from './app.module';

class App {
  async bootstrap() {
    const appBootstrap = await new ApplicationBootstrapBuilder(
      name,
      version,
    ).createApp(AppModule);

    appBootstrap.application.useWebSocketAdapter(
      new WsAdapter(appBootstrap.application),
    );

    const servicePort = appBootstrap.envService.get('WEBSOCKET_APP_PORT');
    const healthPort = appBootstrap.envService.getHealthPort(servicePort);
    const metricsPort = appBootstrap.envService.getMetricsPort(servicePort);
    const apiPrefix = appBootstrap.envService.get('WEBSOCKET_APP_HTTP_PREFIX');

    await appBootstrap.startHttpServer(servicePort, apiPrefix);
    await appBootstrap.setupHealthCheckApp(healthPort);
    await appBootstrap.setupMetricsApp(metricsPort);
    await appBootstrap.startNatsMicroservice('websocket');
    await appBootstrap.startAllMicroservices();
  }
}

const app = new App();
void app.bootstrap();
