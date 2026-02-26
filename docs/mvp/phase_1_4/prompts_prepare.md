# Промпт: ПОДГОТОВКА — TASK-1.4: Скаффолдинг MVP-сервисов

> Этот промпт предназначен для AI-агента (Cursor/Warp). Цель — подготовить рабочее окружение перед началом разработки.

---

## Контекст задачи

**ID:** TASK-1.4
**Название:** Скаффолдинг MVP-сервисов
**Ветка:** `feature/infra/mvp-service-scaffolding`
**Epic:** Epic 1: Базовая инфраструктура
**Зависимости:** phase_1_1, phase_1_3

### Описание
Создать Clean Architecture структуру для 6 MVP-сервисов: auth-service, player-service, matchmaking-service, local-orchestrator, gameplay-service, websocket-service.

Каждый: main.ts, app.module.ts, domain/ (Entity base), application/ (ApplicationModule, ports/), infrastructure/ (InfrastructureModule, prisma/), presentation/ (PresentationModule, http/, nats/).

Особенности:
- gameplay-service: + presentation/websocket/, ECS stubs (ISystem, IComponent, WorldState, GameLoop)
- websocket-service: + presentation/websocket/ws.gateway.ts
- matchmaking-service: + infrastructure/prisma/
- PrismaService: auth-service, player-service, matchmaking-service

### Definition of Ready (DoR)
- TASK-1.1 и TASK-1.3 завершены
- libs/ библиотеки доступны для импорта

### Definition of Done (DoD)
- 6 сервисов имеют полную Clean Architecture структуру
- Каждый main.ts использует ApplicationBootstrapBuilder из @lib/shared
- Каждый app.module.ts импортирует PresentationModule и MetricsModule
- abstract Entity<Props> определён в domain/entities/entity.ts каждого сервиса
- PrismaModule + PrismaService созданы для сервисов с БД
- `npm run build` компилирует все 6 сервисов без ошибок
- `npm run lint` проходит без ошибок

---

## Инструкции для агента

### Шаг 1: Проверка DoR
1. Убедись что все зависимости (phase_1_1, phase_1_3) завершены. Проверь статус в `docs/mvp/mvp_phase_1.md`.
2. Если зависимости не завершены — **СТОП**. Сообщи оркестратору и не продолжай.

### Шаг 2: Синхронизация с main
```bash
git checkout main
git pull origin main
```

### Шаг 3: Создание worktree и ветки
```bash
git worktree add ../worktrees/feature-infra-mvp-service-scaffolding -b feature/infra/mvp-service-scaffolding main
cd ../worktrees/feature-infra-mvp-service-scaffolding
```
Или без worktree:
```bash
git checkout -b feature/infra/mvp-service-scaffolding main
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
1. В `docs/mvp/phase_1_4/task.md` замени статус на `PREPARING`.
2. Добавь запись в лог прогресса: дата, «Подготовка начата», имя агента.
3. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 4 на `🔄 PREPARING`.

### Шаг 6: Коммит подготовки
```bash
git add docs/mvp/
git commit -m "chore(mvp): prepare TASK-1.4 - Скаффолдинг MVP-сервисов

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
- docs/architecture/16_project_structure.md, docs/mvp_plan.md (секция TASK-1.4)
- docs/guides/GIT_WORKFLOW.md
- docs/guides/CODE_QUALITY.md
- docs/guides/TESTING_PYRAMID.md
- docs/agents/cursor.md
