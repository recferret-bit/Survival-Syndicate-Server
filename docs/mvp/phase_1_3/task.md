# TASK-1.3: Общая libs библиотека

## Статус: `NOT STARTED`

**Epic:** Epic 1: Базовая инфраструктура
**Ветка:** `feature/infra/shared-libs`
**Зависимости:** phase_1_1

---

## Описание
Создать shared библиотеки в `libs/`:
- `@lib/shared` — утилиты, фильтры, pipes, guards, метрики, ApplicationBootstrapBuilder
- `@lib/lib-player` — PlayerPublisher, PlayerSubjects, Zod schemas
- `@lib/lib-building` — BuildingPublisher, BuildingSubjects
- `@lib/lib-game-server` — GameServerPublisher, GameServerSubjects
- `@lib/lib-combat-progress` — CombatProgressPublisher, CombatProgressSubjects
- `@lib/lib-analytics` — AnalyticsPublisher, AnalyticsSubjects

## Scope (затрагиваемые файлы/каталоги)
`libs/`

## Ключевые документы архитектуры
docs/architecture/15_nats_best_practices.md, docs/architecture/22_service_contracts.md

---

## Definition of Ready (DoR)
- TASK-1.1 завершена
- Path aliases настроены в tsconfig.json

## Definition of Done (DoD)
- Все библиотеки экспортируют базовые модули через `index.ts`
- NATS subjects не хардкодятся — используются enum/const из lib-*
- Zod schemas для NATS request/response определены в lib-*
- `ApplicationBootstrapBuilder` реализован в `@lib/shared`
- Импорт `@lib/shared/*`, `@lib/lib-player/*` и др. разрешается TypeScript
- Unit-тесты для Zod schemas

---

## Тесты

**Unit-тесты (`*.unit.spec.ts`):**
Zod schema validation, subject string constants

**Integration-тесты (`*.integration.spec.ts`):**
Нет

---

## Лог прогресса

| Дата | Событие | Агент |
|------|---------|-------|
| — | Задача создана | System |
