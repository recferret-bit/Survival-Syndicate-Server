# Промпт: ПОДГОТОВКА — TASK-2.7: WebSocket Service — reconnect

> Этот промпт предназначен для AI-агента (Cursor/Warp). Цель — подготовить рабочее окружение перед началом разработки.

---

## Контекст задачи

**ID:** TASK-2.7
**Название:** WebSocket Service — reconnect
**Ветка:** `phase_1_11/feature/websocket/reconnect-flow`
**Epic:** Epic 2: Реализация сервисов
**Зависимости:** phase_1_10

### Описание
Реализовать реконнект:
- WS: client.reconnect (JWT) — первое сообщение нового соединения
- NATS запрос orchestrator.player.reconnect_request с playerId
- Успех: server.reconnect.success (matchId + WorldState), player.connection.status { reconnected }, player_reconnected остальным
- Ошибка: server.reconnect.error (SLOT_NOT_AVAILABLE / GRACE_EXPIRED / MATCH_NOT_FOUND), закрытие WS
- Синхронизация состояния лобби: server.lobby.state_update
- Простое эхо в игровом режиме

### Definition of Ready (DoR)
- TASK-2.6 завершена (WebSocket connect работает)

### Definition of Done (DoD)
- client.reconnect -> запрос к Orchestrator -> success/error
- При успехе: полный WorldState, player_reconnected broadcast
- При ошибке: reconnect_error с кодом, WS закрывается
- Lobby state sync работает
- Эхо-режим: клиент отправляет input, получает state обратно
- Unit-тесты: ReconnectHandler, LobbyStateSync
- Integration-тесты: WS reconnect pipeline (mock)
- `npm run lint && npm test && npm run build` проходит

---

## Инструкции для агента

### Шаг 1: Проверка DoR
1. Убедись что все зависимости (phase_1_10) завершены. Проверь статус в `docs/mvp/mvp_phase_1.md`.
2. Если зависимости не завершены — **СТОП**. Сообщи оркестратору и не продолжай.

### Шаг 2: Синхронизация с main
```bash
git checkout main
git pull origin main
```

### Шаг 3: Создание worktree и ветки
```bash
git worktree add ../worktrees/feature-websocket-reconnect-flow -b phase_1_11/feature/websocket/reconnect-flow main
cd ../worktrees/feature-websocket-reconnect-flow
```
Или без worktree:
```bash
git checkout -b phase_1_11/feature/websocket/reconnect-flow main
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
1. В `docs/mvp/phase_1_11/task.md` замени статус на `PREPARING`.
2. Добавь запись в лог прогресса: дата, «Подготовка начата», имя агента.
3. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 11 на `🔄 PREPARING`.

### Шаг 6: Коммит подготовки
```bash
git add docs/mvp/
git commit -m "chore(mvp): prepare TASK-2.7 - WebSocket Service — reconnect

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
- docs/architecture/26_websocket_json_protocol.md, docs/architecture/27_connection_handling.md
- docs/guides/GIT_WORKFLOW.md
- docs/guides/CODE_QUALITY.md
- docs/guides/TESTING_PYRAMID.md
- docs/agents/cursor.md
