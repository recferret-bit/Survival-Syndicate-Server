# Промпт: РАЗРАБОТКА — TASK-2.6: WebSocket Service — connect

> Этот промпт предназначен для AI-агента (Cursor). Цель — реализовать задачу и написать тесты.

---

## Контекст задачи

**ID:** TASK-2.6
**Название:** WebSocket Service — connect
**Ветка:** `feature/websocket/connect-flow`
**Epic:** Epic 2: Реализация сервисов
**Scope:** `apps/websocket-service/`

### Описание
Реализовать WebSocket Service — первое подключение:
- WS Gateway: принимает client.authenticate (JWT + опционально matchId)
- Валидация JWT, извлечение playerId
- NATS запрос к Orchestrator: проверка слота
- При успехе: server.authenticate.success, публикация player.connection.status { connected }
- При разрыве: server.match.player_disconnected остальным, публикация player.connection.status { disconnected }

### Definition of Done (DoD)
- WS Gateway принимает соединения, валидирует JWT
- client.authenticate -> проверка через Orchestrator -> success/failure
- При подключении: публикация player.connection.status { connected }
- При отключении: рассылка player_disconnected, публикация { disconnected }
- Unit-тесты: AuthenticateHandler, ConnectionManager, WsGateway (mock WS)
- Integration-тесты: WS connect + authenticate pipeline (с mock NATS)
- `npm run lint && npm test && npm run build` проходит

---

## Инструкции для агента

### Шаг 0: Проверка что подготовка выполнена
Убедись что ты на ветке `feature/websocket/connect-flow` и статус задачи — `PREPARING` или `IN PROGRESS`.
```bash
git branch --show-current
```

### Шаг 1: Обновление статуса
1. В `docs/mvp/phase_1_10/task.md` замени статус на `IN PROGRESS`.
2. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 10 на `🛠️ IN PROGRESS`.

### Шаг 2: Изучение паттернов
1. Прочитай документацию: docs/architecture/26_websocket_json_protocol.md, docs/architecture/27_connection_handling.md, docs/architecture/25_api_and_websocket_contracts.md
2. Найди аналогичные реализации в существующем коде (`apps/`, `libs/`).
3. Следуй паттернам проекта, не придумывай новые.

### Шаг 3: Реализация
Scope: `apps/websocket-service/`

**Следуй паттернам:**
- Domain entities: наследуют `Entity<Props>`, инварианты в конструкторе/методах
- Ports: abstract classes в `application/ports/`
- Use-cases: CQRS handlers (Command/Query), тонкие (< 50 строк)
- HTTP Controllers: Swagger + Zod DTO + делегирование в handlers
- NATS Controllers: `@MessagePattern` / `@EventPattern` + делегирование
- Infrastructure: реализации портов, Prisma mappers
- Ошибки: RFC 7807 (BaseException из `@lib/shared`)

### Шаг 4: Написание тестов

**Unit-тесты (`*.unit.spec.ts`):**
AuthenticateHandler, ConnectionManager, WsGateway

**Integration-тесты (`*.integration.spec.ts`):**
WS connect + authenticate flow (mock)

Правила:
- Unit: мокай ports, тестируй логику handlers/entities/mappers
- Integration: реальная БД (testcontainers) или HTTP pipeline
- Не мокай Zod-схемы
- Именование: `описание.unit.spec.ts`, `описание.integration.spec.ts`

### Шаг 5: Проверки
```bash
npm run lint
npm test
npm run build
```
Все три команды должны проходить без ошибок.

### Шаг 6: Атомарные коммиты
```bash
git add <files>
git commit -m "<type>(<scope>): <description>

Co-Authored-By: Oz <oz-agent@warp.dev>"
```
Типы: `feat`, `test`, `refactor`, `chore`

---

## Стиль кода и правила
- **Clean Architecture:** Domain без NestJS/Prisma; ports = abstract classes; handlers < 50 строк
- **DTO:** Zod (`createZodDto`) + Swagger аннотации
- **NATS:** subjects из `libs/lib-*`, никогда не хардкодить строки
- **bigint:** запрещён в прикладном коде (только инфраструктура и Prisma mappers)
- **Currency/Language:** только из `@lib/shared/currency` и `@lib/shared/language`
- **Тесты:** `*.unit.spec.ts`, `*.integration.spec.ts`
- **Коммиты:** Conventional Commits + `Co-Authored-By: Oz <oz-agent@warp.dev>`
- **Ошибки:** RFC 7807 (`BaseException`, `ProblemDetails`)
- **Логи:** не логировать секреты/токены/персональные данные

## Ключевые файлы для reference
- `apps/auth-service/src/` — пример Clean Architecture сервиса
- `apps/player-service/src/` — пример с NATS + HTTP
- `libs/shared/` — ApplicationBootstrapBuilder, MetricsModule
- `libs/lib-player/` — пример NATS subjects/publishers
