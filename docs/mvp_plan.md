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

## 4. Микросервисы вне MVP (пустые проекты)

Следующие микросервисы перечислены в архитектуре, но **не входят в скоуп MVP**. Созданы как пустые заглушки (Nx app + базовый `AppModule`), готовые к дальнейшей разработке.

### Global Scope

#### `swagger-aggregator`
- **Назначение:** Агрегирует OpenAPI-спецификации со всех сервисов (проксирует `/openapi.json` каждого), предоставляет единую Swagger UI. Каждый сервис имеет собственный HTTP-контроллер и выставляет свою Swagger-спеку на `/openapi.json`.
- **Статус:** Пустой проект.
- **Задачи:** _(не запланировано)_

#### `building-service`
- **Назначение:** Строительство, апгрейды, бонусы, разблокировка контента, пассивный доход.
- **Статус:** Пустой проект.
- **Задачи:** _(не запланировано)_

#### `combat-progress-service`
- **Назначение:** Player Level (XP), Battle Pass, достижения, трофеи, боевой пул.
- **Статус:** Пустой проект.
- **Задачи:** _(не запланировано)_

#### `scheduler-service`
- **Назначение:** Cron/Bull — пассивный доход, сброс заданий, ротация магазина, лидерборды.
- **Статус:** Пустой проект.
- **Задачи:** _(не запланировано)_

#### `collector-service`
- **Назначение:** Приём аналитических событий, пакетная вставка в ClickHouse.
- **Статус:** Пустой проект.
- **Задачи:** _(не запланировано)_

#### `payment-service`
- **Назначение:** Валидация IAP (Apple / Google Play).
- **Статус:** Пустой проект.
- **Задачи:** _(не запланировано)_

#### `history-service`
- **Назначение:** Запись и хранение реплеев/истории матчей.
- **Статус:** Пустой проект.
- **Задачи:** _(не запланировано)_

## 5. Требования к качеству (Definition of Done)
-   **Unit-тесты:** Все новые контроллеры и сервисы/use-cases должны быть покрыты unit-тестами.
-   **Линтинг:** Весь код проходит проверку линтером.
-   **Документация:** Все эндпоинты и события задокументированы.
