import { ApplicationBootstrapBuilder } from '@lib/shared';
import { name, version } from '../package.json';
import { AppModule } from './app.module';

class App {
  async bootstrap() {
    const appBootstrap = await new ApplicationBootstrapBuilder(
      name,
      version,
    ).createApp(AppModule);

    const servicePort = appBootstrap.envService.get(
      'LOCAL_ORCHESTRATOR_APP_PORT',
    );
    const healthPort = appBootstrap.envService.getHealthPort(servicePort);
    const metricsPort = appBootstrap.envService.getMetricsPort(servicePort);
    const apiPrefix = appBootstrap.envService.get(
      'LOCAL_ORCHESTRATOR_APP_HTTP_PREFIX',
    );

    await appBootstrap.startHttpServer(servicePort, apiPrefix);
    await appBootstrap.setupHealthCheckApp(healthPort);
    await appBootstrap.setupMetricsApp(metricsPort);
    await appBootstrap.startNatsMicroservice('local-orchestrator');
    await appBootstrap.startAllMicroservices();
  }
}

const app = new App();
void app.bootstrap();
