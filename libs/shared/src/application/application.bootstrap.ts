import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ZodValidationPipe, patchNestjsSwagger } from '@anatine/zod-nestjs';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { HealthApp } from '@lib/shared/health';
import { MetricsApp } from '@lib/shared/metrics';
import { EnvService } from './env/env.service';
import { AdminApp } from '@lib/shared/admin';
import { HttpExceptionsFilter } from './exceptions/http-exceptions.filter';
import { ZodExceptionFilter } from './exceptions/zod-exception.filter';
import { execSync } from 'node:child_process';
import { Utils } from './utils/utils';
import { SwaggerModule } from '@nestjs/swagger';
import {
  JetStreamTransportStrategy,
  JetStreamTransportOptions,
} from '../nats/jetstream-transporter';
import { scanAndRegisterPatterns } from '../nats/decorators/non-durable.decorator';

export class ApplicationBootstrapBuilder {
  private app: INestApplication;
  private module: any;
  private readonly name: string;
  private readonly version: string;
  private lastHttpPort?: string;
  private lastHealthPort?: string;
  private lastMetricsPort?: string;
  private natsQueue?: string;

  public envService: EnvService;

  get application(): INestApplication {
    return this.app;
  }

  constructor(name?: string, version?: string) {
    this.name = name ?? 'app';
    this.version = version ?? '1.0.0';
  }

  async createApp(coreModule: any) {
    this.module = coreModule;
    this.app = await NestFactory.create(coreModule, { rawBody: true });
    this.envService = this.app.get(EnvService);
    return this;
  }

  async startHttpServer(port = '3000', prefix = 'api/v2', skipSwagger = false) {
    this.app.getHttpAdapter().getInstance().disable('x-powered-by');

    const extendedCorsOptions = this.envService.isProd()
      ? undefined
      : {
          origin: true, // Allow all origins for testing
          methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
          allowedHeaders: '*', // Allow all headers for testing
          credentials: true,
        };
    this.app.enableCors(extendedCorsOptions);
    this.app.setGlobalPrefix(prefix);

    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: false,
        transform: true,
        forbidNonWhitelisted: false,
        transformOptions: {
          enableImplicitConversion: true,
        },
        skipMissingProperties: false,
      }),
      new ZodValidationPipe(),
    );
    // Register ZodExceptionFilter before HttpExceptionsFilter to catch Zod errors first
    this.app.useGlobalFilters(
      new ZodExceptionFilter(),
      new HttpExceptionsFilter(),
    );

    // Setup Swagger BEFORE listening to ensure routes are registered
    if (!skipSwagger) {
      this.startSwagger(prefix);
    }

    await this.app.listen(port);
    this.lastHttpPort = port;
  }

  async startNatsMicroservice(queue: string) {
    this.natsQueue = queue;
    try {
      const servers = this.envService.getNatsServers();
      const user = this.envService.getNatsUser();
      const pass = this.envService.getNatsPassword();
      const token = this.envService.getNatsToken();

      const transportOptions: JetStreamTransportOptions = {
        servers,
        streamName: queue, // Use queue name as stream name (per-service streams)
        durableName: queue,
        ...(user && { user }),
        ...(pass && { pass }),
        ...(token && { token }),
      };

      // Scan controllers for @NonDurable decorators before creating microservice
      try {
        const controllers = this.getControllersFromModule(this.module);
        if (controllers.length > 0) {
          scanAndRegisterPatterns(controllers);
        }
      } catch (scanError) {
        // If scanning fails, continue anyway - metadata detection will fall back
        Logger.warn(
          `Failed to scan controllers for @NonDurable patterns: ${scanError.message}`,
        );
      }

      const options: MicroserviceOptions = {
        strategy: new JetStreamTransportStrategy(transportOptions),
      };

      // Connect microservice to existing app instead of creating a new one
      // This shares the same DI container and avoids duplicate module instantiation
      this.app.connectMicroservice(options);
      await this.app.startAllMicroservices();

      return this;
    } catch (error) {
      Logger.error('Failed to start NATS microservice', error);
      throw error;
    }
  }

  async setupAdminApp(adminModule: any) {
    await AdminApp.CreateAndGetAdminApp(adminModule, this.envService);
    Logger.log('Admin microservice connected');
  }

  async setupHealthCheckApp(port: string) {
    this.lastHealthPort = port;
    await HealthApp.createAndListen(port);
  }

  async setupMetricsApp(port: string) {
    this.lastMetricsPort = port;
    await MetricsApp.createAndListen(port);
  }

  async build() {
    await this.app.init();
    Logger.log('Application initialized');
  }

  async startAllMicroservices() {
    await this.app.startAllMicroservices();
    const summary: Record<string, string> = {
      message: 'Microservices started',
      name: this.name,
      version: this.version,
    };
    if (this.lastHttpPort !== undefined) summary.httpPort = this.lastHttpPort;
    if (this.lastHealthPort !== undefined)
      summary.healthPort = this.lastHealthPort;
    if (this.lastMetricsPort !== undefined)
      summary.metricsPort = this.lastMetricsPort;
    if (this.natsQueue !== undefined) summary.natsQueue = this.natsQueue;
    Logger.log(summary);
  }

  /**
   * Extract controller classes from module metadata using NestJS reflection
   */
  private getControllersFromModule(module: any): any[] {
    const controllers: any[] = [];

    if (!module || typeof module !== 'function') {
      return controllers;
    }

    // Get controllers from module class metadata (NestJS stores this via @Module decorator)
    const moduleMetadata = Reflect.getMetadata('imports', module) || [];
    const moduleControllers = Reflect.getMetadata('controllers', module) || [];

    if (moduleControllers && moduleControllers.length > 0) {
      controllers.push(...moduleControllers);
    }

    // Recursively check imported modules
    for (const importedModule of moduleMetadata) {
      if (!importedModule) continue;

      // Handle dynamic modules (e.g., forRoot() returns { module: X })
      if (
        importedModule.module &&
        typeof importedModule.module === 'function'
      ) {
        controllers.push(
          ...this.getControllersFromModule(importedModule.module),
        );
      } else if (typeof importedModule === 'function') {
        controllers.push(...this.getControllersFromModule(importedModule));
      }
    }

    return controllers.filter((c) => c && typeof c === 'function');
  }

  private startSwagger(prefix = 'api/v2') {
    if (this.envService.isProd()) {
      Logger.log('Swagger is disabled in production');
    } else {
      // Patch Swagger to support Zod DTOs
      patchNestjsSwagger();

      SwaggerModule.setup(
        `${prefix}/docs`,
        this.app,
        SwaggerModule.createDocument(
          this.app,
          Utils.buildSwaggerConfig(this.name, this.version),
        ),
        { swaggerOptions: { persistAuthorization: true } },
      );
      Logger.log(`Swagger started on ${prefix}/docs`);
    }
  }
}
