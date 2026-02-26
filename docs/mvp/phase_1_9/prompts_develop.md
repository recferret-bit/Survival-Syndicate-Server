# Промпт: РАЗРАБОТКА — TASK-2.5: Gameplay Service

> Этот промпт предназначен для AI-агента (Cursor). Цель — реализовать задачу и написать тесты.

---

## Контекст задачи

**ID:** TASK-2.5
**Название:** Gameplay Service
**Ветка:** `feature/gameplay/simulation-stubs`
**Epic:** Epic 2: Реализация сервисов
**Scope:** `apps/gameplay-service/`

### Описание
Реализовать Gameplay Service (MVP — без реального GameLoop):
- NATS: публикация gameplay.service.heartbeat
- NATS: подписка на gameplay.start_simulation -> создание stub-инстанса
- Управление инстансами: Map<matchId, GameSimulation>
- NATS: подписка на gameplay.remove_player -> удаление игрока
- Stub WorldState: { serverTick, entities_full: [], events: [] }

### Definition of Done (DoD)
- Heartbeat публикуется периодически
- gameplay.start_simulation создаёт инстанс GameSimulation
- gameplay.remove_player удаляет игрока
- Stub WorldState публикуется в gameplay.world_state.{matchId}
- Unit-тесты: SimulationManager, GameSimulation (stub), HeartbeatService
- `npm run lint && npm test && npm run build` проходит

---

## Инструкции для агента

### Шаг 0: Проверка что подготовка выполнена
Убедись что ты на ветке `feature/gameplay/simulation-stubs` и статус задачи — `PREPARING` или `IN PROGRESS`.
```bash
git branch --show-current
```

### Шаг 1: Обновление статуса
1. В `docs/mvp/phase_1_9/task.md` замени статус на `IN PROGRESS`.
2. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 9 на `🛠️ IN PROGRESS`.

### Шаг 2: Изучение паттернов
1. Прочитай документацию: docs/architecture/22_service_contracts.md, docs/architecture/28_gameplay_service_internals.md, docs/architecture/30_game_initialization_flow.md
2. Найди аналогичные реализации в существующем коде (`apps/`, `libs/`).
3. Следуй паттернам проекта, не придумывай новые.

### Шаг 3: Реализация
Scope: `apps/gameplay-service/`

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
SimulationManager, GameSimulation stub, HeartbeatService

**Integration-тесты (`*.integration.spec.ts`):**
NATS start_simulation -> simulation created

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
