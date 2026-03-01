import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(
    process.env.BUILDING_APP_PORT ?? process.env.PORT ?? 3011,
  );
  await app.listen(port);
}

void bootstrap();
