# Промпт: РАЗРАБОТКА — TASK-2.7: WebSocket Service — reconnect

> Этот промпт предназначен для AI-агента (Cursor). Цель — реализовать задачу и написать тесты.

---

## Контекст задачи

**ID:** TASK-2.7
**Название:** WebSocket Service — reconnect
**Ветка:** `feature/websocket/reconnect-flow`
**Epic:** Epic 2: Реализация сервисов
**Scope:** `apps/websocket-service/`

### Описание
Реализовать реконнект:
- WS: client.reconnect (JWT) — первое сообщение нового соединения
- NATS запрос orchestrator.player.reconnect_request с playerId
- Успех: server.reconnect.success (matchId + WorldState), player.connection.status { reconnected }, player_reconnected остальным
- Ошибка: server.reconnect.error (SLOT_NOT_AVAILABLE / GRACE_EXPIRED / MATCH_NOT_FOUND), закрытие WS
- Синхронизация состояния лобби: server.lobby.state_update
- Простое эхо в игровом режиме

### Definition of Done (DoD)
- client.reconnect -> запрос к Orchestrator -> success/error
- При успехе: полный WorldState, player_reconnected broadcast
- При ошибке: reconnect_error с кодом, WS закрывается
- Lobby state sync работает
- Эхо-режим: клиент отправляет input, получает state обратно
- Unit-тесты: ReconnectHandler, LobbyStateSync
- Integration-тесты: WS reconnect pipeline (mock)
- `npm run lint && npm test && npm run build` проходит

---

## Инструкции для агента

### Шаг 0: Проверка что подготовка выполнена
Убедись что ты на ветке `feature/websocket/reconnect-flow` и статус задачи — `PREPARING` или `IN PROGRESS`.
```bash
git branch --show-current
```

### Шаг 1: Обновление статуса
1. В `docs/mvp/phase_1_11/task.md` замени статус на `IN PROGRESS`.
2. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 11 на `🛠️ IN PROGRESS`.

### Шаг 2: Изучение паттернов
1. Прочитай документацию: docs/architecture/26_websocket_json_protocol.md, docs/architecture/27_connection_handling.md
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
ReconnectHandler, LobbyStateSyncService

**Integration-тесты (`*.integration.spec.ts`):**
WS reconnect pipeline

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
