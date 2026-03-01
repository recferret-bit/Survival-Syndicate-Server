import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(
    process.env.COMBAT_PROGRESS_APP_PORT ?? process.env.PORT ?? 3012,
  );
  await app.listen(port);
}

void bootstrap();
