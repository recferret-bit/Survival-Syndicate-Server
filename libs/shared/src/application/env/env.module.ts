import { DynamicModule } from '@nestjs/common';
import { EnvService } from './env.service';
import { ConfigModule } from '@nestjs/config';
import { commonSchema } from './env';
import { z } from 'zod';

export class EnvModule {
  static forRoot<T extends z.ZodRawShape>(
    envSchema?: z.ZodObject<T>,
    isGlobal = false,
  ): DynamicModule {
    // In production/stage, env vars are injected via K8s ConfigMaps/Secrets
    // No .env file is needed - ignoreEnvFile prevents file lookup errors
    const isK8sEnvironment =
      process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'stage';
    const isLocal = process.env.NODE_ENV === 'local';

    return {
      module: EnvModule,
      global: isGlobal,
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: isK8sEnvironment,
          envFilePath: isLocal ? '.env.example' : '.env',
          validate: (env) =>
            envSchema
              ? commonSchema.merge(envSchema).parse(env)
              : commonSchema.parse(env),
          isGlobal,
        }),
      ],
      providers: [EnvService],
      exports: [EnvService],
    };
  }
}
