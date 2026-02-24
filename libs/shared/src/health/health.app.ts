import { NestFactory } from '@nestjs/core';
import { HealthModule } from './health.module';
import { NestExpressApplication } from '@nestjs/platform-express';

export class HealthApp {
  static async createAndListen(port: string) {
    const app = await NestFactory.create<NestExpressApplication>(HealthModule, {
      bodyParser: false,
    });
    await app.listen(port);
  }
}
