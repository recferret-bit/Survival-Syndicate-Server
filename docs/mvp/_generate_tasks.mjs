import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const tasks = [
  { num:1, id:"TASK-1.1", title:"Monorepo-структура проекта", epic:"Epic 1: Базовая инфраструктура", branch:"feature/infra/monorepo-structure", deps:[],
    desc:"Создать NestJS monorepo со структурой `apps/` и `libs/`.\nНастроить `nest-cli.json`, корневой `tsconfig.json` с path aliases, корневой `package.json` со скриптами.",
    dor:"- Установлен Node.js 20+, npm, NestJS CLI\n- Склонирован репозиторий, ветка `main` актуальна",
    dod:"- `nest-cli.json` настроен в monorepo mode с projects для всех сервисов\n- `tsconfig.json` содержит path aliases (`@app/*`, `@lib/*`, `@prisma/*`)\n- `package.json` содержит базовые скрипты (build, start, lint, test)\n- `npm install` завершается без ошибок\n- `npm run build` завершается без ошибок (пустые модули)",
    scope:"apps/, libs/, nest-cli.json, tsconfig.json, package.json", arch:"docs/architecture/16_project_structure.md", unit:"Нет (инфраструктурная задача)", int:"Нет" },
  { num:2, id:"TASK-1.2", title:"Docker Compose", epic:"Epic 1: Базовая инфраструктура", branch:"feature/infra/docker-compose", deps:[1],
    desc:"Настроить `docker-compose.infra.yml` для PostgreSQL (meta + catalog), NATS, Redis.\nНастроить `docker-compose.full.yml` для запуска всех сервисов.\nСоздать `.env.example`.",
    dor:"- TASK-1.1 завершена\n- Установлен Docker и Docker Compose",
    dod:"- `docker/docker-compose.infra.yml` поднимает PostgreSQL, NATS, Redis\n- `docker/docker-compose.full.yml` содержит конфигурации всех сервисов\n- `docker/.env.example` содержит все необходимые переменные\n- `npm run docker:infra` успешно запускает инфраструктуру\n- Health checks проходят для всех контейнеров",
    scope:"docker/", arch:"docs/architecture/16_project_structure.md", unit:"Нет (инфраструктурная задача)", int:"docker compose up проходит без ошибок" },
  { num:3, id:"TASK-1.3", title:"Общая libs библиотека", epic:"Epic 1: Базовая инфраструктура", branch:"feature/infra/shared-libs", deps:[1],
    desc:"Создать shared библиотеки в `libs/`:\n- `@lib/shared` — утилиты, фильтры, pipes, guards, метрики, ApplicationBootstrapBuilder\n- `@lib/lib-player` — PlayerPublisher, PlayerSubjects, Zod schemas\n- `@lib/lib-building` — BuildingPublisher, BuildingSubjects\n- `@lib/lib-game-server` — GameServerPublisher, GameServerSubjects\n- `@lib/lib-combat-progress` — CombatProgressPublisher, CombatProgressSubjects\n- `@lib/lib-analytics` — AnalyticsPublisher, AnalyticsSubjects",
    dor:"- TASK-1.1 завершена\n- Path aliases настроены в tsconfig.json",
    dod:"- Все библиотеки экспортируют базовые модули через `index.ts`\n- NATS subjects не хардкодятся — используются enum/const из lib-*\n- Zod schemas для NATS request/response определены в lib-*\n- `ApplicationBootstrapBuilder` реализован в `@lib/shared`\n- Импорт `@lib/shared/*`, `@lib/lib-player/*` и др. разрешается TypeScript\n- Unit-тесты для Zod schemas",
    scope:"libs/", arch:"docs/architecture/15_nats_best_practices.md, docs/architecture/22_service_contracts.md", unit:"Zod schema validation, subject string constants", int:"Нет" },
  { num:4, id:"TASK-1.4", title:"Скаффолдинг MVP-сервисов", epic:"Epic 1: Базовая инфраструктура", branch:"feature/infra/mvp-service-scaffolding", deps:[1,3],
    desc:"Создать Clean Architecture структуру для 6 MVP-сервисов: auth-service, player-service, matchmaking-service, local-orchestrator, gameplay-service, websocket-service.\n\nКаждый: main.ts, app.module.ts, domain/ (Entity base), application/ (ApplicationModule, ports/), infrastructure/ (InfrastructureModule, prisma/), presentation/ (PresentationModule, http/, nats/).\n\nОсобенности:\n- gameplay-service: + presentation/websocket/, ECS stubs (ISystem, IComponent, WorldState, GameLoop)\n- websocket-service: + presentation/websocket/ws.gateway.ts\n- matchmaking-service: + infrastructure/prisma/\n- PrismaService: auth-service, player-service, matchmaking-service",
    dor:"- TASK-1.1 и TASK-1.3 завершены\n- libs/ библиотеки доступны для импорта",
    dod:"- 6 сервисов имеют полную Clean Architecture структуру\n- Каждый main.ts использует ApplicationBootstrapBuilder из @lib/shared\n- Каждый app.module.ts импортирует PresentationModule и MetricsModule\n- abstract Entity<Props> определён в domain/entities/entity.ts каждого сервиса\n- PrismaModule + PrismaService созданы для сервисов с БД\n- `npm run build` компилирует все 6 сервисов без ошибок\n- `npm run lint` проходит без ошибок",
    scope:"apps/auth-service, apps/player-service, apps/matchmaking-service, apps/local-orchestrator, apps/gameplay-service, apps/websocket-service", arch:"docs/architecture/16_project_structure.md, docs/mvp_plan.md (секция TASK-1.4)", unit:"Нет (скаффолдинг)", int:"Нет" },
  { num:5, id:"TASK-2.1", title:"Auth Service", epic:"Epic 2: Реализация сервисов", branch:"feature/auth/registration-and-login", deps:[4],
    desc:"Реализовать регистрацию и логин:\n- HTTP: POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout\n- JWT (HS256): AccessToken (7d), RefreshToken (30d)\n- Публикация NATS события `user.registered` после регистрации\n- DTO валидация через Zod (createZodDto)\n- Prisma: таблица Users (id, email, username, passwordHash, roles, createdAt)",
    dor:"- TASK-1.4 завершена (скаффолдинг auth-service)\n- Docker infra запущена (PostgreSQL, NATS, Redis)\n- Prisma schema для meta DB содержит таблицу Users",
    dod:"- Регистрация создаёт пользователя, возвращает JWT пару, публикует user.registered\n- Логин валидирует credentials, возвращает JWT пару\n- Refresh token rotation работает\n- Logout отзывает все токены пользователя\n- DTO: Zod + createZodDto, Swagger аннотации\n- Ошибки: RFC 7807 (ProblemDetails)\n- Unit-тесты: handlers, entity, mapper\n- Integration-тесты: HTTP endpoints (register, login, refresh)\n- `npm run lint && npm test && npm run build` проходит",
    scope:"apps/auth-service/", arch:"docs/architecture/17_auth_and_authorization.md, docs/architecture/18_error_handling.md", unit:"RegisterHandler, LoginHandler, TokenService, UserEntity, UserPrismaMapper", int:"POST /auth/register, POST /auth/login, POST /auth/refresh pipeline" },
  { num:6, id:"TASK-2.2", title:"Player Service", epic:"Epic 2: Реализация сервисов", branch:"feature/player/user-registered-handler", deps:[4,5],
    desc:"Реализовать Player Service:\n- NATS: подписка на user.registered -> создание профиля игрока\n- NATS: request/reply player.get для получения данных игрока\n- HTTP: GET /api/players/me (профиль текущего пользователя)\n- Prisma: таблица Players (id, userId, username, createdAt)",
    dor:"- TASK-1.4 завершена (скаффолдинг player-service)\n- TASK-2.1 завершена (auth-service публикует user.registered)\n- Prisma schema содержит таблицу Players",
    dod:"- При получении user.registered создаётся профиль игрока\n- player.get возвращает данные игрока по playerId\n- HTTP GET /api/players/me возвращает профиль (JWT Guard)\n- DTO: Zod, Swagger\n- Unit-тесты: CreateProfileHandler, GetPlayerHandler, PlayerEntity, mapper\n- Integration-тесты: NATS handler, HTTP pipeline\n- `npm run lint && npm test && npm run build` проходит",
    scope:"apps/player-service/", arch:"docs/architecture/11_player_service.md, docs/architecture/22_service_contracts.md", unit:"CreateProfileHandler, GetPlayerHandler, PlayerEntity, PlayerPrismaMapper", int:"NATS user.registered -> profile creation, HTTP GET /api/players/me" },
  { num:7, id:"TASK-2.3", title:"Matchmaking Service", epic:"Epic 2: Реализация сервисов", branch:"feature/matchmaking/lobby-and-solo", deps:[4,5],
    desc:"Реализовать Matchmaking Service:\n- HTTP: POST /api/lobbies/create, POST /api/lobbies/{id}/join, DELETE /api/lobbies/{id}/leave, POST /api/lobbies/{id}/start\n- HTTP: POST /api/matchmaking/join-solo\n- NATS: подписка на orchestrator.zone.heartbeat (выбор зоны)\n- NATS: подписка на match.finished (обновление статуса лобби)\n- NATS: публикация matchmaking.found_match с зафиксированным списком playerIds",
    dor:"- TASK-1.4 завершена\n- TASK-2.1 завершена (JWT для авторизации запросов)\n- NATS subjects определены в libs/",
    dod:"- Lobby CRUD работает (create, join, leave, start)\n- Solo matchmaking создаёт матч мгновенно\n- При start лобби -> публикуется matchmaking.found_match с playerIds\n- Подписка на orchestrator.zone.heartbeat\n- Подписка на match.finished\n- DTO: Zod, Swagger\n- Unit-тесты: CreateLobbyHandler, JoinLobbyHandler, StartMatchHandler, LobbyEntity\n- Integration-тесты: Lobby HTTP pipeline, NATS matchmaking.found_match\n- `npm run lint && npm test && npm run build` проходит",
    scope:"apps/matchmaking-service/", arch:"docs/architecture/32_lobby_and_match_lifecycle.md, docs/architecture/22_service_contracts.md", unit:"CreateLobbyHandler, JoinLobbyHandler, LeaveLobbyHandler, StartMatchHandler, LobbyEntity", int:"Lobby HTTP pipeline, NATS found_match publication" },
  { num:8, id:"TASK-2.4", title:"Local Orchestrator", epic:"Epic 2: Реализация сервисов", branch:"feature/orchestrator/slot-management", deps:[4,7],
    desc:"Реализовать Local Orchestrator:\n- NATS: публикация orchestrator.zone.heartbeat\n- NATS: подписка на gameplay.service.heartbeat\n- NATS: подписка на matchmaking.found_match -> сохранение слотов, отправка gameplay.start_simulation\n- NATS: подписка на player.connection.status (disconnect -> Grace Period 60 сек)\n- NATS: request/reply orchestrator.player.reconnect_request — проверка слота\n- Управление слотами: Map<matchId, Map<playerId, SlotStatus>>\n- Grace Period: 60 сек -> gameplay.remove_player\n- Блокировка чужого реконнекта",
    dor:"- TASK-1.4 завершена\n- TASK-2.3 завершена (matchmaking публикует matchmaking.found_match)",
    dod:"- Heartbeat публикуется периодически\n- При matchmaking.found_match -> создаётся Map слотов, отправляется gameplay.start_simulation\n- При disconnect -> запускается таймер Grace Period\n- При истечении Grace Period -> отправляется gameplay.remove_player\n- orchestrator.player.reconnect_request: валидация playerId -> success/SLOT_NOT_AVAILABLE/GRACE_EXPIRED/MATCH_NOT_FOUND\n- Unit-тесты: SlotManager, GracePeriodService, ReconnectHandler\n- Integration-тесты: NATS reconnect_request pipeline\n- `npm run lint && npm test && npm run build` проходит",
    scope:"apps/local-orchestrator/", arch:"docs/architecture/22_service_contracts.md, docs/architecture/27_connection_handling.md", unit:"SlotManager, GracePeriodService, ReconnectRequestHandler, HeartbeatService", int:"NATS reconnect_request request/reply" },
  { num:9, id:"TASK-2.5", title:"Gameplay Service", epic:"Epic 2: Реализация сервисов", branch:"feature/gameplay/simulation-stubs", deps:[4,8],
    desc:"Реализовать Gameplay Service (MVP — без реального GameLoop):\n- NATS: публикация gameplay.service.heartbeat\n- NATS: подписка на gameplay.start_simulation -> создание stub-инстанса\n- Управление инстансами: Map<matchId, GameSimulation>\n- NATS: подписка на gameplay.remove_player -> удаление игрока\n- Stub WorldState: { serverTick, entities_full: [], events: [] }",
    dor:"- TASK-1.4 завершена (скаффолдинг с ECS stubs)\n- TASK-2.4 завершена (orchestrator отправляет gameplay.start_simulation)",
    dod:"- Heartbeat публикуется периодически\n- gameplay.start_simulation создаёт инстанс GameSimulation\n- gameplay.remove_player удаляет игрока\n- Stub WorldState публикуется в gameplay.world_state.{matchId}\n- Unit-тесты: SimulationManager, GameSimulation (stub), HeartbeatService\n- `npm run lint && npm test && npm run build` проходит",
    scope:"apps/gameplay-service/", arch:"docs/architecture/22_service_contracts.md, docs/architecture/28_gameplay_service_internals.md, docs/architecture/30_game_initialization_flow.md", unit:"SimulationManager, GameSimulation stub, HeartbeatService", int:"NATS start_simulation -> simulation created" },
  { num:10, id:"TASK-2.6", title:"WebSocket Service — connect", epic:"Epic 2: Реализация сервисов", branch:"feature/websocket/connect-flow", deps:[4,8],
    desc:"Реализовать WebSocket Service — первое подключение:\n- WS Gateway: принимает client.authenticate (JWT + опционально matchId)\n- Валидация JWT, извлечение playerId\n- NATS запрос к Orchestrator: проверка слота\n- При успехе: server.authenticate.success, публикация player.connection.status { connected }\n- При разрыве: server.match.player_disconnected остальным, публикация player.connection.status { disconnected }",
    dor:"- TASK-1.4 завершена (ws.gateway.ts заглушка)\n- TASK-2.4 завершена (orchestrator обрабатывает запросы на проверку слотов)",
    dod:"- WS Gateway принимает соединения, валидирует JWT\n- client.authenticate -> проверка через Orchestrator -> success/failure\n- При подключении: публикация player.connection.status { connected }\n- При отключении: рассылка player_disconnected, публикация { disconnected }\n- Unit-тесты: AuthenticateHandler, ConnectionManager, WsGateway (mock WS)\n- Integration-тесты: WS connect + authenticate pipeline (с mock NATS)\n- `npm run lint && npm test && npm run build` проходит",
    scope:"apps/websocket-service/", arch:"docs/architecture/26_websocket_json_protocol.md, docs/architecture/27_connection_handling.md, docs/architecture/25_api_and_websocket_contracts.md", unit:"AuthenticateHandler, ConnectionManager, WsGateway", int:"WS connect + authenticate flow (mock)" },
  { num:11, id:"TASK-2.7", title:"WebSocket Service — reconnect", epic:"Epic 2: Реализация сервисов", branch:"feature/websocket/reconnect-flow", deps:[10],
    desc:"Реализовать реконнект:\n- WS: client.reconnect (JWT) — первое сообщение нового соединения\n- NATS запрос orchestrator.player.reconnect_request с playerId\n- Успех: server.reconnect.success (matchId + WorldState), player.connection.status { reconnected }, player_reconnected остальным\n- Ошибка: server.reconnect.error (SLOT_NOT_AVAILABLE / GRACE_EXPIRED / MATCH_NOT_FOUND), закрытие WS\n- Синхронизация состояния лобби: server.lobby.state_update\n- Простое эхо в игровом режиме",
    dor:"- TASK-2.6 завершена (WebSocket connect работает)",
    dod:"- client.reconnect -> запрос к Orchestrator -> success/error\n- При успехе: полный WorldState, player_reconnected broadcast\n- При ошибке: reconnect_error с кодом, WS закрывается\n- Lobby state sync работает\n- Эхо-режим: клиент отправляет input, получает state обратно\n- Unit-тесты: ReconnectHandler, LobbyStateSync\n- Integration-тесты: WS reconnect pipeline (mock)\n- `npm run lint && npm test && npm run build` проходит",
    scope:"apps/websocket-service/", arch:"docs/architecture/26_websocket_json_protocol.md, docs/architecture/27_connection_handling.md", unit:"ReconnectHandler, LobbyStateSyncService", int:"WS reconnect pipeline" },
  { num:12, id:"TASK-3.1", title:"E2E: базовый флоу", epic:"Epic 3: Интеграционное тестирование", branch:"test/e2e/basic-flow", deps:[5,6,7,8,9,10],
    desc:"E2E тест — полный базовый флоу:\n1. Регистрация пользователя (POST /auth/register)\n2. Получение JWT\n3. Создание лобби или solo join\n4. WebSocket подключение + authenticate\n5. Эхо (отправка input -> получение state)\n6. Disconnect",
    dor:"- Все сервисы Epic 2 реализованы\n- Docker infra запущена\n- Все сервисы запущены локально или в Docker",
    dod:"- E2E тест проходит: register -> JWT -> matchmaking -> WS connect -> echo -> disconnect\n- Тест запускается через `npm run test:e2e`\n- Все промежуточные шаги верифицированы (HTTP статусы, WS сообщения)",
    scope:"test/e2e/", arch:"docs/mvp_plan.md (TASK-3.1)", unit:"Нет", int:"Полный E2E тест" },
  { num:13, id:"TASK-3.2", title:"E2E: реконнект", epic:"Epic 3: Интеграционное тестирование", branch:"test/e2e/reconnect-flow", deps:[11,12],
    desc:"E2E тест — реконнект:\n1. Регистрация + аутентификация\n2. Вход в матч\n3. Разрыв соединения\n4. Переподключение в течение Grace Period -> server.reconnect.success\n5. Переподключение после Grace Period -> server.reconnect.error { code: GRACE_EXPIRED }",
    dor:"- TASK-2.7 завершена (reconnect реализован)\n- TASK-3.1 завершена (базовый E2E работает)",
    dod:"- E2E тест: reconnect в пределах grace period -> success\n- E2E тест: reconnect после grace period -> GRACE_EXPIRED\n- Тесты запускаются через `npm run test:e2e`",
    scope:"test/e2e/", arch:"docs/architecture/27_connection_handling.md, docs/mvp_plan.md (TASK-3.2)", unit:"Нет", int:"E2E reconnect scenarios" },
  { num:14, id:"TASK-3.3", title:"E2E: защита слота", epic:"Epic 3: Интеграционное тестирование", branch:"test/e2e/slot-protection", deps:[11,12],
    desc:"E2E тест — защита слота:\n1. Создать матч на двух игроков (A и B)\n2. Игрок A разрывает соединение\n3. Игрок C пытается реконнектнуться в слот A -> SLOT_NOT_AVAILABLE\n4. Игрок A реконнектится с правильным JWT -> успех",
    dor:"- TASK-2.7 завершена (reconnect с проверкой слотов)\n- TASK-3.1 завершена (базовый E2E работает)",
    dod:"- E2E тест: чужой playerId -> SLOT_NOT_AVAILABLE\n- E2E тест: правильный playerId -> reconnect success\n- Тесты запускаются через `npm run test:e2e`",
    scope:"test/e2e/", arch:"docs/architecture/27_connection_handling.md, docs/mvp_plan.md (TASK-3.3)", unit:"Нет", int:"E2E slot protection scenarios" },
  { num:15, id:"TASK-4.1", title:"swagger-aggregator (шаблон)", epic:"Epic 4: Пустые шаблоны", branch:"chore/scaffold/swagger-aggregator", deps:[1,3],
    desc:"Пустой шаблон: нет domain/application/infrastructure. main.ts, app.module.ts, presentation/http/swagger-aggregator.http.controller.ts (stub GET /openapi.json).",
    dor:"- TASK-1.1 и TASK-1.3 завершены", dod:"- Сервис компилируется\n- Stub контроллер GET /openapi.json\n- `npm run lint` проходит",
    scope:"apps/swagger-aggregator/", arch:"docs/architecture/16_project_structure.md", unit:"Нет (шаблон)", int:"Нет" },
  { num:16, id:"TASK-4.2", title:"building-service (шаблон)", epic:"Epic 4: Пустые шаблоны", branch:"chore/scaffold/building-service", deps:[1,3],
    desc:"Полный шаблон: Entity<Props>, BuildingEntity, UpgradeEntity, ports (IBuildingRepository, IUpgradeRepository), все модули, stub controllers.",
    dor:"- TASK-1.1 и TASK-1.3 завершены", dod:"- Полная Clean Architecture структура\n- Все модули, entities, ports, stubs созданы\n- `npm run build building-service` проходит\n- `npm run lint` проходит",
    scope:"apps/building-service/", arch:"docs/architecture/09_building_service.md", unit:"Нет (шаблон)", int:"Нет" },
  { num:17, id:"TASK-4.3", title:"combat-progress-service (шаблон)", epic:"Epic 4: Пустые шаблоны", branch:"chore/scaffold/combat-progress-service", deps:[1,3],
    desc:"Полный шаблон: PlayerProgressEntity, BattlePassEntity, AchievementEntity, ports, все модули, stub controllers.",
    dor:"- TASK-1.1 и TASK-1.3 завершены", dod:"- Полная Clean Architecture структура\n- Все entities, ports, modules, stubs\n- `npm run build` и `npm run lint` проходят",
    scope:"apps/combat-progress-service/", arch:"docs/architecture/10_combat_progress_service.md", unit:"Нет (шаблон)", int:"Нет" },
  { num:18, id:"TASK-4.4", title:"scheduler-service (шаблон)", epic:"Epic 4: Пустые шаблоны", branch:"chore/scaffold/scheduler-service", deps:[1,3],
    desc:"Дополнить: ScheduledJobEntity, Bull Queue stubs (passive-income, job-reset, shop-rotation, leaderboard), scheduler.http.controller.ts.",
    dor:"- TASK-1.1 и TASK-1.3 завершены", dod:"- Полная Clean Architecture структура\n- Bull Queue заглушки\n- `npm run build` и `npm run lint` проходят",
    scope:"apps/scheduler-service/", arch:"docs/architecture/12_scheduler_service.md", unit:"Нет (шаблон)", int:"Нет" },
  { num:19, id:"TASK-4.5", title:"collector-service (шаблон)", epic:"Epic 4: Пустые шаблоны", branch:"chore/scaffold/collector-service", deps:[1,3],
    desc:"Шаблон без domain. IClickHouseRepository, ClickHouseService/Module, analytics.nats.controller.ts (subjects из @lib/lib-analytics).",
    dor:"- TASK-1.1 и TASK-1.3 завершены", dod:"- Структура без domain, с ClickHouse стабами\n- NATS controller подписан на subjects из lib-analytics\n- `npm run build` и `npm run lint` проходят",
    scope:"apps/collector-service/", arch:"docs/architecture/03_analytics_and_events.md", unit:"Нет (шаблон)", int:"Нет" },
  { num:20, id:"TASK-4.6", title:"payment-service (шаблон)", epic:"Epic 4: Пустые шаблоны", branch:"chore/scaffold/payment-service", deps:[1,3],
    desc:"Шаблон: PurchaseEntity, IAppleIAPPort, IGooglePlayIAPPort, payment.http.controller.ts (POST /api/payment/validate).",
    dor:"- TASK-1.1 и TASK-1.3 завершены", dod:"- Clean Architecture структура\n- IAP port abstractions\n- `npm run build` и `npm run lint` проходят",
    scope:"apps/payment-service/", arch:"docs/architecture/06_payment_validation_service.md", unit:"Нет (шаблон)", int:"Нет" },
  { num:21, id:"TASK-4.7", title:"history-service (шаблон)", epic:"Epic 4: Пустые шаблоны", branch:"chore/scaffold/history-service", deps:[1,3],
    desc:"Шаблон: MatchHistoryEntity, ReplayEntity, IMatchHistoryRepository, history.http.controller.ts, history.nats.controller.ts.",
    dor:"- TASK-1.1 и TASK-1.3 завершены", dod:"- Clean Architecture структура\n- Все entities, ports, modules, stubs\n- `npm run build` и `npm run lint` проходят",
    scope:"apps/history-service/", arch:"docs/architecture/29_match_history_system.md", unit:"Нет (шаблон)", int:"Нет" },
];

function depsStr(deps) {
  return deps.length > 0 ? deps.map(d => `phase_1_${d}`).join(', ') : 'Нет';
}

function wtName(branch) {
  return branch.replace(/\//g, '-');
}

function genTask(t) {
  return `# ${t.id}: ${t.title}

## Статус: \`NOT STARTED\`

**Epic:** ${t.epic}
**Ветка:** \`${t.branch}\`
**Зависимости:** ${depsStr(t.deps)}

---

## Описание
${t.desc}

## Scope (затрагиваемые файлы/каталоги)
\`${t.scope}\`

## Ключевые документы архитектуры
${t.arch}

---

## Definition of Ready (DoR)
${t.dor}

## Definition of Done (DoD)
${t.dod}

---

## Тесты

**Unit-тесты (\`*.unit.spec.ts\`):**
${t.unit}

**Integration-тесты (\`*.integration.spec.ts\`):**
${t.int}

---

## Лог прогресса

| Дата | Событие | Агент |
|------|---------|-------|
| — | Задача создана | System |
`;
}

const STYLE_RULES = `## Стиль кода и правила
- **Clean Architecture:** Domain без NestJS/Prisma; ports = abstract classes; handlers < 50 строк
- **DTO:** Zod (\`createZodDto\`) + Swagger аннотации
- **NATS:** subjects из \`libs/lib-*\`, никогда не хардкодить строки
- **bigint:** запрещён в прикладном коде (только инфраструктура и Prisma mappers)
- **Currency/Language:** только из \`@lib/shared/currency\` и \`@lib/shared/language\`
- **Тесты:** \`*.unit.spec.ts\`, \`*.integration.spec.ts\`
- **Коммиты:** Conventional Commits + \`Co-Authored-By: Oz <oz-agent@warp.dev>\`
- **Ошибки:** RFC 7807 (\`BaseException\`, \`ProblemDetails\`)
- **Логи:** не логировать секреты/токены/персональные данные`;

function genPrepare(t) {
  const ds = depsStr(t.deps);
  return `# Промпт: ПОДГОТОВКА — ${t.id}: ${t.title}

> Этот промпт предназначен для AI-агента (Cursor/Warp). Цель — подготовить рабочее окружение перед началом разработки.

---

## Контекст задачи

**ID:** ${t.id}
**Название:** ${t.title}
**Ветка:** \`${t.branch}\`
**Epic:** ${t.epic}
**Зависимости:** ${ds}

### Описание
${t.desc}

### Definition of Ready (DoR)
${t.dor}

### Definition of Done (DoD)
${t.dod}

---

## Инструкции для агента

### Шаг 1: Проверка DoR
1. Убедись что все зависимости (${ds}) завершены. Проверь статус в \`docs/mvp/mvp_phase_1.md\`.
2. Если зависимости не завершены — **СТОП**. Сообщи оркестратору и не продолжай.

### Шаг 2: Синхронизация с main
\`\`\`bash
git checkout main
git pull origin main
\`\`\`

### Шаг 3: Создание worktree и ветки
\`\`\`bash
git worktree add ../worktrees/${wtName(t.branch)} -b ${t.branch} main
cd ../worktrees/${wtName(t.branch)}
\`\`\`
Или без worktree:
\`\`\`bash
git checkout -b ${t.branch} main
\`\`\`

### Шаг 4: Проверка текущего состояния
\`\`\`bash
npm install
npm run lint
npm test
npm run build
\`\`\`
Если что-то падает — **СТОП**. Не начинай работу на сломанной базе.

### Шаг 5: Обновление статуса
1. В \`docs/mvp/phase_1_${t.num}/task.md\` замени статус на \`PREPARING\`.
2. Добавь запись в лог прогресса: дата, «Подготовка начата», имя агента.
3. В \`docs/mvp/mvp_phase_1.md\` обнови статус задачи ${t.num} на \`🔄 PREPARING\`.

### Шаг 6: Коммит подготовки
\`\`\`bash
git add docs/mvp/
git commit -m "chore(mvp): prepare ${t.id} - ${t.title}

Co-Authored-By: Oz <oz-agent@warp.dev>"
\`\`\`

---

${STYLE_RULES}

## Документация для изучения
- ${t.arch}
- docs/guides/GIT_WORKFLOW.md
- docs/guides/CODE_QUALITY.md
- docs/guides/TESTING_PYRAMID.md
- docs/agents/cursor.md
`;
}

function genDevelop(t) {
  return `# Промпт: РАЗРАБОТКА — ${t.id}: ${t.title}

> Этот промпт предназначен для AI-агента (Cursor). Цель — реализовать задачу и написать тесты.

---

## Контекст задачи

**ID:** ${t.id}
**Название:** ${t.title}
**Ветка:** \`${t.branch}\`
**Epic:** ${t.epic}
**Scope:** \`${t.scope}\`

### Описание
${t.desc}

### Definition of Done (DoD)
${t.dod}

---

## Инструкции для агента

### Шаг 0: Проверка что подготовка выполнена
Убедись что ты на ветке \`${t.branch}\` и статус задачи — \`PREPARING\` или \`IN PROGRESS\`.
\`\`\`bash
git branch --show-current
\`\`\`

### Шаг 1: Обновление статуса
1. В \`docs/mvp/phase_1_${t.num}/task.md\` замени статус на \`IN PROGRESS\`.
2. В \`docs/mvp/mvp_phase_1.md\` обнови статус задачи ${t.num} на \`🛠️ IN PROGRESS\`.

### Шаг 2: Изучение паттернов
1. Прочитай документацию: ${t.arch}
2. Найди аналогичные реализации в существующем коде (\`apps/\`, \`libs/\`).
3. Следуй паттернам проекта, не придумывай новые.

### Шаг 3: Реализация
Scope: \`${t.scope}\`

**Следуй паттернам:**
- Domain entities: наследуют \`Entity<Props>\`, инварианты в конструкторе/методах
- Ports: abstract classes в \`application/ports/\`
- Use-cases: CQRS handlers (Command/Query), тонкие (< 50 строк)
- HTTP Controllers: Swagger + Zod DTO + делегирование в handlers
- NATS Controllers: \`@MessagePattern\` / \`@EventPattern\` + делегирование
- Infrastructure: реализации портов, Prisma mappers
- Ошибки: RFC 7807 (BaseException из \`@lib/shared\`)

### Шаг 4: Написание тестов

**Unit-тесты (\`*.unit.spec.ts\`):**
${t.unit}

**Integration-тесты (\`*.integration.spec.ts\`):**
${t.int}

Правила:
- Unit: мокай ports, тестируй логику handlers/entities/mappers
- Integration: реальная БД (testcontainers) или HTTP pipeline
- Не мокай Zod-схемы
- Именование: \`описание.unit.spec.ts\`, \`описание.integration.spec.ts\`

### Шаг 5: Проверки
\`\`\`bash
npm run lint
npm test
npm run build
\`\`\`
Все три команды должны проходить без ошибок.

### Шаг 6: Атомарные коммиты
\`\`\`bash
git add <files>
git commit -m "<type>(<scope>): <description>

Co-Authored-By: Oz <oz-agent@warp.dev>"
\`\`\`
Типы: \`feat\`, \`test\`, \`refactor\`, \`chore\`

---

${STYLE_RULES}

## Ключевые файлы для reference
- \`apps/auth-service/src/\` — пример Clean Architecture сервиса
- \`apps/player-service/src/\` — пример с NATS + HTTP
- \`libs/shared/\` — ApplicationBootstrapBuilder, MetricsModule
- \`libs/lib-player/\` — пример NATS subjects/publishers
`;
}

function genReview(t) {
  return `# Промпт: РЕВЬЮ — ${t.id}: ${t.title}

> Этот промпт предназначен для AI-агента (Warp/Cursor). Цель — проверить результат, прогнать строгие проверки, создать PR.

---

## Контекст задачи

**ID:** ${t.id}
**Название:** ${t.title}
**Ветка:** \`${t.branch}\`
**Scope:** \`${t.scope}\`

### Definition of Done (DoD)
${t.dod}

---

## Инструкции для агента

### Шаг 1: Верификация DoD
Пройди по каждому пункту DoD и убедись, что он выполнен. Если нет — верни на доработку с комментарием.

### Шаг 2: Строгие проверки
\`\`\`bash
npm run format
npm run lint
npm test
npm run test:cov
npm run build
\`\`\`
**Все команды должны завершиться с кодом 0.**

Дополнительно (если задача затрагивает интеграции):
\`\`\`bash
npm run docker:infra
npm run test:e2e
\`\`\`

### Шаг 3: Чек-лист ревью

**Архитектура:**
- [ ] Clean Architecture соблюдена (Domain не зависит от NestJS/Prisma)
- [ ] Ports — abstract classes (не interfaces)
- [ ] Handlers тонкие (< 50 строк)
- [ ] Нет логики в контроллерах (только делегирование)

**Контракты и DTO:**
- [ ] DTO валидируются через Zod (\`createZodDto\`)
- [ ] Swagger аннотации на всех HTTP endpoints
- [ ] NATS subjects не хардкодятся (используются \`libs/lib-*\`)
- [ ] Zod schemas для NATS request/response

**Данные и безопасность:**
- [ ] \`bigint\` не используется в прикладном коде
- [ ] Currency/Language не захардкожены
- [ ] Логи не содержат секретов/токенов/персональных данных
- [ ] Ошибки — RFC 7807 (ProblemDetails)

**Тесты:**
- [ ] Unit-тесты покрывают: ${t.unit}
- [ ] Integration-тесты: ${t.int}
- [ ] Именование: \`*.unit.spec.ts\`, \`*.integration.spec.ts\`
- [ ] Тесты детерминированные и быстрые

**Git:**
- [ ] Conventional Commits
- [ ] \`Co-Authored-By: Oz <oz-agent@warp.dev>\`
- [ ] Нет несвязанных изменений

### Шаг 4: Обновление статуса
1. В \`docs/mvp/phase_1_${t.num}/task.md\` замени статус на \`IN REVIEW\`.
2. В \`docs/mvp/mvp_phase_1.md\` обнови статус задачи ${t.num} на \`👁️ IN REVIEW\`.

### Шаг 5: Создание PR
\`\`\`bash
git push origin ${t.branch}
gh pr create --base main --head ${t.branch} \\
  --title "${t.id}: ${t.title}" \\
  --body "## ${t.title}

### Чек-лист
- [ ] lint пройден
- [ ] тесты пройдены
- [ ] build успешен
- [ ] DoD выполнен

**Задача:** docs/mvp/phase_1_${t.num}/task.md

Co-Authored-By: Oz <oz-agent@warp.dev>"
\`\`\`

### Шаг 6: После мержа
1. В \`docs/mvp/phase_1_${t.num}/task.md\` замени статус на \`DONE\`.
2. В \`docs/mvp/mvp_phase_1.md\` обнови статус задачи ${t.num} на \`✅ DONE\`.
3. Добавь запись в лог прогресса task.md.
`;
}

// === GENERATE ===
let count = 0;
for (const t of tasks) {
  const dir = join(__dirname, `phase_1_${t.num}`);
  mkdirSync(dir, { recursive: true });

  writeFileSync(join(dir, 'task.md'), genTask(t), 'utf8');
  writeFileSync(join(dir, 'prompts_prepare.md'), genPrepare(t), 'utf8');
  writeFileSync(join(dir, 'prompts_develop.md'), genDevelop(t), 'utf8');
  writeFileSync(join(dir, 'prompts_review.md'), genReview(t), 'utf8');
  count += 4;
}
console.log(`Generated ${count} files for ${tasks.length} tasks in docs/mvp/phase_1_*/`);
