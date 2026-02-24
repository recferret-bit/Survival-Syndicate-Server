import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AdminSwagger } from './admin.swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  EnvService,
  HttpExceptionsFilter,
  ZodExceptionFilter,
} from '@lib/shared/application';

export class AdminApp {
  static async CreateAndGetAdminApp(adminModule: any, envService: EnvService) {
    const adminApp =
      await NestFactory.create<NestExpressApplication>(adminModule);
    AdminSwagger(adminApp);

    adminApp.useGlobalPipes(new ValidationPipe({ transform: true }));
    // Register ZodExceptionFilter before HttpExceptionsFilter to catch Zod errors first
    adminApp.useGlobalFilters(
      new ZodExceptionFilter(),
      new HttpExceptionsFilter(),
    );
    await adminApp.listen(envService.getAdminPort());
    Logger.log(
      `Admin service is listening on port ${envService.getAdminPort()}`,
    );
    return adminApp;
  }
}
