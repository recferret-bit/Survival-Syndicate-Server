# Промпт: ПОДГОТОВКА — TASK-2.5: Gameplay Service

> Этот промпт предназначен для AI-агента (Cursor/Warp). Цель — подготовить рабочее окружение перед началом разработки.

---

## Контекст задачи

**ID:** TASK-2.5
**Название:** Gameplay Service
**Ветка:** `phase_1_9/feature/gameplay/simulation-stubs`
**Epic:** Epic 2: Реализация сервисов
**Зависимости:** phase_1_4, phase_1_8

### Описание
Реализовать Gameplay Service (MVP — без реального GameLoop):
- NATS: публикация gameplay.service.heartbeat
- NATS: подписка на gameplay.start_simulation -> создание stub-инстанса
- Управление инстансами: Map<matchId, GameSimulation>
- NATS: подписка на gameplay.remove_player -> удаление игрока
- Stub WorldState: { serverTick, entities_full: [], events: [] }

### Definition of Ready (DoR)
- TASK-1.4 завершена (скаффолдинг с ECS stubs)
- TASK-2.4 завершена (orchestrator отправляет gameplay.start_simulation)

### Definition of Done (DoD)
- Heartbeat публикуется периодически
- gameplay.start_simulation создаёт инстанс GameSimulation
- gameplay.remove_player удаляет игрока
- Stub WorldState публикуется в gameplay.world_state.{matchId}
- Unit-тесты: SimulationManager, GameSimulation (stub), HeartbeatService
- `npm run lint && npm test && npm run build` проходит

---

## Инструкции для агента

### Шаг 1: Проверка DoR
1. Убедись что все зависимости (phase_1_4, phase_1_8) завершены. Проверь статус в `docs/mvp/mvp_phase_1.md`.
2. Если зависимости не завершены — **СТОП**. Сообщи оркестратору и не продолжай.

### Шаг 2: Синхронизация с main
```bash
git checkout main
git pull origin main
```

### Шаг 3: Создание worktree и ветки
```bash
git worktree add ../worktrees/feature-gameplay-simulation-stubs -b phase_1_9/feature/gameplay/simulation-stubs main
cd ../worktrees/feature-gameplay-simulation-stubs
```
Или без worktree:
```bash
git checkout -b phase_1_9/feature/gameplay/simulation-stubs main
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
1. В `docs/mvp/phase_1_9/task.md` замени статус на `PREPARING`.
2. Добавь запись в лог прогресса: дата, «Подготовка начата», имя агента.
3. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 9 на `🔄 PREPARING`.

### Шаг 6: Коммит подготовки
```bash
git add docs/mvp/
git commit -m "chore(mvp): prepare TASK-2.5 - Gameplay Service

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
- docs/architecture/22_service_contracts.md, docs/architecture/28_gameplay_service_internals.md, docs/architecture/30_game_initialization_flow.md
- docs/guides/GIT_WORKFLOW.md
- docs/guides/CODE_QUALITY.md
- docs/guides/TESTING_PYRAMID.md
- docs/agents/cursor.md
