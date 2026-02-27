# Промпт: РАЗРАБОТКА — TASK-2.3: Matchmaking Service

> Этот промпт предназначен для AI-агента (Cursor). Цель — реализовать задачу и написать тесты.

---

## Контекст задачи

**ID:** TASK-2.3
**Название:** Matchmaking Service
**Ветка:** `phase_1_7/feature/matchmaking/lobby-and-solo`
**Epic:** Epic 2: Реализация сервисов
**Scope:** `apps/matchmaking-service/`

### Описание
Реализовать Matchmaking Service:
- HTTP: POST /api/lobbies/create, POST /api/lobbies/{id}/join, DELETE /api/lobbies/{id}/leave, POST /api/lobbies/{id}/start
- HTTP: POST /api/matchmaking/join-solo
- NATS: подписка на orchestrator.zone.heartbeat (выбор зоны)
- NATS: подписка на match.finished (обновление статуса лобби)
- NATS: публикация matchmaking.found_match с зафиксированным списком playerIds

### Definition of Done (DoD)
- Lobby CRUD работает (create, join, leave, start)
- Solo matchmaking создаёт матч мгновенно
- При start лобби -> публикуется matchmaking.found_match с playerIds
- Подписка на orchestrator.zone.heartbeat
- Подписка на match.finished
- DTO: Zod, Swagger
- Unit-тесты: CreateLobbyHandler, JoinLobbyHandler, StartMatchHandler, LobbyEntity
- Integration-тесты: Lobby HTTP pipeline, NATS matchmaking.found_match
- `npm run lint && npm test && npm run build` проходит

---

## Инструкции для агента

### Шаг 0: Проверка что подготовка выполнена
Убедись что ты на ветке `phase_1_7/feature/matchmaking/lobby-and-solo` и статус задачи — `PREPARING` или `IN PROGRESS`.
```bash
git branch --show-current
```

### Шаг 1: Обновление статуса
1. В `docs/mvp/phase_1_7/task.md` замени статус на `IN PROGRESS`.
2. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 7 на `🛠️ IN PROGRESS`.

### Шаг 2: Изучение паттернов
1. Прочитай документацию: docs/architecture/32_lobby_and_match_lifecycle.md, docs/architecture/22_service_contracts.md
2. Найди аналогичные реализации в существующем коде (`apps/`, `libs/`).
3. Следуй паттернам проекта, не придумывай новые.

### Шаг 3: Реализация
Scope: `apps/matchmaking-service/`

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
CreateLobbyHandler, JoinLobbyHandler, LeaveLobbyHandler, StartMatchHandler, LobbyEntity

**Integration-тесты (`*.integration.spec.ts`):**
Lobby HTTP pipeline, NATS found_match publication

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
