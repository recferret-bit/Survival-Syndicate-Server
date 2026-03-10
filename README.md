# Survival Syndicate Server

Бэкенд для онлайн-мультиплеерной выживалки Survival Syndicate. Построен как монорепозиторий микросервисов на NestJS с принципами Clean Architecture.

## 🎯 Обзор проекта

Сервер является **абсолютным источником правды** для всего игрового состояния. Он запускает детерминированные симуляции игрового мира с фиксированным шагом времени, обрабатывает WebSocket-коммуникацию в реальном времени и управляет мета-прогрессией (здания, боевая прогрессия, аккаунты игроков).

### Ключевые особенности

- **Двухуровневая архитектура**: Центральная зона (Global Scope) + Локальные зоны (Zone Scope)
- **Clean Architecture**: Строгое разделение слоев с инверсией зависимостей
- **Детерминированный игровой цикл**: 30 FPS, серверная авторитативность
- **Компенсация лага**: Система "отмотки" мира для точной проверки попаданий
- **Мета-прогрессия**: Здания, Battle Pass (3 стрима), достижения, трофеи
- **Масштабируемость**: Региональные кластеры с WebSocket Gateway + Game Server Pods

## 🏗️ Архитектура

### Микросервисы

#### Центральная зона (Global Scope)
Сервисы без жёстких требований к задержке, работают глобально.

- **`swagger-aggregator`** — агрегирует OpenAPI-спецификации со всех сервисов, предоставляет единую Swagger UI
- **`auth-service`** — Аутентификация, JWT токены, refresh-токены
- **`matchmaking-service`** — Подбор зоны для игрока, выдача `websocketUrl`
- **`player-service`** — Аккаунты, персонажи (CRUD), друзья, баны
- **`building-service`** — Строительство, апгрейды, бонусы, разблокировка контента, пассивный доход
- **`combat-progress-service`** — Player Level (XP), Battle Pass, достижения, трофеи, боевой пул
- **`scheduler-service`** — Cron/Bull: пассивный доход, сброс заданий, ротация магазина, лидерборды
- **`collector-service`** — Приём аналитических событий, пакетная вставка в ClickHouse
- **`payment-service`** — Валидация IAP (Apple / Google Play)
- **`history-service`** — Запись и хранение реплеев/истории матчей

#### Локальная зона (Zone Scope)
Сервисы, работающие близко к игрокам; отвечают за реальный игровой процесс.

- **`local-orchestrator`** — Управляет зоной, принимает матчи от матчмейкера, масштабирует `gameplay-service`
- **`gameplay-service`** — Запускает и ведёт игровые симуляции (GameLoop, WorldState)
- **`websocket-service`** — Единая точка WebSocket-входа зоны, проксирует ввод/вывод через NATS

### Технологический стек

- **Фреймворк**: NestJS 11 с TypeScript 5.7
- **База данных**: PostgreSQL 15 с Prisma 7 ORM (Postgres_Meta + Postgres_Catalog)
- **Обмен сообщениями**: NATS для request-reply и pub/sub
- **Реальное время**: WebSocket (бинарный/JSON протокол)
- **Очереди**: Bull (Redis) для отложенных задач
- **Аналитика**: ClickHouse + Yandex DataLens
- **Кэш/Блокировки**: Redis
- **Документация**: Swagger/OpenAPI

### Слои Clean Architecture

```
Presentation (Внешний слой)
  ↓ зависит от
Application (Use Cases)
  ↓ зависит от
Domain (Бизнес-логика)
  ↓ зависит от
Infrastructure (База данных, внешние API)
```

**Структура директорий:**
```
apps/{service}/src/
├── domain/              # Чистая бизнес-логика, без зависимостей от фреймворка
│   ├── entities/        # Бизнес-сущности с идентификацией
│   └── services/        # Доменные сервисы (опционально)
├── application/         # Слой оркестрации
│   ├── use-cases/       # CQRS обработчики команд/запросов
│   └── ports/           # Абстрактные классы для инфраструктуры
├── infrastructure/      # Технические реализации
│   ├── prisma/          # Слой доступа к базе данных
│   │   ├── mapper/      # Конвертации Entity ↔ Prisma
│   │   └── repositories/ # Реализации репозиториев
│   └── external/        # Интеграции с внешними сервисами
└── presentation/        # Точки входа
    ├── http/            # HTTP контроллеры + DTOs
    ├── nats/            # Обработчики NATS сообщений
    └── websocket/       # WebSocket обработчики (game-server)
```

## 🚀 Быстрый старт

### Требования

- Node.js 20+ и npm
- Docker и Docker Compose
- PostgreSQL 15+
- Git

### Установка

```bash
# Клонировать репозиторий
git clone <repository-url>
cd survival-syndicate-server

# Установить зависимости
npm install

# Запустить инфраструктурные сервисы
npm run docker:infra

# Сгенерировать Prisma клиенты
npm run prisma:generate

# Запустить миграции
npm run prisma:migrate:dev

# Для start:local скопировать порты (чтобы каждый сервис слушал свой порт)
cp .env.example .env
```

### Запуск сервисов

```bash
# Запустить все сервисы локально (нужен .env с уникальными *_APP_PORT, см. .env.example)
npm run start:local

# Или один сервис в режиме watch
npm run start:player-service:dev
npm run start:building-service:dev
npm run start:game-server:dev

# Собрать все сервисы
npm run build:all
```

## 📚 Документация

Полная архитектурная документация в **[docs/](docs/)**:

- **[docs/index.md](docs/index.md)** — Индекс всех документов
- **[docs/01_server_development_guide.md](docs/01_server_development_guide.md)** — Полный гайд по разработке

### Архитектура (`docs/architecture/`) — 32 документа

- Сетевые оптимизации (Delta, Interest)
- Персистентность (PostgreSQL, ClickHouse)
- Anti-Cheat и валидация
- Building Service, Combat Progress Service, Player Service, Scheduler Service
- NATS Best Practices
- Структура проекта (NestJS Monorepo)
- Auth & Authorization (JWT, Guards)
- Database Migrations (Prisma ORM)
- API & WebSocket контракты, JSON протокол, Connection Handling
- Gameplay Service Internals (ECS, GameLoop, интерфейсы)

**Дополнительно:**
- [WARP.md](WARP.md) — Руководство для AI-агентов
- [AGENTS.md](AGENTS.md) — Правила Cursor

## 🧪 Тестирование

```bash
# Запустить все тесты
npm test

# Режим watch
npm run test:watch

# Покрытие
npm run test:cov

# E2E тесты
npm run test:e2e
```

## 🗄️ Управление базой данных

### Prisma

В текущей локальной конфигурации используются две Prisma-схемы: **users** и **balance**.

```bash
# Сгенерировать Prisma клиенты
npm run prisma:generate

# Миграции (разработка)
npm run prisma:migrate:dev

# Миграции (деплой)
npm run prisma:migrate:deploy

# Prisma Studio
npm run prisma:studio:users
npm run prisma:studio:balance
```

## 🔄 Межсервисная коммуникация

### NATS

**Никогда не хардкодите NATS subjects. Используйте библиотечные контракты.**

```typescript
// ✅ ПРАВИЛЬНО
import { PlayerPublisher } from '@lib/lib-gameplay';
const response = await playerPublisher.getCharacter(request);

// ❌ НЕПРАВИЛЬНО
natsClient.send('player.get-character.v1', data);
```

**Библиотеки коммуникации:**
- `@lib/lib-player` — PlayerPublisher, PlayerSubjects
- `@lib/lib-building` — BuildingPublisher, BuildingSubjects
- `@lib/lib-game-server` — GameServerPublisher, GameServerSubjects
- `@lib/lib-combat-progress` — CombatProgressPublisher, CombatProgressSubjects
- `@lib/lib-analytics` — AnalyticsPublisher, AnalyticsSubjects

## 📦 Алиасы путей

```plaintext
# Приложения
@app/swagger-aggregator/*
@app/auth-service/*
@app/player-service/*
@app/building-service/*
@app/combat-progress-service/*
@app/scheduler-service/*
@app/game-server/*
@app/analytics-service/*

# Библиотеки
@lib/shared/*
@lib/lib-player/*
@lib/lib-building/*
@lib/lib-game-server/*
@lib/lib-combat-progress/*
@lib/lib-analytics/*

# Prisma
@prisma/meta
@prisma/catalog
```

## 🔗 Связанные репозитории

- **GDD:** https://github.com/recferret-bit/Survival-Syndicate-GDD
- **Client:** https://github.com/recferret-bit/Survival-Syndicate-Client
