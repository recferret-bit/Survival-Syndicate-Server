# MVP План: "Каркас" серверной архитектуры

## 1. Цель MVP
Проверить и отладить всю межсервисную коммуникацию, описанную в архитектурных документах, без реализации сложной игровой логики (`GameLoop`).

**Ключевые инварианты, которые проверяет MVP:**
- В групповой игре каждый слот жёстко привязан к `playerId` с момента создания матча.
- После дисконнекта слот резервируется за тем же игроком на время `GRACE_PERIOD` (60 сек).
- Попытка реконнекта другого игрока в чужой слот отклоняется с кодом `SLOT_NOT_AVAILABLE`.

## 2. Список сервисов в MVP
- Auth Service
- Matchmaking Service (включая логику Лобби)
- Player Service
- Local Orchestrator
- Gameplay Service
- WebSocket Service

## 3. Задачи для реализации (Таск-борд)

### Epic 1: Базовая инфраструктура
-   [ ] **TASK-1.1:** Создать Monorepo-структуру проекта.
-   [ ] **TASK-1.2:** Настроить Docker Compose для всех сервисов.
-   [ ] **TASK-1.3:** Создать общую `libs` библиотеку.
-   [ ] **TASK-1.4:** Создать скаффолдинг всех MVP-сервисов — структура директорий и базовые файлы для каждого из: `auth-service`, `player-service`, `matchmaking-service`, `local-orchestrator`, `gameplay-service`, `websocket-service`.
    -   **Общая структура каждого сервиса:**
        ```
        apps/{service}/src/
        ├── domain/
        │   ├── entities/entity.ts          # abstract Entity<Props>
        │   └── value-objects/              # пусто
        ├── application/
        │   ├── application.module.ts       # ApplicationModule
        │   ├── ports/                      # абстрактные классы репозиториев
        │   └── use-cases/                 # пусто
        ├── infrastructure/
        │   ├── infrastructure.module.ts    # InfrastructureModule
        │   └── prisma/                    # PrismaModule + PrismaService (сервисы с БД)
        │       ├── prisma.module.ts
        │       ├── prisma.service.ts
        │       ├── mapper/
        │       └── repositories/
        ├── presentation/
        │   ├── presentation.module.ts      # PresentationModule
        │   ├── http/                       # HTTP контроллеры (заглушки)
        │   └── nats/                       # NATS контроллеры (заглушки)
        ├── app.module.ts
        └── main.ts
        package.json
        tsconfig.app.json
        ```
    -   **`gameplay-service`** дополнительно: `presentation/websocket/` (заглушка); базовые интерфейсы ECS: `ISystem`, `IComponent`, `WorldState` (stub), `GameLoop` (stub) в `domain/`.
    -   **`websocket-service`** дополнительно: `presentation/websocket/ws.gateway.ts` (заглушка `WsGateway`).
    -   **`matchmaking-service`** дополнительно: `infrastructure/prisma/` (PrismaModule + PrismaService для хранения лобби).
    -   PrismaService нужен для: `auth-service`, `player-service`, `matchmaking-service`.

### Epic 2: Реализация сервисов-"заглушек"
-   [ ] **TASK-2.1:** **Auth Service:**
    -   Реализовать регистрацию и логин.
    -   Публиковать событие `user.registered`.
-   [ ] **TASK-2.2:** **Player Service:**
    -   Подписаться на `user.registered` и создавать профиль игрока.
-   [ ] **TASK-2.3:** **Matchmaking Service:**
    -   Реализовать HTTP эндпоинты для управления лобби (`/api/lobbies/*`).
    -   Реализовать `POST /api/matchmaking/join-solo` для быстрого старта.
    -   Подписаться на `orchestrator.zone.heartbeat`.
    -   Подписаться на `match.finished` для обновления статуса лобби.
    -   При создании матча передавать Оркестратору **зафиксированный список `playerIds`** (слоты).
-   [ ] **TASK-2.4:** **Local Orchestrator:**
    -   Реализовать публикацию `orchestrator.zone.heartbeat`.
    -   Подписаться на `gameplay.service.heartbeat`.
    -   Реализовать логику выбора `Gameplay Service`.
    -   Реализовать отправку команды `gameplay.start_simulation` (включая список слотов).
    -   **Управление слотами:** хранить `Map<matchId, Map<playerId, SlotStatus>>` где `SlotStatus = 'active' | 'disconnected'`.
    -   **Grace Period:** при получении `player.connection.status` (disconnected) запускать таймер 60 сек. По истечении — отправлять в `Gameplay Service` команду `gameplay.remove_player`.
    -   **Блокировка чужого реконнекта:** при запросе `orchestrator.player.reconnect_request` проверять, что `playerId` из JWT присутствует в зафиксированных слотах данного матча. Возвращать ошибку `SLOT_NOT_AVAILABLE`, если это другой `playerId`.
-   [ ] **TASK-2.5:** **Gameplay Service:**
    -   Реализовать публикацию `gameplay.service.heartbeat`.
    -   Подписаться на `gameplay.start_simulation`.
    -   Реализовать честное управление `Map`'ой инстансов симуляций.
    -   Обрабатывать `gameplay.remove_player` — удалять игрока из симуляции по истечении grace period.
-   [ ] **TASK-2.6:** **WebSocket Service — первое подключение (connect):**
    -   Принимать `client.authenticate` (JWT + опционально `matchId`).
    -   Валидировать JWT, проверять присутствие `playerId` в слотах матча через NATS-запрос к Оркестратору.
    -   При успехе: отправлять `server.authenticate.success`, публиковать `player.connection.status {status: "connected"}`.
    -   При разрыве: отправлять `server.match.player_disconnected` остальным игрокам матча, публиковать `player.connection.status {status: "disconnected"}`.
-   [ ] **TASK-2.7:** **WebSocket Service — реконнект (reconnect):**
    -   Принимать `client.reconnect` (JWT) как первое сообщение нового WS-соединения.
    -   Делать NATS-запрос `orchestrator.player.reconnect_request` с `playerId`.
    -   Если Оркестратор вернул успех: отправлять `server.reconnect.success` с актуальным `matchId` + полным `WorldState`, публиковать `player.connection.status {status: "reconnected"}`, рассылать `server.match.player_reconnected` остальным игрокам.
    -   Если Оркестратор вернул ошибку (`SLOT_NOT_AVAILABLE` / `GRACE_EXPIRED` / `MATCH_NOT_FOUND`): отправлять `server.reconnect.error` с кодом и закрывать соединение.
    -   Реализовать логику синхронизации состояния лобби (`server.lobby.state_update`).
    -   Реализовать простое "эхо" в игровом режиме.

### Epic 3: Интеграционное тестирование
-   [ ] **TASK-3.1:** E2E тест — базовый флоу (connect → authenticate → echo → disconnect).
-   [ ] **TASK-3.2:** E2E тест — реконнект:
    1.  Зарегистрировать и аутентифицировать игрока.
    2.  Войти в матч, разорвать соединение.
    3.  Переподключиться тем же JWT в течение grace period — ожидать `server.reconnect.success`.
    4.  Переподключиться тем же JWT после истечения grace period — ожидать `server.reconnect.error { code: "GRACE_EXPIRED" }`.
-   [ ] **TASK-3.3:** E2E тест — защита слота:
    1.  Создать матч на двух игроков (игрок A и игрок B).
    2.  Игрок A разрывает соединение.
    3.  Игрок C пытается реконнектнуться в слот A с чужим JWT — ожидать `server.reconnect.error { code: "SLOT_NOT_AVAILABLE" }`.
    4.  Игрок A реконнектится с правильным JWT — ожидать успех.

## 4. Микросервисы вне MVP (пустые шаблоны)

Следующие микросервисы **не входят в скоуп MVP**, но создаются как полноценные пустые шаблоны с полной Clean Architecture структурой и базовыми классами.

### Epic 4: Создание пустых шаблонов non-MVP сервисов

#### Global Scope

-   [ ] **TASK-4.1:** `swagger-aggregator` — создать пустой шаблон.
    -   **Назначение:** Агрегирует OpenAPI-спецификации со всех сервисов, предоставляет единую Swagger UI.
    -   **Особенность:** Нет слоёв domain/application/infrastructure (чистый прокси).
    -   **Создать файлы:**
        -   `src/main.ts` — bootstrap через `ApplicationBootstrapBuilder`
        -   `src/app.module.ts` — `AppModule` с `MetricsModule`
        -   `src/presentation/presentation.module.ts` — `PresentationModule`
        -   `src/presentation/http/swagger-aggregator.http.controller.ts` — stub HTTP контроллер (GET `/openapi.json`)
        -   `package.json`, `tsconfig.app.json`

-   [ ] **TASK-4.2:** `building-service` — создать пустой шаблон.
    -   **Назначение:** Строительство, апгрейды, бонусы, разблокировка контента, пассивный доход.
    -   **Создать базовые классы:**
        -   `domain/entities/entity.ts` — `abstract Entity<Props>`
        -   `domain/entities/building/building.ts` — stub `BuildingEntity extends Entity<BuildingProps>`
        -   `domain/entities/building/building.type.ts` — тип `BuildingProps`
        -   `domain/entities/upgrade/upgrade.ts` — stub `UpgradeEntity extends Entity<UpgradeProps>`
        -   `domain/entities/upgrade/upgrade.type.ts` — тип `UpgradeProps`
    -   **Создать порты (application/ports/):**
        -   `building.port.repository.ts` — `abstract IBuildingRepository`
        -   `upgrade.port.repository.ts` — `abstract IUpgradeRepository`
    -   **Создать модули:** `ApplicationModule`, `InfrastructureModule`, `PrismaModule`, `PrismaService`, `PresentationModule`
    -   **Создать stub-контроллеры:** `building.http.controller.ts`, `building.nats.controller.ts`

-   [ ] **TASK-4.3:** `combat-progress-service` — создать пустой шаблон.
    -   **Назначение:** Player Level (XP), Battle Pass, достижения, трофеи, боевой пул.
    -   **Создать базовые классы:**
        -   `domain/entities/entity.ts` — `abstract Entity<Props>`
        -   `domain/entities/player-progress/player-progress.ts` — stub `PlayerProgressEntity`
        -   `domain/entities/player-progress/player-progress.type.ts`
        -   `domain/entities/battle-pass/battle-pass.ts` — stub `BattlePassEntity`
        -   `domain/entities/battle-pass/battle-pass.type.ts`
        -   `domain/entities/achievement/achievement.ts` — stub `AchievementEntity`
        -   `domain/entities/achievement/achievement.type.ts`
    -   **Создать порты:** `player-progress.port.repository.ts`, `battle-pass.port.repository.ts`, `achievement.port.repository.ts`
    -   **Создать модули:** `ApplicationModule`, `InfrastructureModule`, `PrismaModule`, `PrismaService`, `PresentationModule`
    -   **Создать stub-контроллеры:** `combat-progress.http.controller.ts`, `combat-progress.nats.controller.ts`

-   [ ] **TASK-4.4:** `scheduler-service` — дополнить существующий скаффолд до полной структуры.
    -   **Назначение:** Cron/Bull — пассивный доход, сброс заданий, ротация магазина, лидерборды.
    -   **Создать базовые классы:**
        -   `domain/entities/entity.ts` — `abstract Entity<Props>`
        -   `domain/entities/scheduled-job/scheduled-job.ts` — stub `ScheduledJobEntity`
        -   `domain/entities/scheduled-job/scheduled-job.type.ts`
    -   **Создать модули:** `ApplicationModule`, `InfrastructureModule`, `PresentationModule`
    -   **В InfrastructureModule:** заглушки Bull Queue (`BullModule.registerQueue(...)`) для очередей: `passive-income`, `job-reset`, `shop-rotation`, `leaderboard`
    -   **Создать stub-контроллеры:** `scheduler.http.controller.ts` (admin endpoints)

-   [ ] **TASK-4.5:** `collector-service` — создать пустой шаблон.
    -   **Назначение:** Приём аналитических событий, пакетная вставка в ClickHouse.
    -   **Особенность:** Нет слоя domain (работает с сырыми событиями); нет Prisma (использует ClickHouse).
    -   **Создать базовые классы:**
        -   `application/ports/clickhouse.port.repository.ts` — `abstract IClickHouseRepository`
        -   `infrastructure/clickhouse/clickhouse.service.ts` — stub `ClickHouseService`
        -   `infrastructure/clickhouse/clickhouse.module.ts` — `ClickHouseModule`
    -   **Создать модули:** `ApplicationModule`, `InfrastructureModule`, `PresentationModule`
    -   **Создать stub-контроллер:** `analytics.nats.controller.ts` — подписка на subjects из `@lib/lib-analytics`

-   [ ] **TASK-4.6:** `payment-service` — создать пустой шаблон.
    -   **Назначение:** Валидация IAP (Apple / Google Play).
    -   **Создать базовые классы:**
        -   `domain/entities/entity.ts` — `abstract Entity<Props>`
        -   `domain/entities/purchase/purchase.ts` — stub `PurchaseEntity`
        -   `domain/entities/purchase/purchase.type.ts`
    -   **Создать порты:** `apple-iap.port.ts` — `abstract IAppleIAPPort`, `google-play-iap.port.ts` — `abstract IGooglePlayIAPPort`
    -   **Создать модули:** `ApplicationModule`, `InfrastructureModule`, `PresentationModule`
    -   **Создать stub-контроллер:** `payment.http.controller.ts` — `POST /api/payment/validate` (заглушка)

-   [ ] **TASK-4.7:** `history-service` — создать пустой шаблон.
    -   **Назначение:** Запись и хранение реплеев/истории матчей.
    -   **Создать базовые классы:**
        -   `domain/entities/entity.ts` — `abstract Entity<Props>`
        -   `domain/entities/match-history/match-history.ts` — stub `MatchHistoryEntity`
        -   `domain/entities/match-history/match-history.type.ts`
        -   `domain/entities/replay/replay.ts` — stub `ReplayEntity`
        -   `domain/entities/replay/replay.type.ts`
    -   **Создать порты:** `match-history.port.repository.ts` — `abstract IMatchHistoryRepository`
    -   **Создать модули:** `ApplicationModule`, `InfrastructureModule`, `PrismaModule`, `PrismaService`, `PresentationModule`
    -   **Создать stub-контроллеры:** `history.http.controller.ts` (GET `/api/history/:matchId`), `history.nats.controller.ts` (подписка на `match.finished`)

## 5. Требования к качеству (Definition of Done)
-   **Unit-тесты:** Все новые контроллеры и сервисы/use-cases должны быть покрыты unit-тестами.
-   **Линтинг:** Весь код проходит проверку линтером.
-   **Документация:** Все эндпоинты и события задокументированы.
