# TASK-2.6: WebSocket Service — connect

## Статус: `PREPARING`

**Epic:** Epic 2: Реализация сервисов
**Ветка:** `phase_1_10/feature/websocket/connect-flow`
**Зависимости:** phase_1_4, phase_1_8

---

## Описание
Реализовать WebSocket Service — первое подключение:
- WS Gateway: принимает client.authenticate (JWT + опционально matchId)
- Валидация JWT, извлечение playerId
- NATS запрос к Orchestrator: проверка слота
- При успехе: server.authenticate.success, публикация player.connection.status { connected }
- При разрыве: server.match.player_disconnected остальным, публикация player.connection.status { disconnected }

## Scope (затрагиваемые файлы/каталоги)
`apps/websocket-service/`

## Ключевые документы архитектуры
docs/architecture/26_websocket_json_protocol.md, docs/architecture/27_connection_handling.md, docs/architecture/25_api_and_websocket_contracts.md

---

## Definition of Ready (DoR)
- TASK-1.4 завершена (ws.gateway.ts заглушка)
- TASK-2.4 завершена (orchestrator обрабатывает запросы на проверку слотов)

## Definition of Done (DoD)
- WS Gateway принимает соединения, валидирует JWT
- client.authenticate -> проверка через Orchestrator -> success/failure
- При подключении: публикация player.connection.status { connected }
- При отключении: рассылка player_disconnected, публикация { disconnected }
- Unit-тесты: AuthenticateHandler, ConnectionManager, WsGateway (mock WS)
- Integration-тесты: WS connect + authenticate pipeline (с mock NATS)
- `npm run lint && npm test && npm run build` проходит

---

## Тесты

**Unit-тесты (`*.unit.spec.ts`):**
AuthenticateHandler, ConnectionManager, WsGateway

**Integration-тесты (`*.integration.spec.ts`):**
WS connect + authenticate flow (mock)

---

## Лог прогресса

| Дата | Событие | Агент |
|------|---------|-------|
| — | Задача создана | System |
| 2026-03-01 | Подготовка начата | Cursor |
