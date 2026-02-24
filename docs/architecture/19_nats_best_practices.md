# 19. NATS Best Practices — Паттерны и JetStream в NestJS

## 1. Обзор NATS

NATS — высокопроизводительная система обмена сообщениями. Поддерживает три модели:

| Модель | Описание | Гарантия доставки | Use Case |
|--------|----------|-------------------|----------|
| **Pub/Sub** | Fire-and-forget broadcast | At-most-once | Events, notifications |
| **Request/Reply** | Синхронный запрос-ответ | At-most-once | RPC между сервисами |
| **JetStream** | Персистентные стримы | At-least-once / Exactly-once | Критичные события, очереди |

---

## 2. Установка и настройка

### Зависимости

```bash
npm install nats @nestjs/microservices
```

### Подключение NATS в NestJS

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // HTTP сервер
  const app = await NestFactory.create(AppModule);
  
  // NATS микросервис
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || 'nats://localhost:4222'],
      queue: 'player-service', // Queue group для load balancing
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
```

### NATS Client Module

```typescript
// nats-client.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL || 'nats://localhost:4222'],
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class NatsClientModule {}
```

---

## 3. Паттерн 1: Request/Reply (RPC)

Синхронный запрос между сервисами. Клиент ждёт ответа.

### Сервер (обработчик запроса)

```typescript
// player.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  // Обработка запроса
  @MessagePattern('player.get')
  async getPlayer(@Payload() data: { playerId: string }) {
    const player = await this.playerService.findById(data.playerId);
    if (!player) {
      return { error: 'PLAYER_NOT_FOUND', playerId: data.playerId };
    }
    return { success: true, player };
  }

  @MessagePattern('player.create')
  async createPlayer(@Payload() data: CreatePlayerDto) {
    const player = await this.playerService.create(data);
    return { success: true, player };
  }

  // С валидацией
  @MessagePattern('player.update')
  async updatePlayer(@Payload() data: { playerId: string; updates: Partial<Player> }) {
    try {
      const player = await this.playerService.update(data.playerId, data.updates);
      return { success: true, player };
    } catch (error) {
      return { error: error.message, code: 'UPDATE_FAILED' };
    }
  }
}
```

### Клиент (отправка запроса)

```typescript
// building.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';

@Injectable()
export class BuildingService {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async getPlayerForBuilding(playerId: string): Promise<Player> {
    // Отправляем запрос и ждём ответ
    const response = await firstValueFrom(
      this.natsClient.send('player.get', { playerId }).pipe(
        timeout(5000), // Таймаут 5 секунд
        catchError((err) => {
          throw new Error(`Player service unavailable: ${err.message}`);
        }),
      ),
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response.player;
  }

  // Паттерн с retry
  async getPlayerWithRetry(playerId: string, retries = 3): Promise<Player> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.getPlayerForBuilding(playerId);
      } catch (error) {
        if (attempt === retries) throw error;
        await this.delay(100 * attempt); // Exponential backoff
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

### Request/Reply с типизацией

```typescript
// contracts/player.contracts.ts
export interface PlayerGetRequest {
  playerId: string;
}

export interface PlayerGetResponse {
  success: boolean;
  player?: Player;
  error?: string;
}

// Типизированный клиент
async getPlayer(playerId: string): Promise<PlayerGetResponse> {
  return firstValueFrom(
    this.natsClient.send<PlayerGetResponse, PlayerGetRequest>(
      'player.get',
      { playerId },
    ).pipe(timeout(5000)),
  );
}
```

---

## 4. Паттерн 2: Pub/Sub (Broadcast)

Fire-and-forget события. Отправитель не ждёт ответа.

### Publisher (отправка события)

```typescript
// building.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class BuildingService {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async upgradeBuilding(characterId: string, buildingId: string): Promise<Building> {
    const building = await this.buildingRepo.upgrade(characterId, buildingId);

    // Публикуем событие (fire-and-forget)
    this.natsClient.emit('building.event.upgraded', {
      characterId,
      buildingId,
      newLevel: building.level,
      timestamp: new Date().toISOString(),
    });

    // Если разблокировался контент
    if (building.unlockedContent) {
      this.natsClient.emit('building.event.content_unlocked', {
        characterId,
        buildingId,
        contentType: building.unlockedContent.type,
        contentId: building.unlockedContent.id,
        timestamp: new Date().toISOString(),
      });
    }

    return building;
  }
}
```

### Subscriber (получение события)

```typescript
// analytics.controller.ts
import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, NatsContext } from '@nestjs/microservices';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Подписка на событие
  @EventPattern('building.event.upgraded')
  async handleBuildingUpgraded(
    @Payload() data: BuildingUpgradedEvent,
    @Ctx() context: NatsContext,
  ) {
    console.log('Received on subject:', context.getSubject());
    
    await this.analyticsService.trackEvent({
      type: 'building_upgraded',
      characterId: data.characterId,
      metadata: {
        buildingId: data.buildingId,
        newLevel: data.newLevel,
      },
      timestamp: data.timestamp,
    });
  }

  // Wildcard подписка
  @EventPattern('building.event.*')
  async handleAllBuildingEvents(@Payload() data: any, @Ctx() context: NatsContext) {
    const eventType = context.getSubject().split('.').pop();
    console.log(`Building event: ${eventType}`, data);
  }
}
```

### Подписка на wildcard топики

```typescript
// Иерархия топиков
// building.event.built
// building.event.upgraded
// building.event.destroyed
// building.event.content_unlocked

// Подписка на все building.event.*
@EventPattern('building.event.*')

// Подписка на все события всех сервисов
@EventPattern('*.event.*')

// Подписка на конкретный уровень вложенности
@EventPattern('building.>')  // Все что начинается с building.
```

---

## 5. Queue Groups (Load Balancing)

Распределение нагрузки между инстансами одного сервиса.

```typescript
// main.ts — каждый инстанс подключается к одной queue group
app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
    queue: 'building-service', // Все инстансы building-service в одной группе
  },
});
```

**Поведение:**
- Сообщение доставляется только ОДНОМУ инстансу из группы
- NATS автоматически балансирует нагрузку
- Если инстанс падает, сообщения идут на другие

```
                    ┌──────────────────┐
                    │  building-service │ (instance 1)
Publisher ──────────┤  queue group      │
  emit()            │                  │
                    ├──────────────────┤
                    │  building-service │ (instance 2)
                    │  queue group      │
                    └──────────────────┘
                    
Сообщение получит только ОДИН инстанс
```

### Broadcast vs Queue Group

```typescript
// BROADCAST: все подписчики получат сообщение
// Не указываем queue в настройках
app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
    // queue НЕ указан = broadcast
  },
});

// QUEUE GROUP: только один из группы получит
app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
    queue: 'my-service-group', // указан = load balanced
  },
});
```

---

## 6. JetStream — Персистентные стримы

NestJS не имеет встроенной поддержки JetStream. Используем нативный NATS клиент.

### JetStream Module

```typescript
// jetstream/jetstream.module.ts
import { Module, Global, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, NatsConnection, JetStreamManager, JetStreamClient } from 'nats';

@Global()
@Module({
  providers: [
    {
      provide: 'NATS_CONNECTION',
      useFactory: async () => {
        const nc = await connect({
          servers: process.env.NATS_URL || 'nats://localhost:4222',
        });
        console.log('Connected to NATS');
        return nc;
      },
    },
    {
      provide: 'JETSTREAM_CLIENT',
      useFactory: (nc: NatsConnection) => nc.jetstream(),
      inject: ['NATS_CONNECTION'],
    },
    {
      provide: 'JETSTREAM_MANAGER',
      useFactory: (nc: NatsConnection) => nc.jetstreamManager(),
      inject: ['NATS_CONNECTION'],
    },
  ],
  exports: ['NATS_CONNECTION', 'JETSTREAM_CLIENT', 'JETSTREAM_MANAGER'],
})
export class JetStreamModule implements OnModuleDestroy {
  constructor(
    @Inject('NATS_CONNECTION') private readonly nc: NatsConnection,
  ) {}

  async onModuleDestroy() {
    await this.nc.drain();
    console.log('NATS connection closed');
  }
}
```

### Инициализация Streams

```typescript
// jetstream/jetstream-setup.service.ts
import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { JetStreamManager, StreamConfig, RetentionPolicy, StorageType } from 'nats';

@Injectable()
export class JetStreamSetupService implements OnModuleInit {
  constructor(
    @Inject('JETSTREAM_MANAGER') private readonly jsm: JetStreamManager,
  ) {}

  async onModuleInit() {
    await this.setupStreams();
  }

  private async setupStreams() {
    // Stream для игровых событий
    await this.ensureStream({
      name: 'GAME_EVENTS',
      subjects: ['game.event.*', 'match.event.*'],
      retention: RetentionPolicy.Limits,
      storage: StorageType.File,
      max_msgs: 1_000_000,
      max_bytes: 1024 * 1024 * 1024, // 1GB
      max_age: 7 * 24 * 60 * 60 * 1_000_000_000, // 7 days in nanoseconds
      num_replicas: 1,
    });

    // Stream для критичных транзакций
    await this.ensureStream({
      name: 'TRANSACTIONS',
      subjects: ['transaction.*'],
      retention: RetentionPolicy.Limits,
      storage: StorageType.File,
      max_msgs: 10_000_000,
      max_age: 30 * 24 * 60 * 60 * 1_000_000_000, // 30 days
      num_replicas: 1,
    });

    // Stream для аналитики
    await this.ensureStream({
      name: 'ANALYTICS',
      subjects: ['analytics.*', 'building.event.*', 'combat.event.*'],
      retention: RetentionPolicy.Limits,
      storage: StorageType.File,
      max_msgs: 10_000_000,
      max_bytes: 10 * 1024 * 1024 * 1024, // 10GB
      max_age: 90 * 24 * 60 * 60 * 1_000_000_000, // 90 days
      num_replicas: 1,
    });
  }

  private async ensureStream(config: Partial<StreamConfig> & { name: string }) {
    try {
      await this.jsm.streams.info(config.name);
      console.log(`Stream ${config.name} already exists`);
      // Опционально: обновить конфигурацию
      // await this.jsm.streams.update(config.name, config);
    } catch (err) {
      if (err.code === '404') {
        await this.jsm.streams.add(config as StreamConfig);
        console.log(`Stream ${config.name} created`);
      } else {
        throw err;
      }
    }
  }
}
```

### JetStream Publisher

```typescript
// jetstream/jetstream-publisher.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { JetStreamClient, PubAck, StringCodec } from 'nats';

@Injectable()
export class JetStreamPublisher {
  private sc = StringCodec();

  constructor(
    @Inject('JETSTREAM_CLIENT') private readonly js: JetStreamClient,
  ) {}

  // Публикация с подтверждением (at-least-once)
  async publish<T>(subject: string, data: T): Promise<PubAck> {
    const payload = this.sc.encode(JSON.stringify(data));
    const ack = await this.js.publish(subject, payload);
    
    console.log(`Published to ${subject}, seq: ${ack.seq}, stream: ${ack.stream}`);
    return ack;
  }

  // Публикация с дедупликацией
  async publishWithDedup<T>(
    subject: string,
    data: T,
    msgId: string,
  ): Promise<PubAck> {
    const payload = this.sc.encode(JSON.stringify(data));
    const ack = await this.js.publish(subject, payload, {
      msgID: msgId, // Для дедупликации
    });
    return ack;
  }

  // Публикация с ожиданием ACK
  async publishAndWait<T>(
    subject: string,
    data: T,
    timeoutMs = 5000,
  ): Promise<PubAck> {
    const payload = this.sc.encode(JSON.stringify(data));
    const ack = await this.js.publish(subject, payload, {
      timeout: timeoutMs,
    });
    return ack;
  }
}
```

### JetStream Consumer (Pull-based)

```typescript
// jetstream/jetstream-consumer.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import {
  JetStreamClient,
  JetStreamManager,
  NatsConnection,
  ConsumerConfig,
  AckPolicy,
  DeliverPolicy,
  StringCodec,
  JsMsg,
} from 'nats';

@Injectable()
export class JetStreamConsumer implements OnModuleInit, OnModuleDestroy {
  private sc = StringCodec();
  private subscriptions: Map<string, any> = new Map();

  constructor(
    @Inject('NATS_CONNECTION') private readonly nc: NatsConnection,
    @Inject('JETSTREAM_CLIENT') private readonly js: JetStreamClient,
    @Inject('JETSTREAM_MANAGER') private readonly jsm: JetStreamManager,
  ) {}

  async onModuleInit() {
    // Создаём consumers при старте
  }

  async onModuleDestroy() {
    // Отписываемся
    for (const sub of this.subscriptions.values()) {
      await sub.drain();
    }
  }

  // Создание durable consumer
  async createConsumer(
    streamName: string,
    consumerName: string,
    filterSubject?: string,
  ): Promise<void> {
    const config: Partial<ConsumerConfig> = {
      durable_name: consumerName,
      ack_policy: AckPolicy.Explicit,
      deliver_policy: DeliverPolicy.All,
      filter_subject: filterSubject,
      max_deliver: 3, // Retry 3 раза
      ack_wait: 30_000_000_000, // 30 секунд на обработку
    };

    try {
      await this.jsm.consumers.add(streamName, config);
      console.log(`Consumer ${consumerName} created on stream ${streamName}`);
    } catch (err) {
      if (!err.message.includes('already exists')) {
        throw err;
      }
    }
  }

  // Pull-based consuming (рекомендуется для большинства случаев)
  async startPullConsumer<T>(
    streamName: string,
    consumerName: string,
    handler: (msg: T, raw: JsMsg) => Promise<void>,
    batchSize = 10,
  ): Promise<void> {
    const consumer = await this.js.consumers.get(streamName, consumerName);

    const processMessages = async () => {
      while (true) {
        try {
          const messages = await consumer.fetch({ max_messages: batchSize, expires: 5000 });

          for await (const msg of messages) {
            try {
              const data = JSON.parse(this.sc.decode(msg.data)) as T;
              await handler(data, msg);
              msg.ack(); // Подтверждаем успешную обработку
            } catch (err) {
              console.error('Message processing error:', err);
              msg.nak(); // Negative ack — сообщение будет переотправлено
            }
          }
        } catch (err) {
          if (err.code !== '408') { // Timeout is expected
            console.error('Fetch error:', err);
            await this.delay(1000);
          }
        }
      }
    };

    // Запускаем в фоне
    processMessages().catch(console.error);
  }

  // Push-based consuming (для real-time)
  async startPushConsumer<T>(
    streamName: string,
    consumerName: string,
    handler: (msg: T, raw: JsMsg) => Promise<void>,
  ): Promise<void> {
    const consumer = await this.js.consumers.get(streamName, consumerName);
    const sub = await consumer.consume();

    this.subscriptions.set(`${streamName}:${consumerName}`, sub);

    (async () => {
      for await (const msg of sub) {
        try {
          const data = JSON.parse(this.sc.decode(msg.data)) as T;
          await handler(data, msg);
          msg.ack();
        } catch (err) {
          console.error('Message processing error:', err);
          msg.nak();
        }
      }
    })().catch(console.error);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

### Использование JetStream в сервисе

```typescript
// analytics/analytics.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { JetStreamPublisher } from '../jetstream/jetstream-publisher.service';
import { JetStreamConsumer } from '../jetstream/jetstream-consumer.service';

@Injectable()
export class AnalyticsService implements OnModuleInit {
  constructor(
    private readonly jsPublisher: JetStreamPublisher,
    private readonly jsConsumer: JetStreamConsumer,
    private readonly clickhouseService: ClickHouseService,
  ) {}

  async onModuleInit() {
    // Создаём consumer для аналитики
    await this.jsConsumer.createConsumer(
      'ANALYTICS',
      'analytics-processor',
      'analytics.*',
    );

    // Запускаем обработку
    await this.jsConsumer.startPullConsumer<AnalyticsEvent>(
      'ANALYTICS',
      'analytics-processor',
      this.handleAnalyticsEvent.bind(this),
      100, // Batch size
    );
  }

  // Публикация события
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    await this.jsPublisher.publish('analytics.event', {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    });
  }

  // Обработка события
  private async handleAnalyticsEvent(event: AnalyticsEvent, msg: JsMsg): Promise<void> {
    // Сохраняем в ClickHouse
    await this.clickhouseService.insert('events', event);
    
    console.log(`Processed event: ${event.type}, seq: ${msg.seq}`);
  }
}
```

---

## 7. Паттерн: Exactly-Once с дедупликацией

```typescript
// transaction.service.ts
@Injectable()
export class TransactionService {
  constructor(
    private readonly jsPublisher: JetStreamPublisher,
    private readonly transactionRepo: TransactionRepository,
  ) {}

  async processPayment(paymentId: string, amount: number): Promise<void> {
    // Генерируем уникальный ID для дедупликации
    const msgId = `payment:${paymentId}:${Date.now()}`;

    // JetStream отклонит дубликат с тем же msgID в течение окна дедупликации
    await this.jsPublisher.publishWithDedup(
      'transaction.payment',
      {
        paymentId,
        amount,
        timestamp: new Date().toISOString(),
      },
      msgId,
    );
  }
}
```

### Настройка окна дедупликации в Stream

```typescript
await this.jsm.streams.add({
  name: 'TRANSACTIONS',
  subjects: ['transaction.*'],
  retention: RetentionPolicy.Limits,
  storage: StorageType.File,
  duplicate_window: 2 * 60 * 1_000_000_000, // 2 минуты в наносекундах
  // ...
});
```

---

## 8. Паттерн: Work Queue с JetStream

Распределение задач между воркерами.

```typescript
// job-queue.service.ts
@Injectable()
export class JobQueueService implements OnModuleInit {
  constructor(
    private readonly jsPublisher: JetStreamPublisher,
    private readonly jsConsumer: JetStreamConsumer,
  ) {}

  async onModuleInit() {
    // Создаём stream для задач
    await this.setupJobStream();
    
    // Создаём consumer с queue group
    await this.jsConsumer.createConsumer('JOBS', 'job-worker', 'job.*');
  }

  private async setupJobStream() {
    // См. JetStreamSetupService
  }

  // Добавление задачи
  async enqueue(jobType: string, payload: any, options?: JobOptions): Promise<string> {
    const jobId = crypto.randomUUID();
    
    await this.jsPublisher.publish(`job.${jobType}`, {
      jobId,
      payload,
      createdAt: new Date().toISOString(),
      priority: options?.priority || 'normal',
    });

    return jobId;
  }

  // Запуск воркера
  async startWorker(
    jobType: string,
    handler: (job: Job) => Promise<void>,
  ): Promise<void> {
    await this.jsConsumer.startPullConsumer<Job>(
      'JOBS',
      'job-worker',
      async (job, msg) => {
        console.log(`Processing job ${job.jobId}`);
        
        try {
          await handler(job);
          msg.ack();
        } catch (err) {
          console.error(`Job ${job.jobId} failed:`, err);
          
          // Проверяем количество попыток
          if (msg.info.redeliveryCount >= 3) {
            // Перемещаем в dead letter
            await this.jsPublisher.publish('job.dead_letter', {
              ...job,
              error: err.message,
              failedAt: new Date().toISOString(),
            });
            msg.ack(); // Убираем из очереди
          } else {
            msg.nak(); // Retry
          }
        }
      },
      1, // Обрабатываем по одной задаче
    );
  }
}
```

---

## 9. Паттерн: Event Sourcing

```typescript
// event-store.service.ts
@Injectable()
export class EventStoreService implements OnModuleInit {
  constructor(
    @Inject('JETSTREAM_MANAGER') private readonly jsm: JetStreamManager,
    private readonly jsPublisher: JetStreamPublisher,
    private readonly jsConsumer: JetStreamConsumer,
  ) {}

  async onModuleInit() {
    await this.setupEventStream();
  }

  private async setupEventStream() {
    await this.jsm.streams.add({
      name: 'EVENT_STORE',
      subjects: ['entity.*.event'],
      retention: RetentionPolicy.Limits,
      storage: StorageType.File,
      max_msgs_per_subject: 10000, // Макс событий на entity
      max_age: 365 * 24 * 60 * 60 * 1_000_000_000, // 1 год
    });
  }

  // Публикация события сущности
  async appendEvent(entityType: string, entityId: string, event: DomainEvent): Promise<void> {
    const subject = `entity.${entityType}.event`;
    
    await this.jsPublisher.publishWithDedup(subject, {
      entityId,
      eventType: event.type,
      payload: event.payload,
      version: event.version,
      timestamp: new Date().toISOString(),
    }, `${entityId}:${event.version}`);
  }

  // Восстановление состояния из событий
  async replayEvents<T>(
    entityType: string,
    entityId: string,
    reducer: (state: T, event: DomainEvent) => T,
    initialState: T,
  ): Promise<T> {
    const consumer = await this.js.consumers.get('EVENT_STORE', `replay-${entityId}`);
    
    let state = initialState;
    const messages = await consumer.fetch({ max_messages: 10000 });
    
    for await (const msg of messages) {
      const event = JSON.parse(this.sc.decode(msg.data));
      if (event.entityId === entityId) {
        state = reducer(state, event);
      }
      msg.ack();
    }
    
    return state;
  }
}
```

---

## 10. Error Handling и Retry

### Глобальный exception filter для NATS

```typescript
// filters/nats-exception.filter.ts
import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class NatsExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToRpc();
    const data = ctx.getData();

    console.error('NATS Error:', {
      message: exception.message,
      stack: exception.stack,
      data,
    });

    return throwError(() => ({
      error: exception.message || 'Internal error',
      code: exception.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    }));
  }
}

// main.ts
app.useGlobalFilters(new NatsExceptionFilter());
```

### Retry с exponential backoff

```typescript
// utils/retry.ts
import { Observable, retry, timer } from 'rxjs';

export function retryWithBackoff<T>(
  maxRetries: number = 3,
  initialDelay: number = 1000,
): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>) =>
    source.pipe(
      retry({
        count: maxRetries,
        delay: (error, retryCount) => {
          const delay = initialDelay * Math.pow(2, retryCount - 1);
          console.log(`Retry ${retryCount}/${maxRetries} after ${delay}ms`);
          return timer(delay);
        },
      }),
    );
}

// Использование
const response = await firstValueFrom(
  this.natsClient.send('player.get', { playerId }).pipe(
    timeout(5000),
    retryWithBackoff(3, 500),
  ),
);
```

---

## 11. Observability

### Трассировка NATS сообщений

```typescript
// interceptors/nats-tracing.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import * as opentelemetry from '@opentelemetry/api';

@Injectable()
export class NatsTracingInterceptor implements NestInterceptor {
  private tracer = opentelemetry.trace.getTracer('nats');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToRpc();
    const pattern = context.getHandler().name;
    const data = ctx.getData();

    const span = this.tracer.startSpan(`NATS ${pattern}`, {
      attributes: {
        'messaging.system': 'nats',
        'messaging.destination': pattern,
        'messaging.operation': 'receive',
      },
    });

    return next.handle().pipe(
      tap({
        next: () => span.setStatus({ code: opentelemetry.SpanStatusCode.OK }),
        error: (err) => {
          span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR, message: err.message });
          span.recordException(err);
        },
        finalize: () => span.end(),
      }),
    );
  }
}
```

### Метрики

```typescript
// metrics/nats-metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class NatsMetricsService {
  private messagesSent = new Counter({
    name: 'nats_messages_sent_total',
    help: 'Total NATS messages sent',
    labelNames: ['subject', 'type'],
  });

  private messagesReceived = new Counter({
    name: 'nats_messages_received_total',
    help: 'Total NATS messages received',
    labelNames: ['subject', 'status'],
  });

  private messageLatency = new Histogram({
    name: 'nats_message_latency_seconds',
    help: 'NATS message processing latency',
    labelNames: ['subject'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  });

  recordSent(subject: string, type: 'emit' | 'send') {
    this.messagesSent.inc({ subject, type });
  }

  recordReceived(subject: string, status: 'success' | 'error') {
    this.messagesReceived.inc({ subject, status });
  }

  recordLatency(subject: string, durationMs: number) {
    this.messageLatency.observe({ subject }, durationMs / 1000);
  }
}
```

---

## 12. Best Practices Summary

### Naming Conventions

```
# Request/Reply (RPC)
<service>.<action>
player.get
player.create
building.upgrade

# Events (Pub/Sub)
<service>.event.<action>
building.event.upgraded
combat.event.trophy_added
match.event.completed

# JetStream Streams
SCREAMING_SNAKE_CASE
GAME_EVENTS
TRANSACTIONS
ANALYTICS

# Consumers
kebab-case
analytics-processor
job-worker-1
```

### Чеклист

- [ ] Используй queue groups для load balancing
- [ ] Всегда устанавливай timeout на request/reply
- [ ] Для критичных событий используй JetStream
- [ ] Включи дедупликацию для идемпотентности
- [ ] Обрабатывай ошибки с retry и backoff
- [ ] Добавь метрики и трейсинг
- [ ] Используй типизированные контракты
- [ ] Настрой retention для streams
- [ ] Мониторь consumer lag

### Когда что использовать

| Сценарий | Паттерн |
|----------|---------|
| Синхронный запрос данных | Request/Reply |
| Уведомление о событии | Pub/Sub (emit) |
| Критичное событие (нельзя потерять) | JetStream |
| Распределённая очередь задач | JetStream Work Queue |
| Event Sourcing | JetStream с retention |
| Broadcast всем инстансам | Pub/Sub без queue group |
| Load balanced обработка | Queue group или JetStream |
