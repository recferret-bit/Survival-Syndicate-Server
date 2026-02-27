# Промпт: ПОДГОТОВКА — TASK-2.6: WebSocket Service — connect

> Этот промпт предназначен для AI-агента (Cursor/Warp). Цель — подготовить рабочее окружение перед началом разработки.

---

## Контекст задачи

**ID:** TASK-2.6
**Название:** WebSocket Service — connect
**Ветка:** `phase_1_10/feature/websocket/connect-flow`
**Epic:** Epic 2: Реализация сервисов
**Зависимости:** phase_1_4, phase_1_8

### Описание
Реализовать WebSocket Service — первое подключение:
- WS Gateway: принимает client.authenticate (JWT + опционально matchId)
- Валидация JWT, извлечение playerId
- NATS запрос к Orchestrator: проверка слота
- При успехе: server.authenticate.success, публикация player.connection.status { connected }
- При разрыве: server.match.player_disconnected остальным, публикация player.connection.status { disconnected }

### Definition of Ready (DoR)
- TASK-1.4 завершена (ws.gateway.ts заглушка)
- TASK-2.4 завершена (orchestrator обрабатывает запросы на проверку слотов)

### Definition of Done (DoD)
- WS Gateway принимает соединения, валидирует JWT
- client.authenticate -> проверка через Orchestrator -> success/failure
- При подключении: публикация player.connection.status { connected }
- При отключении: рассылка player_disconnected, публикация { disconnected }
- Unit-тесты: AuthenticateHandler, ConnectionManager, WsGateway (mock WS)
- Integration-тесты: WS connect + authenticate pipeline (с mock NATS)
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
git worktree add ../worktrees/feature-websocket-connect-flow -b phase_1_10/feature/websocket/connect-flow main
cd ../worktrees/feature-websocket-connect-flow
```
Или без worktree:
```bash
git checkout -b phase_1_10/feature/websocket/connect-flow main
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
1. В `docs/mvp/phase_1_10/task.md` замени статус на `PREPARING`.
2. Добавь запись в лог прогресса: дата, «Подготовка начата», имя агента.
3. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 10 на `🔄 PREPARING`.

### Шаг 6: Коммит подготовки
```bash
git add docs/mvp/
git commit -m "chore(mvp): prepare TASK-2.6 - WebSocket Service — connect

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
- docs/architecture/26_websocket_json_protocol.md, docs/architecture/27_connection_handling.md, docs/architecture/25_api_and_websocket_contracts.md
- docs/guides/GIT_WORKFLOW.md
- docs/guides/CODE_QUALITY.md
- docs/guides/TESTING_PYRAMID.md
- docs/agents/cursor.md
