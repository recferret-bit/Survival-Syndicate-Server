# TASK-2.3: Matchmaking Service

## Статус: `NOT STARTED`

**Epic:** Epic 2: Реализация сервисов
**Ветка:** `feature/matchmaking/lobby-and-solo`
**Зависимости:** phase_1_4, phase_1_5

---

## Описание
Реализовать Matchmaking Service:
- HTTP: POST /api/lobbies/create, POST /api/lobbies/{id}/join, DELETE /api/lobbies/{id}/leave, POST /api/lobbies/{id}/start
- HTTP: POST /api/matchmaking/join-solo
- NATS: подписка на orchestrator.zone.heartbeat (выбор зоны)
- NATS: подписка на match.finished (обновление статуса лобби)
- NATS: публикация matchmaking.found_match с зафиксированным списком playerIds

## Scope (затрагиваемые файлы/каталоги)
`apps/matchmaking-service/`

## Ключевые документы архитектуры
docs/architecture/32_lobby_and_match_lifecycle.md, docs/architecture/22_service_contracts.md

---

## Definition of Ready (DoR)
- TASK-1.4 завершена
- TASK-2.1 завершена (JWT для авторизации запросов)
- NATS subjects определены в libs/

## Definition of Done (DoD)
- Lobby CRUD работает (create, join, leave, start)
- Solo matchmaking создаёт матч мгновенно
- При start лобби -> публикуется matchmaking.found_match с playerIds
- Подписка на orchestrator.zone.heartbeat
- Подписка на match.finished
- DTO: Zod, Swagger
- Unit-тесты: CreateLobbyHandler, JoinLobbyHandler, StartMatchHandler, LobbyEntity
- Integration-тесты: Lobby HTTP pipeline, NATS matchmaking.found_match
- `npm run lint && npm test && npm run build` проходит

---

## Тесты

**Unit-тесты (`*.unit.spec.ts`):**
CreateLobbyHandler, JoinLobbyHandler, LeaveLobbyHandler, StartMatchHandler, LobbyEntity

**Integration-тесты (`*.integration.spec.ts`):**
Lobby HTTP pipeline, NATS found_match publication

---

## Лог прогресса

| Дата | Событие | Агент |
|------|---------|-------|
| — | Задача создана | System |
