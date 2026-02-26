# Промпт: ПОДГОТОВКА — TASK-1.3: Общая libs библиотека

> Этот промпт предназначен для AI-агента (Cursor/Warp). Цель — подготовить рабочее окружение перед началом разработки.

---

## Контекст задачи

**ID:** TASK-1.3
**Название:** Общая libs библиотека
**Ветка:** `feature/infra/shared-libs`
**Epic:** Epic 1: Базовая инфраструктура
**Зависимости:** phase_1_1

### Описание
Создать shared библиотеки в `libs/`:
- `@lib/shared` — утилиты, фильтры, pipes, guards, метрики, ApplicationBootstrapBuilder
- `@lib/lib-player` — PlayerPublisher, PlayerSubjects, Zod schemas
- `@lib/lib-building` — BuildingPublisher, BuildingSubjects
- `@lib/lib-game-server` — GameServerPublisher, GameServerSubjects
- `@lib/lib-combat-progress` — CombatProgressPublisher, CombatProgressSubjects
- `@lib/lib-analytics` — AnalyticsPublisher, AnalyticsSubjects

### Definition of Ready (DoR)
- TASK-1.1 завершена
- Path aliases настроены в tsconfig.json

### Definition of Done (DoD)
- Все библиотеки экспортируют базовые модули через `index.ts`
- NATS subjects не хардкодятся — используются enum/const из lib-*
- Zod schemas для NATS request/response определены в lib-*
- `ApplicationBootstrapBuilder` реализован в `@lib/shared`
- Импорт `@lib/shared/*`, `@lib/lib-player/*` и др. разрешается TypeScript
- Unit-тесты для Zod schemas

---

## Инструкции для агента

### Шаг 1: Проверка DoR
1. Убедись что все зависимости (phase_1_1) завершены. Проверь статус в `docs/mvp/mvp_phase_1.md`.
2. Если зависимости не завершены — **СТОП**. Сообщи оркестратору и не продолжай.

### Шаг 2: Синхронизация с main
```bash
git checkout main
git pull origin main
```

### Шаг 3: Создание worktree и ветки
```bash
git worktree add ../worktrees/feature-infra-shared-libs -b feature/infra/shared-libs main
cd ../worktrees/feature-infra-shared-libs
```
Или без worktree:
```bash
git checkout -b feature/infra/shared-libs main
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
1. В `docs/mvp/phase_1_3/task.md` замени статус на `PREPARING`.
2. Добавь запись в лог прогресса: дата, «Подготовка начата», имя агента.
3. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 3 на `🔄 PREPARING`.

### Шаг 6: Коммит подготовки
```bash
git add docs/mvp/
git commit -m "chore(mvp): prepare TASK-1.3 - Общая libs библиотека

Co-Authored-By: Oz <oz-agent@warp.dev>"
```

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

## Документация для изучения
- docs/architecture/15_nats_best_practices.md, docs/architecture/22_service_contracts.md
- docs/guides/GIT_WORKFLOW.md
- docs/guides/CODE_QUALITY.md
- docs/guides/TESTING_PYRAMID.md
- docs/agents/cursor.md
