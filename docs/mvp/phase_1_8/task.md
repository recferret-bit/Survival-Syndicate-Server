# TASK-2.4: Local Orchestrator

## Статус: `NOT STARTED`

**Epic:** Epic 2: Реализация сервисов
**Ветка:** `phase_1_8/feature/orchestrator/slot-management`
**Зависимости:** phase_1_4, phase_1_7

---

## Описание
Реализовать Local Orchestrator:
- NATS: публикация orchestrator.zone.heartbeat
- NATS: подписка на gameplay.service.heartbeat
- NATS: подписка на matchmaking.found_match -> сохранение слотов, отправка gameplay.start_simulation
- NATS: подписка на player.connection.status (disconnect -> Grace Period 60 сек)
- NATS: request/reply orchestrator.player.reconnect_request — проверка слота
- Управление слотами: Map<matchId, Map<playerId, SlotStatus>>
- Grace Period: 60 сек -> gameplay.remove_player
- Блокировка чужого реконнекта

## Scope (затрагиваемые файлы/каталоги)
`apps/local-orchestrator/`

## Ключевые документы архитектуры
docs/architecture/22_service_contracts.md, docs/architecture/27_connection_handling.md

---

## Definition of Ready (DoR)
- TASK-1.4 завершена
- TASK-2.3 завершена (matchmaking публикует matchmaking.found_match)

## Definition of Done (DoD)
- Heartbeat публикуется периодически
- При matchmaking.found_match -> создаётся Map слотов, отправляется gameplay.start_simulation
- При disconnect -> запускается таймер Grace Period
- При истечении Grace Period -> отправляется gameplay.remove_player
- orchestrator.player.reconnect_request: валидация playerId -> success/SLOT_NOT_AVAILABLE/GRACE_EXPIRED/MATCH_NOT_FOUND
- Unit-тесты: SlotManager, GracePeriodService, ReconnectHandler
- Integration-тесты: NATS reconnect_request pipeline
- `npm run lint && npm test && npm run build` проходит

---

## Тесты

**Unit-тесты (`*.unit.spec.ts`):**
SlotManager, GracePeriodService, ReconnectRequestHandler, HeartbeatService

**Integration-тесты (`*.integration.spec.ts`):**
NATS reconnect_request request/reply

---

## Лог прогресса

| Дата | Событие | Агент |
|------|---------|-------|
| — | Задача создана | System |
