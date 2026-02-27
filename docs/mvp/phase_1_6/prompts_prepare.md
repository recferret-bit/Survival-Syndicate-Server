# Промпт: ПОДГОТОВКА — TASK-2.2: Player Service

> Этот промпт предназначен для AI-агента (Cursor/Warp). Цель — подготовить рабочее окружение перед началом разработки.

---

## Контекст задачи

**ID:** TASK-2.2
**Название:** Player Service
**Ветка:** `phase_1_6/feature/player/user-registered-handler`
**Epic:** Epic 2: Реализация сервисов
**Зависимости:** phase_1_4, phase_1_5

### Описание
Реализовать Player Service:
- NATS: подписка на user.registered -> создание профиля игрока
- NATS: request/reply player.get для получения данных игрока
- HTTP: GET /api/players/me (профиль текущего пользователя)
- Prisma: таблица Players (id, userId, username, createdAt)

### Definition of Ready (DoR)
- TASK-1.4 завершена (скаффолдинг player-service)
- TASK-2.1 завершена (auth-service публикует user.registered)
- Prisma schema содержит таблицу Players

### Definition of Done (DoD)
- При получении user.registered создаётся профиль игрока
- player.get возвращает данные игрока по playerId
- HTTP GET /api/players/me возвращает профиль (JWT Guard)
- DTO: Zod, Swagger
- Unit-тесты: CreateProfileHandler, GetPlayerHandler, PlayerEntity, mapper
- Integration-тесты: NATS handler, HTTP pipeline
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
git worktree add ../worktrees/feature-player-user-registered-handler -b phase_1_6/feature/player/user-registered-handler main
cd ../worktrees/feature-player-user-registered-handler
```
Или без worktree:
```bash
git checkout -b phase_1_6/feature/player/user-registered-handler main
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
1. В `docs/mvp/phase_1_6/task.md` замени статус на `PREPARING`.
2. Добавь запись в лог прогресса: дата, «Подготовка начата», имя агента.
3. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 6 на `🔄 PREPARING`.

### Шаг 6: Коммит подготовки
```bash
git add docs/mvp/
git commit -m "chore(mvp): prepare TASK-2.2 - Player Service

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
- docs/architecture/11_player_service.md, docs/architecture/22_service_contracts.md
- docs/guides/GIT_WORKFLOW.md
- docs/guides/CODE_QUALITY.md
- docs/guides/TESTING_PYRAMID.md
- docs/agents/cursor.md
