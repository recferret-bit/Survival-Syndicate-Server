# TASK-2.5: Gameplay Service

## Статус: `PREPARING`

**Epic:** Epic 2: Реализация сервисов
**Ветка:** `phase_1_9/feature/gameplay/simulation-stubs`
**Зависимости:** phase_1_4, phase_1_8

---

## Описание
Реализовать Gameplay Service (MVP — без реального GameLoop):
- NATS: публикация gameplay.service.heartbeat
- NATS: подписка на gameplay.start_simulation -> создание stub-инстанса
- Управление инстансами: Map<matchId, GameSimulation>
- NATS: подписка на gameplay.remove_player -> удаление игрока
- Stub WorldState: { serverTick, entities_full: [], events: [] }

## Scope (затрагиваемые файлы/каталоги)
`apps/gameplay-service/`

## Ключевые документы архитектуры
docs/architecture/22_service_contracts.md, docs/architecture/28_gameplay_service_internals.md, docs/architecture/30_game_initialization_flow.md

---

## Definition of Ready (DoR)
- TASK-1.4 завершена (скаффолдинг с ECS stubs)
- TASK-2.4 завершена (orchestrator отправляет gameplay.start_simulation)

## Definition of Done (DoD)
- Heartbeat публикуется периодически
- gameplay.start_simulation создаёт инстанс GameSimulation
- gameplay.remove_player удаляет игрока
- Stub WorldState публикуется в gameplay.world_state.{matchId}
- Unit-тесты: SimulationManager, GameSimulation (stub), HeartbeatService
- `npm run lint && npm test && npm run build` проходит

---

## Тесты

**Unit-тесты (`*.unit.spec.ts`):**
SimulationManager, GameSimulation stub, HeartbeatService

**Integration-тесты (`*.integration.spec.ts`):**
NATS start_simulation -> simulation created

---

## Лог прогресса

| Дата | Событие | Агент |
|------|---------|-------|
| — | Задача создана | System |
| 2026-02-28 | Подготовка начата | Cursor |
