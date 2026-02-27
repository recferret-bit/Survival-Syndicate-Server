# TASK-2.1: Auth Service

## Статус: `IN REVIEW`

**Epic:** Epic 2: Реализация сервисов
**Ветка:** `phase_1_5/feature/auth/registration-and-login`
**Зависимости:** phase_1_4

---

## Описание
Реализовать регистрацию и логин:
- HTTP: POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout
- JWT (HS256): AccessToken (7d), RefreshToken (30d)
- Публикация NATS события `user.registered` после регистрации
- DTO валидация через Zod (createZodDto)
- Prisma: таблица Users (id, email, username, passwordHash, roles, createdAt)

## Scope (затрагиваемые файлы/каталоги)
`apps/auth-service/`

## Ключевые документы архитектуры
docs/architecture/17_auth_and_authorization.md, docs/architecture/18_error_handling.md

---

## Definition of Ready (DoR)
- TASK-1.4 завершена (скаффолдинг auth-service)
- Docker infra запущена (PostgreSQL, NATS, Redis)
- Prisma schema для meta DB содержит таблицу Users

## Definition of Done (DoD)
- Регистрация создаёт пользователя, возвращает JWT пару, публикует user.registered
- Логин валидирует credentials, возвращает JWT пару
- Refresh token rotation работает
- Logout отзывает все токены пользователя
- DTO: Zod + createZodDto, Swagger аннотации
- Ошибки: RFC 7807 (ProblemDetails)
- Unit-тесты: handlers, entity, mapper
- Integration-тесты: HTTP endpoints (register, login, refresh)
- `npm run lint && npm test && npm run build` проходит

---

## Тесты

**Unit-тесты (`*.unit.spec.ts`):**
RegisterHandler, LoginHandler, TokenService, UserEntity, UserPrismaMapper

**Integration-тесты (`*.integration.spec.ts`):**
POST /auth/register, POST /auth/login, POST /auth/refresh pipeline

---

## Лог прогресса

| Дата | Событие | Агент |
|------|---------|-------|
| — | Задача создана | System |
| 2026-02-27 | Подготовка начата | Cursor |
| 2026-02-27 | Реализация завершена, отправлено на ревью | Cursor |
