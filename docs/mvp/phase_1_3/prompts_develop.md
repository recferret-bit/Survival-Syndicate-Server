# Промпт: РАЗРАБОТКА — TASK-1.3: Общая libs библиотека

> Этот промпт предназначен для AI-агента (Cursor). Цель — реализовать задачу и написать тесты.

---

## Контекст задачи

**ID:** TASK-1.3
**Название:** Общая libs библиотека
**Ветка:** `feature/infra/shared-libs`
**Epic:** Epic 1: Базовая инфраструктура
**Scope:** `libs/`

### Описание
Создать shared библиотеки в `libs/`:
- `@lib/shared` — утилиты, фильтры, pipes, guards, метрики, ApplicationBootstrapBuilder
- `@lib/lib-player` — PlayerPublisher, PlayerSubjects, Zod schemas
- `@lib/lib-building` — BuildingPublisher, BuildingSubjects
- `@lib/lib-game-server` — GameServerPublisher, GameServerSubjects
- `@lib/lib-combat-progress` — CombatProgressPublisher, CombatProgressSubjects
- `@lib/lib-analytics` — AnalyticsPublisher, AnalyticsSubjects

### Definition of Done (DoD)
- Все библиотеки экспортируют базовые модули через `index.ts`
- NATS subjects не хардкодятся — используются enum/const из lib-*
- Zod schemas для NATS request/response определены в lib-*
- `ApplicationBootstrapBuilder` реализован в `@lib/shared`
- Импорт `@lib/shared/*`, `@lib/lib-player/*` и др. разрешается TypeScript
- Unit-тесты для Zod schemas

---

## Инструкции для агента

### Шаг 0: Проверка что подготовка выполнена
Убедись что ты на ветке `feature/infra/shared-libs` и статус задачи — `PREPARING` или `IN PROGRESS`.
```bash
git branch --show-current
```

### Шаг 1: Обновление статуса
1. В `docs/mvp/phase_1_3/task.md` замени статус на `IN PROGRESS`.
2. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 3 на `🛠️ IN PROGRESS`.

### Шаг 2: Изучение паттернов
1. Прочитай документацию: docs/architecture/15_nats_best_practices.md, docs/architecture/22_service_contracts.md
2. Найди аналогичные реализации в существующем коде (`apps/`, `libs/`).
3. Следуй паттернам проекта, не придумывай новые.

### Шаг 3: Реализация
Scope: `libs/`

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
Zod schema validation, subject string constants

**Integration-тесты (`*.integration.spec.ts`):**
Нет

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
