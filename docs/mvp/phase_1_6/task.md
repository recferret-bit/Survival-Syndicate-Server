# TASK-2.2: Player Service

## Статус: `PREPARING`

**Epic:** Epic 2: Реализация сервисов
**Ветка:** `phase_1_6/feature/player/user-registered-handler`
**Зависимости:** phase_1_4, phase_1_5

---

## Описание
Реализовать Player Service:
- NATS: подписка на user.registered -> создание профиля игрока
- NATS: request/reply player.get для получения данных игрока
- HTTP: GET /api/players/me (профиль текущего пользователя)
- Prisma: таблица Players (id, userId, username, createdAt)

## Scope (затрагиваемые файлы/каталоги)
`apps/player-service/`

## Ключевые документы архитектуры
docs/architecture/11_player_service.md, docs/architecture/22_service_contracts.md

---

## Definition of Ready (DoR)
- TASK-1.4 завершена (скаффолдинг player-service)
- TASK-2.1 завершена (auth-service публикует user.registered)
- Prisma schema содержит таблицу Players

## Definition of Done (DoD)
- При получении user.registered создаётся профиль игрока
- player.get возвращает данные игрока по playerId
- HTTP GET /api/players/me возвращает профиль (JWT Guard)
- DTO: Zod, Swagger
- Unit-тесты: CreateProfileHandler, GetPlayerHandler, PlayerEntity, mapper
- Integration-тесты: NATS handler, HTTP pipeline
- `npm run lint && npm test && npm run build` проходит

---

## Тесты

**Unit-тесты (`*.unit.spec.ts`):**
CreateProfileHandler, GetPlayerHandler, PlayerEntity, PlayerPrismaMapper

**Integration-тесты (`*.integration.spec.ts`):**
NATS user.registered -> profile creation, HTTP GET /api/players/me

---

## Лог прогресса

| Дата | Событие | Агент |
|------|---------|-------|
| — | Задача создана | System |
| 2026-02-27 | Подготовка начата | Cursor |
