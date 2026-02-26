# TASK-1.4: Скаффолдинг MVP-сервисов

## Статус: `NOT STARTED`

**Epic:** Epic 1: Базовая инфраструктура
**Ветка:** `feature/infra/mvp-service-scaffolding`
**Зависимости:** phase_1_1, phase_1_3

---

## Описание
Создать Clean Architecture структуру для 6 MVP-сервисов: auth-service, player-service, matchmaking-service, local-orchestrator, gameplay-service, websocket-service.

Каждый: main.ts, app.module.ts, domain/ (Entity base), application/ (ApplicationModule, ports/), infrastructure/ (InfrastructureModule, prisma/), presentation/ (PresentationModule, http/, nats/).

Особенности:
- gameplay-service: + presentation/websocket/, ECS stubs (ISystem, IComponent, WorldState, GameLoop)
- websocket-service: + presentation/websocket/ws.gateway.ts
- matchmaking-service: + infrastructure/prisma/
- PrismaService: auth-service, player-service, matchmaking-service

## Scope (затрагиваемые файлы/каталоги)
`apps/auth-service, apps/player-service, apps/matchmaking-service, apps/local-orchestrator, apps/gameplay-service, apps/websocket-service`

## Ключевые документы архитектуры
docs/architecture/16_project_structure.md, docs/mvp_plan.md (секция TASK-1.4)

---

## Definition of Ready (DoR)
- TASK-1.1 и TASK-1.3 завершены
- libs/ библиотеки доступны для импорта

## Definition of Done (DoD)
- 6 сервисов имеют полную Clean Architecture структуру
- Каждый main.ts использует ApplicationBootstrapBuilder из @lib/shared
- Каждый app.module.ts импортирует PresentationModule и MetricsModule
- abstract Entity<Props> определён в domain/entities/entity.ts каждого сервиса
- PrismaModule + PrismaService созданы для сервисов с БД
- `npm run build` компилирует все 6 сервисов без ошибок
- `npm run lint` проходит без ошибок

---

## Тесты

**Unit-тесты (`*.unit.spec.ts`):**
Нет (скаффолдинг)

**Integration-тесты (`*.integration.spec.ts`):**
Нет

---

## Лог прогресса

| Дата | Событие | Агент |
|------|---------|-------|
| — | Задача создана | System |
