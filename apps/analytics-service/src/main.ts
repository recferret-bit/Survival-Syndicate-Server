import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(
    process.env.ANALYTICS_APP_PORT ?? process.env.PORT ?? 3013,
  );
  await app.listen(port);
}

void bootstrap();
