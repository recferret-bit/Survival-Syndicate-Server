# Промпт: ПОДГОТОВКА — TASK-2.3: Matchmaking Service

> Этот промпт предназначен для AI-агента (Cursor/Warp). Цель — подготовить рабочее окружение перед началом разработки.

---

## Контекст задачи

**ID:** TASK-2.3
**Название:** Matchmaking Service
**Ветка:** `phase_1_7/feature/matchmaking/lobby-and-solo`
**Epic:** Epic 2: Реализация сервисов
**Зависимости:** phase_1_4, phase_1_5

### Описание
Реализовать Matchmaking Service:
- HTTP: POST /api/lobbies/create, POST /api/lobbies/{id}/join, DELETE /api/lobbies/{id}/leave, POST /api/lobbies/{id}/start
- HTTP: POST /api/matchmaking/join-solo
- NATS: подписка на orchestrator.zone.heartbeat (выбор зоны)
- NATS: подписка на match.finished (обновление статуса лобби)
- NATS: публикация matchmaking.found_match с зафиксированным списком playerIds

### Definition of Ready (DoR)
- TASK-1.4 завершена
- TASK-2.1 завершена (JWT для авторизации запросов)
- NATS subjects определены в libs/

### Definition of Done (DoD)
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

## Инструкции для агента

### Шаг 1: Проверка DoR
1. Убедись что все зависимости (phase_1_4, phase_1_5) завершены. Проверь статус в `docs/mvp/mvp_phase_1.md`.
2. Если зависимости не завершены — **СТОП**. Сообщи оркестратору и не продолжай.

### Шаг 2: Синхронизация с main
```bash
git checkout main
git pull origin main
```

### Шаг 3: Создание worktree и ветки
```bash
git worktree add ../worktrees/feature-matchmaking-lobby-and-solo -b phase_1_7/feature/matchmaking/lobby-and-solo main
cd ../worktrees/feature-matchmaking-lobby-and-solo
```
Или без worktree:
```bash
git checkout -b phase_1_7/feature/matchmaking/lobby-and-solo main
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
1. В `docs/mvp/phase_1_7/task.md` замени статус на `PREPARING`.
2. Добавь запись в лог прогресса: дата, «Подготовка начата», имя агента.
3. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 7 на `🔄 PREPARING`.

### Шаг 6: Коммит подготовки
```bash
git add docs/mvp/
git commit -m "chore(mvp): prepare TASK-2.3 - Matchmaking Service

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
- docs/architecture/32_lobby_and_match_lifecycle.md, docs/architecture/22_service_contracts.md
- docs/guides/GIT_WORKFLOW.md
- docs/guides/CODE_QUALITY.md
- docs/guides/TESTING_PYRAMID.md
- docs/agents/cursor.md
