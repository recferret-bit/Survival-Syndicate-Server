#!/usr/bin/env pwsh
# Генератор файлов задач MVP Phase 1
# Запуск: pwsh docs/mvp/_generate_tasks.ps1

$root = $PSScriptRoot

# === ДАННЫЕ ЗАДАЧ ===
$tasks = @(
    @{
        Num=1; Id="TASK-1.1"; Title="Monorepo-структура проекта"; Epic="Epic 1: Базовая инфраструктура"
        Branch="phase_1_1/feature/infra/monorepo-structure"
        Deps=@()
        Desc=@"
Создать NestJS monorepo со структурой `apps/` и `libs/`.
Настроить `nest-cli.json`, корневой `tsconfig.json` с path aliases, корневой `package.json` со скриптами.
"@
        DoR=@"
- Установлен Node.js 20+, npm, NestJS CLI
- Склонирован репозиторий, ветка `main` актуальна
"@
        DoD=@"
- `nest-cli.json` настроен в monorepo mode с projects для всех сервисов
- `tsconfig.json` содержит path aliases (`@app/*`, `@lib/*`, `@prisma/*`)
- `package.json` содержит базовые скрипты (build, start, lint, test)
- `npm install` завершается без ошибок
- `npm run build` завершается без ошибок (пустые модули)
"@
        Scope="apps/, libs/, nest-cli.json, tsconfig.json, package.json"
        ArchDocs="docs/architecture/16_project_structure.md"
        UnitTests="Нет (инфраструктурная задача)"
        IntTests="Нет"
    },
    @{
        Num=2; Id="TASK-1.2"; Title="Docker Compose"; Epic="Epic 1: Базовая инфраструктура"
        Branch="phase_1_2/feature/infra/docker-compose"
        Deps=@(1)
        Desc=@"
Настроить `docker-compose.infra.yml` для инфраструктурных сервисов: PostgreSQL (meta + catalog), NATS, Redis.
Настроить `docker-compose.full.yml` для запуска всех сервисов.
Создать `.env.example` с переменными окружения.
"@
        DoR=@"
- TASK-1.1 завершена
- Установлен Docker и Docker Compose
"@
        DoD=@"
- `docker/docker-compose.infra.yml` поднимает PostgreSQL, NATS, Redis
- `docker/docker-compose.full.yml` содержит конфигурации всех сервисов
- `docker/.env.example` содержит все необходимые переменные
- `npm run docker:infra` успешно запускает инфраструктуру
- Health checks проходят для всех контейнеров
"@
        Scope="docker/"
        ArchDocs="docs/architecture/16_project_structure.md"
        UnitTests="Нет (инфраструктурная задача)"
        IntTests="docker compose up проходит без ошибок"
    },
    @{
        Num=3; Id="TASK-1.3"; Title="Общая libs библиотека"; Epic="Epic 1: Базовая инфраструктура"
        Branch="phase_1_3/feature/infra/shared-libs"
        Deps=@(1)
        Desc=@"
Создать shared библиотеки в `libs/`:
- `@lib/shared` — общие утилиты, фильтры, pipes, guards, метрики, env, ApplicationBootstrapBuilder
- `@lib/lib-player` — PlayerPublisher, PlayerSubjects, Zod schemas
- `@lib/lib-building` — BuildingPublisher, BuildingSubjects
- `@lib/lib-game-server` — GameServerPublisher, GameServerSubjects
- `@lib/lib-combat-progress` — CombatProgressPublisher, CombatProgressSubjects
- `@lib/lib-analytics` — AnalyticsPublisher, AnalyticsSubjects
"@
        DoR=@"
- TASK-1.1 завершена
- Path aliases настроены в tsconfig.json
"@
        DoD=@"
- Все библиотеки экспортируют базовые модули через `index.ts`
- NATS subjects не хардкодятся — используются enum/const из lib-*
- Zod schemas для NATS request/response определены в lib-*
- `ApplicationBootstrapBuilder` реализован в `@lib/shared`
- Импорт `@lib/shared/*`, `@lib/lib-player/*` и др. разрешается TypeScript
- Unit-тесты для Zod schemas
"@
        Scope="libs/"
        ArchDocs="docs/architecture/15_nats_best_practices.md, docs/architecture/22_service_contracts.md"
        UnitTests="Zod schema validation, subject string constants"
        IntTests="Нет"
    },
    @{
        Num=4; Id="TASK-1.4"; Title="Скаффолдинг MVP-сервисов"; Epic="Epic 1: Базовая инфраструктура"
        Branch="phase_1_4/feature/infra/mvp-service-scaffolding"
        Deps=@(1,3)
        Desc=@"
Создать Clean Architecture структуру для всех 6 MVP-сервисов:
`auth-service`, `player-service`, `matchmaking-service`, `local-orchestrator`, `gameplay-service`, `websocket-service`.

Каждый сервис: main.ts, app.module.ts, domain/ (Entity base), application/ (ApplicationModule, ports/), infrastructure/ (InfrastructureModule, prisma/ где нужно), presentation/ (PresentationModule, http/, nats/).

Особенности:
- `gameplay-service`: + presentation/websocket/, ECS stubs (ISystem, IComponent, WorldState, GameLoop) в domain/
- `websocket-service`: + presentation/websocket/ws.gateway.ts
- `matchmaking-service`: + infrastructure/prisma/
- PrismaService: auth-service, player-service, matchmaking-service
"@
        DoR=@"
- TASK-1.1 и TASK-1.3 завершены
- libs/ библиотеки доступны для импорта
"@
        DoD=@"
- 6 сервисов имеют полную Clean Architecture структуру
- Каждый `main.ts` использует `ApplicationBootstrapBuilder` из `@lib/shared`
- Каждый `app.module.ts` импортирует `PresentationModule` и `MetricsModule`
- `abstract Entity<Props>` определён в domain/entities/entity.ts каждого сервиса
- PrismaModule + PrismaService созданы для сервисов с БД
- `npm run build` компилирует все 6 сервисов без ошибок
- `npm run lint` проходит без ошибок
"@
        Scope="apps/auth-service, apps/player-service, apps/matchmaking-service, apps/local-orchestrator, apps/gameplay-service, apps/websocket-service"
        ArchDocs="docs/architecture/16_project_structure.md, docs/mvp_plan.md (секция TASK-1.4)"
        UnitTests="Нет (скаффолдинг)"
        IntTests="Нет"
    },
    @{
        Num=5; Id="TASK-2.1"; Title="Auth Service"; Epic="Epic 2: Реализация сервисов"
        Branch="phase_1_5/feature/auth/registration-and-login"
        Deps=@(4)
        Desc=@"
Реализовать регистрацию и логин в auth-service:
- HTTP: POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout
- JWT (HS256): AccessToken (7d), RefreshToken (30d)
- Публикация NATS события `user.registered` после регистрации
- DTO валидация через Zod (createZodDto)
- Prisma: таблица Users (id, email, username, passwordHash, roles, createdAt)
"@
        DoR=@"
- TASK-1.4 завершена (скаффолдинг auth-service)
- Docker infra запущена (PostgreSQL, NATS, Redis)
- Prisma schema для meta DB содержит таблицу Users
"@
        DoD=@"
- Регистрация создаёт пользователя, возвращает JWT пару, публикует `user.registered`
- Логин валидирует credentials, возвращает JWT пару
- Refresh token rotation работает
- Logout отзывает все токены пользователя
- DTO: Zod + createZodDto, Swagger аннотации
- Ошибки: RFC 7807 (ProblemDetails)
- Unit-тесты: handlers, entity, mapper
- Integration-тесты: HTTP endpoints (register, login, refresh)
- `npm run lint && npm test && npm run build` проходит
"@
        Scope="apps/auth-service/"
        ArchDocs="docs/architecture/17_auth_and_authorization.md, docs/architecture/18_error_handling.md"
        UnitTests="RegisterHandler, LoginHandler, TokenService, UserEntity, UserPrismaMapper"
        IntTests="POST /auth/register, POST /auth/login, POST /auth/refresh pipeline"
    },
    @{
        Num=6; Id="TASK-2.2"; Title="Player Service"; Epic="Epic 2: Реализация сервисов"
        Branch="phase_1_6/feature/player/user-registered-handler"
        Deps=@(4,5)
        Desc=@"
Реализовать Player Service:
- NATS: подписка на `user.registered` → создание профиля игрока
- NATS: request/reply `player.get` для получения данных игрока
- HTTP: GET /api/players/me (профиль текущего пользователя)
- Prisma: таблица Players (id, userId, username, createdAt)
"@
        DoR=@"
- TASK-1.4 завершена (скаффолдинг player-service)
- TASK-2.1 завершена (auth-service публикует `user.registered`)
- Prisma schema содержит таблицу Players
"@
        DoD=@"
- При получении `user.registered` создаётся профиль игрока
- `player.get` возвращает данные игрока по playerId
- HTTP GET /api/players/me возвращает профиль (JWT Guard)
- DTO: Zod, Swagger
- Unit-тесты: CreateProfileHandler, GetPlayerHandler, PlayerEntity, mapper
- Integration-тесты: NATS handler (user.registered), HTTP pipeline
- `npm run lint && npm test && npm run build` проходит
"@
        Scope="apps/player-service/"
        ArchDocs="docs/architecture/11_player_service.md, docs/architecture/22_service_contracts.md"
        UnitTests="CreateProfileHandler, GetPlayerHandler, PlayerEntity, PlayerPrismaMapper"
        IntTests="NATS user.registered → profile creation, HTTP GET /api/players/me"
    },
    @{
        Num=7; Id="TASK-2.3"; Title="Matchmaking Service"; Epic="Epic 2: Реализация сервисов"
        Branch="phase_1_7/feature/matchmaking/lobby-and-solo"
        Deps=@(4,5)
        Desc=@"
Реализовать Matchmaking Service:
- HTTP: POST /api/lobbies/create, POST /api/lobbies/{id}/join, DELETE /api/lobbies/{id}/leave, POST /api/lobbies/{id}/start
- HTTP: POST /api/matchmaking/join-solo — быстрый старт
- NATS: подписка на `orchestrator.zone.heartbeat` (выбор зоны)
- NATS: подписка на `match.finished` (обновление статуса лобби)
- NATS: публикация `matchmaking.found_match` с зафиксированным списком playerIds (слоты)
- Хранение лобби в Prisma (или in-memory Map для MVP)
"@
        DoR=@"
- TASK-1.4 завершена (скаффолдинг matchmaking-service)
- TASK-2.1 завершена (JWT для авторизации запросов)
- NATS subjects определены в libs/
"@
        DoD=@"
- Lobby CRUD работает (create, join, leave, start)
- Solo matchmaking создаёт матч мгновенно
- При `start` лобби → публикуется `matchmaking.found_match` с playerIds
- Подписка на `orchestrator.zone.heartbeat` — выбирается зона с минимальной нагрузкой
- Подписка на `match.finished` — обновляется статус лобби
- DTO: Zod, Swagger
- Unit-тесты: CreateLobbyHandler, JoinLobbyHandler, StartMatchHandler, LobbyEntity
- Integration-тесты: Lobby HTTP pipeline, NATS matchmaking.found_match
- `npm run lint && npm test && npm run build` проходит
"@
        Scope="apps/matchmaking-service/"
        ArchDocs="docs/architecture/32_lobby_and_match_lifecycle.md, docs/architecture/22_service_contracts.md"
        UnitTests="CreateLobbyHandler, JoinLobbyHandler, LeaveLobbyHandler, StartMatchHandler, LobbyEntity"
        IntTests="Lobby HTTP pipeline, NATS found_match publication"
    },
    @{
        Num=8; Id="TASK-2.4"; Title="Local Orchestrator"; Epic="Epic 2: Реализация сервисов"
        Branch="phase_1_8/feature/orchestrator/slot-management"
        Deps=@(4,7)
        Desc=@"
Реализовать Local Orchestrator:
- NATS: публикация `orchestrator.zone.heartbeat`
- NATS: подписка на `gameplay.service.heartbeat` (выбор Gameplay Service)
- NATS: подписка на `matchmaking.found_match` → сохранение слотов, отправка `gameplay.start_simulation`
- NATS: подписка на `player.connection.status` (disconnect → запуск Grace Period таймера 60 сек)
- NATS: request/reply `orchestrator.player.reconnect_request` — проверка слота
- Управление слотами: `Map<matchId, Map<playerId, SlotStatus>>`
- Grace Period: 60 сек, по истечении → `gameplay.remove_player`
- Блокировка чужого реконнекта: проверка playerId ∈ слотам матча
"@
        DoR=@"
- TASK-1.4 завершена
- TASK-2.3 завершена (matchmaking публикует `matchmaking.found_match`)
"@
        DoD=@"
- Heartbeat публикуется периодически
- При `matchmaking.found_match` → создаётся Map слотов, отправляется `gameplay.start_simulation`
- При disconnect → запускается таймер Grace Period
- При истечении Grace Period → отправляется `gameplay.remove_player`
- `orchestrator.player.reconnect_request`: валидация playerId → success/SLOT_NOT_AVAILABLE/GRACE_EXPIRED/MATCH_NOT_FOUND
- Unit-тесты: SlotManager, GracePeriodService, ReconnectHandler
- Integration-тесты: NATS reconnect_request pipeline
- `npm run lint && npm test && npm run build` проходит
"@
        Scope="apps/local-orchestrator/"
        ArchDocs="docs/architecture/22_service_contracts.md, docs/architecture/27_connection_handling.md"
        UnitTests="SlotManager, GracePeriodService, ReconnectRequestHandler, HeartbeatService"
        IntTests="NATS reconnect_request request/reply"
    },
    @{
        Num=9; Id="TASK-2.5"; Title="Gameplay Service"; Epic="Epic 2: Реализация сервисов"
        Branch="phase_1_9/feature/gameplay/simulation-stubs"
        Deps=@(4,8)
        Desc=@"
Реализовать Gameplay Service (MVP — без реального GameLoop):
- NATS: публикация `gameplay.service.heartbeat`
- NATS: подписка на `gameplay.start_simulation` → создание stub-инстанса GameSimulation
- Управление инстансами: `Map<matchId, GameSimulation>`
- NATS: подписка на `gameplay.remove_player` → удаление игрока из симуляции
- Stub WorldState: простое эхо или минимальная структура `{ serverTick, entities_full: [], events: [] }`
"@
        DoR=@"
- TASK-1.4 завершена (скаффолдинг gameplay-service с ECS stubs)
- TASK-2.4 завершена (orchestrator отправляет gameplay.start_simulation)
"@
        DoD=@"
- Heartbeat публикуется периодически
- `gameplay.start_simulation` создаёт инстанс GameSimulation в Map
- `gameplay.remove_player` удаляет игрока из инстанса
- Stub WorldState генерируется и публикуется в `gameplay.world_state.{matchId}`
- Unit-тесты: SimulationManager, GameSimulation (stub), HeartbeatService
- `npm run lint && npm test && npm run build` проходит
"@
        Scope="apps/gameplay-service/"
        ArchDocs="docs/architecture/22_service_contracts.md, docs/architecture/28_gameplay_service_internals.md, docs/architecture/30_game_initialization_flow.md"
        UnitTests="SimulationManager, GameSimulation stub, HeartbeatService"
        IntTests="NATS start_simulation → simulation created"
    },
    @{
        Num=10; Id="TASK-2.6"; Title="WebSocket Service — connect"; Epic="Epic 2: Реализация сервисов"
        Branch="phase_1_10/feature/websocket/connect-flow"
        Deps=@(4,8)
        Desc=@"
Реализовать WebSocket Service — первое подключение:
- WS Gateway: принимает `client.authenticate` (JWT + опционально matchId)
- Валидация JWT, извлечение playerId
- NATS запрос к Orchestrator: проверка слота
- При успехе: `server.authenticate.success`, публикация `player.connection.status { connected }`
- При разрыве: `server.match.player_disconnected` остальным, публикация `player.connection.status { disconnected }`
- Маршрутизация: привязка WebSocket к matchId, пересылка input/state через NATS
"@
        DoR=@"
- TASK-1.4 завершена (ws.gateway.ts заглушка)
- TASK-2.4 завершена (orchestrator обрабатывает запросы на проверку слотов)
"@
        DoD=@"
- WS Gateway принимает соединения, валидирует JWT
- `client.authenticate` → проверка через Orchestrator → success/failure
- При подключении: публикация `player.connection.status { connected }`
- При отключении: рассылка `player_disconnected`, публикация `{ disconnected }`
- Unit-тесты: AuthenticateHandler, ConnectionManager, WsGateway (mock WS)
- Integration-тесты: WS connect + authenticate pipeline (с mock NATS)
- `npm run lint && npm test && npm run build` проходит
"@
        Scope="apps/websocket-service/"
        ArchDocs="docs/architecture/26_websocket_json_protocol.md, docs/architecture/27_connection_handling.md, docs/architecture/25_api_and_websocket_contracts.md"
        UnitTests="AuthenticateHandler, ConnectionManager, WsGateway"
        IntTests="WS connect + authenticate flow (mock)"
    },
    @{
        Num=11; Id="TASK-2.7"; Title="WebSocket Service — reconnect"; Epic="Epic 2: Реализация сервисов"
        Branch="phase_1_11/feature/websocket/reconnect-flow"
        Deps=@(10)
        Desc=@"
Реализовать реконнект в WebSocket Service:
- WS: `client.reconnect` (JWT) — первое сообщение нового соединения
- NATS запрос `orchestrator.player.reconnect_request` с playerId
- Успех: `server.reconnect.success` (matchId + WorldState), `player.connection.status { reconnected }`, `player_reconnected` остальным
- Ошибка: `server.reconnect.error` (SLOT_NOT_AVAILABLE / GRACE_EXPIRED / MATCH_NOT_FOUND), закрытие WS
- Синхронизация состояния лобби: `server.lobby.state_update`
- Простое эхо в игровом режиме
"@
        DoR=@"
- TASK-2.6 завершена (WebSocket connect работает)
"@
        DoD=@"
- `client.reconnect` → запрос к Orchestrator → success/error
- При успехе: полный WorldState, player_reconnected broadcast
- При ошибке: reconnect_error с кодом, WS закрывается
- Lobby state sync работает
- Эхо-режим: клиент отправляет input, получает state обратно
- Unit-тесты: ReconnectHandler, LobbyStateSync
- Integration-тесты: WS reconnect pipeline (mock)
- `npm run lint && npm test && npm run build` проходит
"@
        Scope="apps/websocket-service/"
        ArchDocs="docs/architecture/26_websocket_json_protocol.md, docs/architecture/27_connection_handling.md"
        UnitTests="ReconnectHandler, LobbyStateSyncService"
        IntTests="WS reconnect pipeline"
    },
    @{
        Num=12; Id="TASK-3.1"; Title="E2E: базовый флоу"; Epic="Epic 3: Интеграционное тестирование"
        Branch="phase_1_12/test/e2e/basic-flow"
        Deps=@(5,6,7,8,9,10)
        Desc=@"
E2E тест — полный базовый флоу:
1. Регистрация пользователя (POST /auth/register)
2. Получение JWT
3. Создание лобби или solo join
4. WebSocket подключение + authenticate
5. Эхо (отправка input → получение state)
6. Disconnect
"@
        DoR=@"
- Все сервисы Epic 2 реализованы
- Docker infra запущена
- Все сервисы запущены локально или в Docker
"@
        DoD=@"
- E2E тест проходит: register → JWT → matchmaking → WS connect → echo → disconnect
- Тест запускается через `npm run test:e2e`
- Все промежуточные шаги верифицированы (HTTP статусы, WS сообщения)
"@
        Scope="test/e2e/"
        ArchDocs="docs/mvp_plan.md (TASK-3.1)"
        UnitTests="Нет"
        IntTests="Полный E2E тест"
    },
    @{
        Num=13; Id="TASK-3.2"; Title="E2E: реконнект"; Epic="Epic 3: Интеграционное тестирование"
        Branch="phase_1_13/test/e2e/reconnect-flow"
        Deps=@(11,12)
        Desc=@"
E2E тест — реконнект:
1. Регистрация + аутентификация
2. Вход в матч
3. Разрыв соединения
4. Переподключение тем же JWT в течение Grace Period → `server.reconnect.success`
5. Переподключение после истечения Grace Period → `server.reconnect.error { code: GRACE_EXPIRED }`
"@
        DoR=@"
- TASK-2.7 завершена (reconnect реализован)
- TASK-3.1 завершена (базовый E2E работает)
"@
        DoD=@"
- E2E тест: reconnect в пределах grace period → success
- E2E тест: reconnect после grace period → GRACE_EXPIRED
- Тесты запускаются через `npm run test:e2e`
"@
        Scope="test/e2e/"
        ArchDocs="docs/architecture/27_connection_handling.md, docs/mvp_plan.md (TASK-3.2)"
        UnitTests="Нет"
        IntTests="E2E reconnect scenarios"
    },
    @{
        Num=14; Id="TASK-3.3"; Title="E2E: защита слота"; Epic="Epic 3: Интеграционное тестирование"
        Branch="phase_1_14/test/e2e/slot-protection"
        Deps=@(11,12)
        Desc=@"
E2E тест — защита слота:
1. Создать матч на двух игроков (A и B)
2. Игрок A разрывает соединение
3. Игрок C пытается реконнектнуться в слот A с чужим JWT → `server.reconnect.error { code: SLOT_NOT_AVAILABLE }`
4. Игрок A реконнектится с правильным JWT → успех
"@
        DoR=@"
- TASK-2.7 завершена (reconnect с проверкой слотов)
- TASK-3.1 завершена (базовый E2E работает)
"@
        DoD=@"
- E2E тест: чужой playerId → SLOT_NOT_AVAILABLE
- E2E тест: правильный playerId → reconnect success
- Тесты запускаются через `npm run test:e2e`
"@
        Scope="test/e2e/"
        ArchDocs="docs/architecture/27_connection_handling.md, docs/mvp_plan.md (TASK-3.3)"
        UnitTests="Нет"
        IntTests="E2E slot protection scenarios"
    },
    @{
        Num=15; Id="TASK-4.1"; Title="swagger-aggregator (шаблон)"; Epic="Epic 4: Пустые шаблоны non-MVP сервисов"
        Branch="phase_1_15/chore/scaffold/swagger-aggregator"
        Deps=@(1,3)
        Desc=@"
Создать пустой шаблон swagger-aggregator:
- Нет слоёв domain/application/infrastructure (чистый прокси)
- main.ts (ApplicationBootstrapBuilder), app.module.ts (MetricsModule)
- presentation/http/swagger-aggregator.http.controller.ts — stub GET /openapi.json
"@
        DoR=@"
- TASK-1.1 и TASK-1.3 завершены
"@
        DoD=@"
- Сервис компилируется: `npm run build swagger-aggregator`
- Stub контроллер GET /openapi.json возвращает пустой объект
- `npm run lint` проходит
"@
        Scope="apps/swagger-aggregator/"
        ArchDocs="docs/architecture/16_project_structure.md"
        UnitTests="Нет (шаблон)"
        IntTests="Нет"
    },
    @{
        Num=16; Id="TASK-4.2"; Title="building-service (шаблон)"; Epic="Epic 4: Пустые шаблоны non-MVP сервисов"
        Branch="phase_1_16/chore/scaffold/building-service"
        Deps=@(1,3)
        Desc=@"
Создать полный шаблон building-service со всеми базовыми классами:
- Entity<Props>, BuildingEntity, UpgradeEntity
- Ports: IBuildingRepository, IUpgradeRepository
- Modules: Application, Infrastructure, Prisma, Presentation
- Stub controllers: building.http.controller.ts, building.nats.controller.ts
"@
        DoR=@"- TASK-1.1 и TASK-1.3 завершены"@
        DoD=@"
- Полная Clean Architecture структура
- Все модули, entities, ports, stub controllers созданы
- `npm run build building-service` проходит
- `npm run lint` проходит
"@
        Scope="apps/building-service/"
        ArchDocs="docs/architecture/09_building_service.md, docs/architecture/16_project_structure.md"
        UnitTests="Нет (шаблон)"
        IntTests="Нет"
    },
    @{
        Num=17; Id="TASK-4.3"; Title="combat-progress-service (шаблон)"; Epic="Epic 4: Пустые шаблоны non-MVP сервисов"
        Branch="phase_1_17/chore/scaffold/combat-progress-service"
        Deps=@(1,3)
        Desc=@"
Создать полный шаблон combat-progress-service:
- Entity<Props>, PlayerProgressEntity, BattlePassEntity, AchievementEntity
- Ports: IPlayerProgressRepository, IBattlePassRepository, IAchievementRepository
- Modules: Application, Infrastructure, Prisma, Presentation
- Stub controllers: combat-progress.http/nats.controller.ts
"@
        DoR=@"- TASK-1.1 и TASK-1.3 завершены"@
        DoD=@"
- Полная Clean Architecture структура
- Все entities, ports, modules, stubs созданы
- `npm run build combat-progress-service` проходит
- `npm run lint` проходит
"@
        Scope="apps/combat-progress-service/"
        ArchDocs="docs/architecture/10_combat_progress_service.md, docs/architecture/16_project_structure.md"
        UnitTests="Нет (шаблон)"
        IntTests="Нет"
    },
    @{
        Num=18; Id="TASK-4.4"; Title="scheduler-service (шаблон)"; Epic="Epic 4: Пустые шаблоны non-MVP сервисов"
        Branch="phase_1_18/chore/scaffold/scheduler-service"
        Deps=@(1,3)
        Desc=@"
Дополнить существующий скаффолд scheduler-service:
- Entity<Props>, ScheduledJobEntity
- Modules: Application, Infrastructure (Bull Queue stubs), Presentation
- Bull queues: passive-income, job-reset, shop-rotation, leaderboard
- Stub controller: scheduler.http.controller.ts (admin endpoints)
"@
        DoR=@"- TASK-1.1 и TASK-1.3 завершены"@
        DoD=@"
- Полная Clean Architecture структура
- Bull Queue заглушки зарегистрированы
- `npm run build scheduler-service` проходит
- `npm run lint` проходит
"@
        Scope="apps/scheduler-service/"
        ArchDocs="docs/architecture/12_scheduler_service.md, docs/architecture/16_project_structure.md"
        UnitTests="Нет (шаблон)"
        IntTests="Нет"
    },
    @{
        Num=19; Id="TASK-4.5"; Title="collector-service (шаблон)"; Epic="Epic 4: Пустые шаблоны non-MVP сервисов"
        Branch="phase_1_19/chore/scaffold/collector-service"
        Deps=@(1,3)
        Desc=@"
Создать шаблон collector-service:
- Нет domain слоя (сырые события); нет Prisma (ClickHouse)
- Ports: IClickHouseRepository
- Infrastructure: ClickHouseService, ClickHouseModule
- Stub controller: analytics.nats.controller.ts (subjects из @lib/lib-analytics)
"@
        DoR=@"- TASK-1.1 и TASK-1.3 завершены"@
        DoD=@"
- Структура без domain, с ClickHouse стабами
- NATS controller подписан на subjects из lib-analytics
- `npm run build collector-service` проходит
- `npm run lint` проходит
"@
        Scope="apps/collector-service/"
        ArchDocs="docs/architecture/03_analytics_and_events.md, docs/architecture/16_project_structure.md"
        UnitTests="Нет (шаблон)"
        IntTests="Нет"
    },
    @{
        Num=20; Id="TASK-4.6"; Title="payment-service (шаблон)"; Epic="Epic 4: Пустые шаблоны non-MVP сервисов"
        Branch="phase_1_20/chore/scaffold/payment-service"
        Deps=@(1,3)
        Desc=@"
Создать шаблон payment-service:
- Entity<Props>, PurchaseEntity
- Ports: IAppleIAPPort, IGooglePlayIAPPort
- Modules: Application, Infrastructure, Presentation
- Stub controller: payment.http.controller.ts (POST /api/payment/validate)
"@
        DoR=@"- TASK-1.1 и TASK-1.3 завершены"@
        DoD=@"
- Clean Architecture структура
- IAP port abstractions созданы
- `npm run build payment-service` проходит
- `npm run lint` проходит
"@
        Scope="apps/payment-service/"
        ArchDocs="docs/architecture/06_payment_validation_service.md, docs/architecture/16_project_structure.md"
        UnitTests="Нет (шаблон)"
        IntTests="Нет"
    },
    @{
        Num=21; Id="TASK-4.7"; Title="history-service (шаблон)"; Epic="Epic 4: Пустые шаблоны non-MVP сервисов"
        Branch="phase_1_21/chore/scaffold/history-service"
        Deps=@(1,3)
        Desc=@"
Создать шаблон history-service:
- Entity<Props>, MatchHistoryEntity, ReplayEntity
- Ports: IMatchHistoryRepository
- Modules: Application, Infrastructure, Prisma, Presentation
- Stub controllers: history.http.controller.ts (GET /api/history/:matchId), history.nats.controller.ts (match.finished)
"@
        DoR=@"- TASK-1.1 и TASK-1.3 завершены"@
        DoD=@"
- Clean Architecture структура
- Все entities, ports, modules, stubs созданы
- `npm run build history-service` проходит
- `npm run lint` проходит
"@
        Scope="apps/history-service/"
        ArchDocs="docs/architecture/29_match_history_system.md, docs/architecture/16_project_structure.md"
        UnitTests="Нет (шаблон)"
        IntTests="Нет"
    }
)

# === ГЕНЕРАЦИЯ ФАЙЛОВ ===

foreach ($t in $tasks) {
    $dir = Join-Path $root "phase_1_$($t.Num)"
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

    $depsStr = if ($t.Deps.Count -gt 0) { ($t.Deps | ForEach-Object { "phase_1_$_" }) -join ", " } else { "Нет" }

    # === task.md ===
    $taskContent = @"
# $($t.Id): $($t.Title)

## Статус: `NOT STARTED`

**Epic:** $($t.Epic)
**Ветка:** ``$($t.Branch)``
**Зависимости:** $depsStr

---

## Описание
$($t.Desc)

## Scope (затрагиваемые файлы/каталоги)
``$($t.Scope)``

## Ключевые документы архитектуры
$($t.ArchDocs)

---

## Definition of Ready (DoR)
$($t.DoR)

## Definition of Done (DoD)
$($t.DoD)

---

## Тесты

**Unit-тесты (``*.unit.spec.ts``):**
$($t.UnitTests)

**Integration-тесты (``*.integration.spec.ts``):**
$($t.IntTests)

---

## Лог прогресса

| Дата | Событие | Агент |
|------|---------|-------|
| — | Задача создана | System |
"@

    Set-Content -Path (Join-Path $dir "task.md") -Value $taskContent -Encoding utf8

    # === prompts_prepare.md ===
    $prepareContent = @"
# Промпт: ПОДГОТОВКА — $($t.Id): $($t.Title)

> Этот промпт предназначен для AI-агента (Cursor/Warp). Цель — подготовить рабочее окружение перед началом разработки.

---

## Контекст задачи

**ID:** $($t.Id)
**Название:** $($t.Title)
**Ветка:** ``$($t.Branch)``
**Epic:** $($t.Epic)
**Зависимости:** $depsStr

### Описание
$($t.Desc)

### Definition of Ready (DoR)
$($t.DoR)

### Definition of Done (DoD)
$($t.DoD)

---

## Инструкции для агента

### Шаг 1: Проверка DoR
1. Убедись что все зависимости ($depsStr) завершены. Проверь их статус в ``docs/mvp/mvp_phase_1.md``.
2. Если зависимости не завершены — **СТОП**. Сообщи оркестратору и не продолжай.

### Шаг 2: Синхронизация с main
```bash
git checkout main
git pull origin main
```

### Шаг 3: Создание worktree и ветки
```bash
git worktree add ../worktrees/$($t.Branch.Replace('/','-')) -b $($t.Branch) main
cd ../worktrees/$($t.Branch.Replace('/','-'))
```
Или без worktree:
```bash
git checkout -b $($t.Branch) main
```

### Шаг 4: Проверка текущего состояния
```bash
npm install
npm run lint
npm test
npm run build
```
Если что-то падает — **СТОП**. Не начинай работу на сломанной базе.

### Шаг 5: Обновление статуса
1. В ``docs/mvp/phase_1_$($t.Num)/task.md`` замени статус на ``PREPARING``.
2. Добавь запись в лог прогресса: дата, «Подготовка начата», имя агента.
3. В ``docs/mvp/mvp_phase_1.md`` обнови статус задачи $($t.Num) на ``🔄 PREPARING``.

### Шаг 6: Коммит подготовки
```bash
git add docs/mvp/
git commit -m "chore(mvp): prepare $($t.Id) - $($t.Title)

Co-Authored-By: Oz <oz-agent@warp.dev>"
```

---

## Стиль кода и правила
- **Clean Architecture:** Domain без NestJS/Prisma; ports = abstract classes; handlers < 50 строк
- **DTO:** Zod (``createZodDto``) + Swagger аннотации
- **NATS:** subjects из ``libs/lib-*``, никогда не хардкодить строки
- **bigint:** запрещён в прикладном коде (только инфраструктура и Prisma mappers)
- **Currency/Language:** только из ``@lib/shared/currency`` и ``@lib/shared/language``
- **Тесты:** ``*.unit.spec.ts``, ``*.integration.spec.ts``
- **Коммиты:** Conventional Commits + ``Co-Authored-By: Oz <oz-agent@warp.dev>``
- **Ветки:** ``$($t.Branch)``

## Документация для изучения
- $($t.ArchDocs)
- docs/guides/GIT_WORKFLOW.md
- docs/guides/CODE_QUALITY.md
- docs/guides/TESTING_PYRAMID.md
- docs/agents/cursor.md
"@

    Set-Content -Path (Join-Path $dir "prompts_prepare.md") -Value $prepareContent -Encoding utf8

    # === prompts_develop.md ===
    $developContent = @"
# Промпт: РАЗРАБОТКА — $($t.Id): $($t.Title)

> Этот промпт предназначен для AI-агента (Cursor). Цель — реализовать задачу и написать тесты.

---

## Контекст задачи

**ID:** $($t.Id)
**Название:** $($t.Title)
**Ветка:** ``$($t.Branch)``
**Epic:** $($t.Epic)
**Scope:** ``$($t.Scope)``

### Описание
$($t.Desc)

### Definition of Done (DoD)
$($t.DoD)

---

## Инструкции для агента

### Шаг 0: Проверка что подготовка выполнена
Убедись что ты на ветке ``$($t.Branch)`` и статус задачи — ``PREPARING`` или ``IN PROGRESS``.
```bash
git branch --show-current
```

### Шаг 1: Обновление статуса
1. В ``docs/mvp/phase_1_$($t.Num)/task.md`` замени статус на ``IN PROGRESS``.
2. В ``docs/mvp/mvp_phase_1.md`` обнови статус задачи $($t.Num) на ``🛠️ IN PROGRESS``.

### Шаг 2: Изучение паттернов
1. Прочитай документацию: $($t.ArchDocs)
2. Найди аналогичные реализации в существующем коде (``apps/``, ``libs/``).
3. Следуй паттернам проекта, не придумывай новые.

### Шаг 3: Реализация
Scope: ``$($t.Scope)``

**Следуй паттернам:**
- Domain entities: наследуют ``Entity<Props>``, инварианты в конструкторе/методах
- Ports: abstract classes в ``application/ports/``
- Use-cases: CQRS handlers (Command/Query), тонкие (< 50 строк)
- HTTP Controllers: Swagger + Zod DTO + делегирование в handlers
- NATS Controllers: ``@MessagePattern`` / ``@EventPattern`` + делегирование
- Infrastructure: реализации портов, Prisma mappers
- Ошибки: RFC 7807 (BaseException из ``@lib/shared``)

### Шаг 4: Написание тестов

**Unit-тесты (``*.unit.spec.ts``):**
$($t.UnitTests)

**Integration-тесты (``*.integration.spec.ts``):**
$($t.IntTests)

Правила:
- Unit: мокай ports, тестируй логику handlers/entities/mappers
- Integration: реальная БД (testcontainers) или HTTP pipeline
- Не мокай Zod-схемы
- Именование: ``описание.unit.spec.ts``, ``описание.integration.spec.ts``

### Шаг 5: Проверки
```bash
npm run lint
npm test
npm run build
```
Все три команды должны проходить без ошибок.

### Шаг 6: Атомарные коммиты
Делай коммиты по логическим блокам:
```bash
git add <files>
git commit -m "<type>(<scope>): <description>

Co-Authored-By: Oz <oz-agent@warp.dev>"
```
Типы: ``feat``, ``test``, ``refactor``, ``chore``
Scope: название сервиса (``auth``, ``player``, ``matchmaking``, ``orchestrator``, ``gameplay``, ``websocket``)

---

## Стиль кода
- **Clean Architecture:** Domain без NestJS/Prisma; ports = abstract classes
- **DTO:** Zod (``createZodDto``) + Swagger (``@ApiProperty``, ``@ApiOperation``, ``@ApiResponse``)
- **NATS:** subjects из ``libs/lib-*``
- **bigint:** запрещён вне инфраструктуры
- **Errors:** RFC 7807 (``BaseException``, ``ProblemDetails``)
- **Logs:** не логировать секреты/токены/персональные данные

## Ключевые файлы для reference
- ``apps/auth-service/src/`` — пример Clean Architecture сервиса
- ``apps/player-service/src/`` — пример с NATS + HTTP
- ``libs/shared/`` — ApplicationBootstrapBuilder, MetricsModule
- ``libs/lib-player/`` — пример NATS subjects/publishers
"@

    Set-Content -Path (Join-Path $dir "prompts_develop.md") -Value $developContent -Encoding utf8

    # === prompts_review.md ===
    $reviewContent = @"
# Промпт: РЕВЬЮ — $($t.Id): $($t.Title)

> Этот промпт предназначен для AI-агента (Warp/Cursor). Цель — проверить результат, прогнать строгие проверки, создать PR.

---

## Контекст задачи

**ID:** $($t.Id)
**Название:** $($t.Title)
**Ветка:** ``$($t.Branch)``
**Scope:** ``$($t.Scope)``

### Definition of Done (DoD)
$($t.DoD)

---

## Инструкции для агента

### Шаг 1: Верификация DoD
Пройди по каждому пункту DoD и убедись, что он выполнен. Если нет — верни на доработку с комментарием.

### Шаг 2: Строгие проверки
```bash
npm run format
npm run lint
npm test
npm run test:cov
npm run build
```
**Все команды должны завершиться с кодом 0.**

Дополнительно (если задача затрагивает интеграции):
```bash
npm run docker:infra
npm run test:e2e
```

### Шаг 3: Чек-лист ревью

**Архитектура:**
- [ ] Clean Architecture соблюдена (Domain не зависит от NestJS/Prisma)
- [ ] Ports — abstract classes (не interfaces)
- [ ] Handlers тонкие (< 50 строк)
- [ ] Нет логики в контроллерах (только делегирование)

**Контракты и DTO:**
- [ ] DTO валидируются через Zod (``createZodDto``)
- [ ] Swagger аннотации на всех HTTP endpoints
- [ ] NATS subjects не хардкодятся (используются ``libs/lib-*``)
- [ ] Zod schemas для NATS request/response

**Данные и безопасность:**
- [ ] ``bigint`` не используется в прикладном коде
- [ ] Currency/Language не захардкожены
- [ ] Логи не содержат секретов/токенов/персональных данных
- [ ] Ошибки — RFC 7807 (ProblemDetails)

**Тесты:**
- [ ] Unit-тесты покрывают: $($t.UnitTests)
- [ ] Integration-тесты: $($t.IntTests)
- [ ] Именование: ``*.unit.spec.ts``, ``*.integration.spec.ts``
- [ ] Тесты детерминированные и быстрые

**Git:**
- [ ] Conventional Commits
- [ ] ``Co-Authored-By: Oz <oz-agent@warp.dev>``
- [ ] Нет несвязанных изменений

### Шаг 4: Обновление статуса
1. В ``docs/mvp/phase_1_$($t.Num)/task.md`` замени статус на ``IN REVIEW``.
2. В ``docs/mvp/mvp_phase_1.md`` обнови статус задачи $($t.Num) на ``👁️ IN REVIEW``.

### Шаг 5: Создание PR
```bash
git push origin $($t.Branch)
gh pr create --base main --head $($t.Branch) --title "$($t.Id): $($t.Title)" --body "## Описание
$($t.Title)

## Чек-лист
- [ ] lint пройден
- [ ] тесты пройдены
- [ ] build успешен
- [ ] DoD выполнен

**Задача:** docs/mvp/phase_1_$($t.Num)/task.md

Co-Authored-By: Oz <oz-agent@warp.dev>"
```

### Шаг 6: После мержа
1. В ``docs/mvp/phase_1_$($t.Num)/task.md`` замени статус на ``DONE``.
2. В ``docs/mvp/mvp_phase_1.md`` обнови статус задачи $($t.Num) на ``✅ DONE``.
3. Добавь запись в лог прогресса task.md.
"@

    Set-Content -Path (Join-Path $dir "prompts_review.md") -Value $reviewContent -Encoding utf8
}

Write-Host "Generated files for $($tasks.Count) tasks in docs/mvp/phase_1_*/" -ForegroundColor Green
Write-Host "Total files: $($tasks.Count * 4)" -ForegroundColor Cyan
