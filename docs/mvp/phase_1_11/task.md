# TASK-2.7: WebSocket Service — reconnect

## Статус: `NOT STARTED`

**Epic:** Epic 2: Реализация сервисов
**Ветка:** `phase_1_11/feature/websocket/reconnect-flow`
**Зависимости:** phase_1_10

---

## Описание
Реализовать реконнект:
- WS: client.reconnect (JWT) — первое сообщение нового соединения
- NATS запрос orchestrator.player.reconnect_request с playerId
- Успех: server.reconnect.success (matchId + WorldState), player.connection.status { reconnected }, player_reconnected остальным
- Ошибка: server.reconnect.error (SLOT_NOT_AVAILABLE / GRACE_EXPIRED / MATCH_NOT_FOUND), закрытие WS
- Синхронизация состояния лобби: server.lobby.state_update
- Простое эхо в игровом режиме

## Scope (затрагиваемые файлы/каталоги)
`apps/websocket-service/`

## Ключевые документы архитектуры
docs/architecture/26_websocket_json_protocol.md, docs/architecture/27_connection_handling.md

---

## Definition of Ready (DoR)
- TASK-2.6 завершена (WebSocket connect работает)

## Definition of Done (DoD)
- client.reconnect -> запрос к Orchestrator -> success/error
- При успехе: полный WorldState, player_reconnected broadcast
- При ошибке: reconnect_error с кодом, WS закрывается
- Lobby state sync работает
- Эхо-режим: клиент отправляет input, получает state обратно
- Unit-тесты: ReconnectHandler, LobbyStateSync
- Integration-тесты: WS reconnect pipeline (mock)
- `npm run lint && npm test && npm run build` проходит

---

## Тесты

**Unit-тесты (`*.unit.spec.ts`):**
ReconnectHandler, LobbyStateSyncService

**Integration-тесты (`*.integration.spec.ts`):**
WS reconnect pipeline

---

## Лог прогресса

| Дата | Событие | Агент |
|------|---------|-------|
| — | Задача создана | System |
