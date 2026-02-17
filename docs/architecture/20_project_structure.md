# 20. Project Structure — Monorepo на NestJS Workspaces

## 1. Обзор

Используем стандартный **NestJS CLI** с **monorepo mode** (workspaces). Без внешних инструментов (NX, Turborepo).

### Преимущества
- Нативная поддержка NestJS CLI
- Shared libraries между сервисами
- Единый `package.json` и `node_modules`
- Простая настройка и понимание

---

## 2. Инициализация Monorepo

```bash
# Создаём новый проект
nest new survival-syndicate-server
cd survival-syndicate-server

# Конвертируем в monorepo
nest generate app api-gateway

# Теперь структура:
# apps/
#   survival-syndicate-server/  (переименуем в api-gateway)
#   api-gateway/
```

### Первоначальная настройка

```bash
# Создаём все приложения
nest generate app auth-service
nest generate app player-service
nest generate app building-service
nest generate app combat-progress-service
nest generate app scheduler-service
nest generate app game-server
nest generate app analytics-service

# Создаём shared библиотеки
nest generate library common
nest generate library database
nest generate library auth
nest generate library nats-client
nest generate library contracts
```

---

## 3. Структура проекта

```
survival-syndicate-server/
├── apps/
│   ├── api-gateway/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── health/
│   │   │   ├── proxy/
│   │   │   └── middleware/
│   │   ├── test/
│   │   └── tsconfig.app.json
│   │
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/
│   │   │   │   └── guards/
│   │   │   ├── token/
│   │   │   └── user/
│   │   ├── test/
│   │   └── tsconfig.app.json
│   │
│   ├── player-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── player/
│   │   │   ├── character/
│   │   │   └── inventory/
│   │   ├── test/
│   │   └── tsconfig.app.json
│   │
│   ├── building-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── building/
│   │   │   ├── production/
│   │   │   └── unlock/
│   │   ├── test/
│   │   └── tsconfig.app.json
│   │
│   ├── combat-progress-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── trophy/
│   │   │   ├── achievement/
│   │   │   └── pool/
│   │   ├── test/
│   │   └── tsconfig.app.json
│   │
│   ├── scheduler-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── jobs/
│   │   │   └── processors/
│   │   ├── test/
│   │   └── tsconfig.app.json
│   │
│   ├── game-server/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── game/
│   │   │   ├── match/
│   │   │   ├── physics/
│   │   │   └── websocket/
│   │   ├── test/
│   │   └── tsconfig.app.json
│   │
│   └── analytics-service/
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── events/
│       │   ├── aggregation/
│       │   └── clickhouse/
│       ├── test/
│       └── tsconfig.app.json
│
├── libs/
│   ├── common/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── interceptors/
│   │   │   ├── pipes/
│   │   │   ├── guards/
│   │   │   └── utils/
│   │   └── tsconfig.lib.json
│   │
│   ├── database/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── prisma/
│   │   │   │   ├── prisma.module.ts
│   │   │   │   ├── prisma.service.ts
│   │   │   │   └── prisma.health.ts
│   │   │   ├── meta/
│   │   │   │   └── schema.prisma
│   │   │   └── catalog/
│   │   │       └── schema.prisma
│   │   └── tsconfig.lib.json
│   │
│   ├── auth/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   ├── decorators/
│   │   │   └── interfaces/
│   │   └── tsconfig.lib.json
│   │
│   ├── nats-client/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── nats-client.module.ts
│   │   │   ├── nats-client.service.ts
│   │   │   └── jetstream/
│   │   └── tsconfig.lib.json
│   │
│   └── contracts/
│       ├── src/
│       │   ├── index.ts
│       │   ├── events/
│       │   │   ├── building.events.ts
│       │   │   ├── combat.events.ts
│       │   │   └── match.events.ts
│       │   ├── commands/
│       │   │   ├── player.commands.ts
│       │   │   └── building.commands.ts
│       │   └── dto/
│       │       ├── player.dto.ts
│       │       ├── building.dto.ts
│       │       └── common.dto.ts
│       └── tsconfig.lib.json
│
├── docker/
│   ├── docker-compose.infra.yml
│   ├── docker-compose.full.yml
│   └── .env.example
│
├── prisma/
│   ├── meta/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── catalog/
│       ├── schema.prisma
│       └── migrations/
│
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 4. Конфигурация

### nest-cli.json

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "apps/api-gateway/src",
  "monorepo": true,
  "root": "apps/api-gateway",
  "compilerOptions": {
    "webpack": false,
    "tsConfigPath": "apps/api-gateway/tsconfig.app.json",
    "assets": [],
    "watchAssets": false
  },
  "projects": {
    "api-gateway": {
      "type": "application",
      "root": "apps/api-gateway",
      "entryFile": "main",
      "sourceRoot": "apps/api-gateway/src",
      "compilerOptions": {
        "tsConfigPath": "apps/api-gateway/tsconfig.app.json"
      }
    },
    "auth-service": {
      "type": "application",
      "root": "apps/auth-service",
      "entryFile": "main",
      "sourceRoot": "apps/auth-service/src",
      "compilerOptions": {
        "tsConfigPath": "apps/auth-service/tsconfig.app.json"
      }
    },
    "player-service": {
      "type": "application",
      "root": "apps/player-service",
      "entryFile": "main",
      "sourceRoot": "apps/player-service/src",
      "compilerOptions": {
        "tsConfigPath": "apps/player-service/tsconfig.app.json"
      }
    },
    "building-service": {
      "type": "application",
      "root": "apps/building-service",
      "entryFile": "main",
      "sourceRoot": "apps/building-service/src",
      "compilerOptions": {
        "tsConfigPath": "apps/building-service/tsconfig.app.json"
      }
    },
    "combat-progress-service": {
      "type": "application",
      "root": "apps/combat-progress-service",
      "entryFile": "main",
      "sourceRoot": "apps/combat-progress-service/src",
      "compilerOptions": {
        "tsConfigPath": "apps/combat-progress-service/tsconfig.app.json"
      }
    },
    "scheduler-service": {
      "type": "application",
      "root": "apps/scheduler-service",
      "entryFile": "main",
      "sourceRoot": "apps/scheduler-service/src",
      "compilerOptions": {
        "tsConfigPath": "apps/scheduler-service/tsconfig.app.json"
      }
    },
    "game-server": {
      "type": "application",
      "root": "apps/game-server",
      "entryFile": "main",
      "sourceRoot": "apps/game-server/src",
      "compilerOptions": {
        "tsConfigPath": "apps/game-server/tsconfig.app.json"
      }
    },
    "analytics-service": {
      "type": "application",
      "root": "apps/analytics-service",
      "entryFile": "main",
      "sourceRoot": "apps/analytics-service/src",
      "compilerOptions": {
        "tsConfigPath": "apps/analytics-service/tsconfig.app.json"
      }
    },
    "common": {
      "type": "library",
      "root": "libs/common",
      "entryFile": "index",
      "sourceRoot": "libs/common/src",
      "compilerOptions": {
        "tsConfigPath": "libs/common/tsconfig.lib.json"
      }
    },
    "database": {
      "type": "library",
      "root": "libs/database",
      "entryFile": "index",
      "sourceRoot": "libs/database/src",
      "compilerOptions": {
        "tsConfigPath": "libs/database/tsconfig.lib.json"
      }
    },
    "auth": {
      "type": "library",
      "root": "libs/auth",
      "entryFile": "index",
      "sourceRoot": "libs/auth/src",
      "compilerOptions": {
        "tsConfigPath": "libs/auth/tsconfig.lib.json"
      }
    },
    "nats-client": {
      "type": "library",
      "root": "libs/nats-client",
      "entryFile": "index",
      "sourceRoot": "libs/nats-client/src",
      "compilerOptions": {
        "tsConfigPath": "libs/nats-client/tsconfig.lib.json"
      }
    },
    "contracts": {
      "type": "library",
      "root": "libs/contracts",
      "entryFile": "index",
      "sourceRoot": "libs/contracts/src",
      "compilerOptions": {
        "tsConfigPath": "libs/contracts/tsconfig.lib.json"
      }
    }
  }
}
```

### tsconfig.json (paths)

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@app/common": ["libs/common/src"],
      "@app/common/*": ["libs/common/src/*"],
      "@app/database": ["libs/database/src"],
      "@app/database/*": ["libs/database/src/*"],
      "@app/auth": ["libs/auth/src"],
      "@app/auth/*": ["libs/auth/src/*"],
      "@app/nats-client": ["libs/nats-client/src"],
      "@app/nats-client/*": ["libs/nats-client/src/*"],
      "@app/contracts": ["libs/contracts/src"],
      "@app/contracts/*": ["libs/contracts/src/*"]
    }
  }
}
```

### package.json (scripts)

```json
{
  "name": "survival-syndicate-server",
  "version": "0.0.1",
  "scripts": {
    "prebuild": "rimraf dist",
    "build": "nest build",
    "build:all": "npm run build api-gateway && npm run build auth-service && npm run build player-service && npm run build building-service && npm run build combat-progress-service && npm run build scheduler-service && npm run build game-server && npm run build analytics-service",
    
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/apps/api-gateway/main",
    
    "start:api-gateway": "nest start api-gateway",
    "start:api-gateway:dev": "nest start api-gateway --watch",
    "start:auth-service": "nest start auth-service",
    "start:auth-service:dev": "nest start auth-service --watch",
    "start:player-service": "nest start player-service",
    "start:player-service:dev": "nest start player-service --watch",
    "start:building-service": "nest start building-service",
    "start:building-service:dev": "nest start building-service --watch",
    "start:combat-progress-service": "nest start combat-progress-service",
    "start:combat-progress-service:dev": "nest start combat-progress-service --watch",
    "start:scheduler-service": "nest start scheduler-service",
    "start:scheduler-service:dev": "nest start scheduler-service --watch",
    "start:game-server": "nest start game-server",
    "start:game-server:dev": "nest start game-server --watch",
    "start:analytics-service": "nest start analytics-service",
    "start:analytics-service:dev": "nest start analytics-service --watch",
    
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./apps/api-gateway/test/jest-e2e.json",
    
    "prisma:generate": "npm run prisma:generate:meta && npm run prisma:generate:catalog",
    "prisma:generate:meta": "prisma generate --schema=prisma/meta/schema.prisma",
    "prisma:generate:catalog": "prisma generate --schema=prisma/catalog/schema.prisma",
    
    "prisma:migrate:dev": "npm run prisma:migrate:dev:meta && npm run prisma:migrate:dev:catalog",
    "prisma:migrate:dev:meta": "prisma migrate dev --schema=prisma/meta/schema.prisma",
    "prisma:migrate:dev:catalog": "prisma migrate dev --schema=prisma/catalog/schema.prisma",
    
    "prisma:migrate:deploy": "npm run prisma:migrate:deploy:meta && npm run prisma:migrate:deploy:catalog",
    "prisma:migrate:deploy:meta": "prisma migrate deploy --schema=prisma/meta/schema.prisma",
    "prisma:migrate:deploy:catalog": "prisma migrate deploy --schema=prisma/catalog/schema.prisma",
    
    "prisma:migrate:all": "npm run prisma:migrate:dev",
    
    "prisma:studio:meta": "prisma studio --schema=prisma/meta/schema.prisma",
    "prisma:studio:catalog": "prisma studio --schema=prisma/catalog/schema.prisma",
    
    "prisma:seed": "ts-node prisma/seed.ts",
    "prisma:reset": "npm run prisma:reset:meta && npm run prisma:reset:catalog && npm run prisma:seed",
    "prisma:reset:meta": "prisma migrate reset --schema=prisma/meta/schema.prisma --force",
    "prisma:reset:catalog": "prisma migrate reset --schema=prisma/catalog/schema.prisma --force",
    
    "docker:infra": "docker compose -f docker/docker-compose.infra.yml up -d",
    "docker:infra:down": "docker compose -f docker/docker-compose.infra.yml down",
    "docker:full": "docker compose -f docker/docker-compose.full.yml up -d",
    "docker:full:down": "docker compose -f docker/docker-compose.full.yml down"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/microservices": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/terminus": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.0",
    "nats": "^2.0.0",
    "class-transformer": "^0.5.0",
    "class-validator": "^0.14.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.0.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.0",
    "@types/jest": "^29.0.0",
    "@types/node": "^20.0.0",
    "@types/passport-jwt": "^4.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.0.0",
    "prettier": "^3.0.0",
    "prisma": "^5.0.0",
    "rimraf": "^5.0.0",
    "source-map-support": "^0.5.0",
    "ts-jest": "^29.0.0",
    "ts-loader": "^9.0.0",
    "ts-node": "^10.0.0",
    "tsconfig-paths": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 5. Shared Libraries

### @app/common

```typescript
// libs/common/src/index.ts
export * from './decorators';
export * from './filters';
export * from './interceptors';
export * from './pipes';
export * from './guards';
export * from './utils';
export * from './common.module';
```

```typescript
// libs/common/src/common.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  exports: [ConfigModule],
})
export class CommonModule {}
```

### @app/contracts (типизированные контракты)

```typescript
// libs/contracts/src/index.ts
export * from './events';
export * from './commands';
export * from './dto';
```

```typescript
// libs/contracts/src/events/building.events.ts
export const BUILDING_EVENTS = {
  BUILT: 'building.event.built',
  UPGRADED: 'building.event.upgraded',
  CONTENT_UNLOCKED: 'building.event.content_unlocked',
} as const;

export interface BuildingBuiltEvent {
  characterId: string;
  buildingId: string;
  buildingType: string;
  timestamp: string;
}

export interface BuildingUpgradedEvent {
  characterId: string;
  buildingId: string;
  oldLevel: number;
  newLevel: number;
  timestamp: string;
}
```

```typescript
// libs/contracts/src/commands/player.commands.ts
export const PLAYER_COMMANDS = {
  GET: 'player.get',
  CREATE: 'player.create',
  UPDATE: 'player.update',
} as const;

export interface PlayerGetCommand {
  playerId: string;
}

export interface PlayerGetResponse {
  success: boolean;
  player?: {
    id: string;
    username: string;
    createdAt: string;
  };
  error?: string;
}
```

---

## 6. Пример сервиса

### main.ts

```typescript
// apps/player-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // NATS microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || 'nats://localhost:4222'],
      queue: 'player-service',
    },
  });

  await app.startAllMicroservices();

  // HTTP for health checks & metrics
  const port = process.env.MANAGEMENT_PORT || 9002;
  await app.listen(port);
  
  console.log(`Player Service running on port ${port}`);
}
bootstrap();
```

### app.module.ts

```typescript
// apps/player-service/src/app.module.ts
import { Module } from '@nestjs/common';
import { CommonModule } from '@app/common';
import { DatabaseModule } from '@app/database';
import { NatsClientModule } from '@app/nats-client';
import { PlayerModule } from './player/player.module';
import { CharacterModule } from './character/character.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    CommonModule,
    DatabaseModule,
    NatsClientModule,
    PlayerModule,
    CharacterModule,
    HealthModule,
  ],
})
export class AppModule {}
```

---

## 7. Команды разработки

```bash
# Запуск инфраструктуры
npm run docker:infra

# Генерация Prisma клиентов
npm run prisma:generate

# Миграции (dev)
npm run prisma:migrate:dev

# Запуск одного сервиса в dev режиме
npm run start:player-service:dev

# Запуск нескольких сервисов (в разных терминалах)
npm run start:api-gateway:dev
npm run start:auth-service:dev
npm run start:player-service:dev

# Сборка всего
npm run build:all

# Тесты
npm test
npm run test:cov
```

---

## 8. Docker сборка

### Dockerfile (multi-stage)

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
ARG APP_NAME
RUN npm run build ${APP_NAME}

# Production
FROM node:20-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

ARG APP_NAME
COPY --from=builder /app/dist/apps/${APP_NAME} ./dist

ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
```

### Сборка образа

```bash
# Собираем конкретный сервис
docker build --build-arg APP_NAME=player-service -t survival/player-service:latest .

# Или через compose
docker compose -f docker/docker-compose.full.yml build
```
