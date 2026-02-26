# Промпт: ПОДГОТОВКА — TASK-2.1: Auth Service

> Этот промпт предназначен для AI-агента (Cursor/Warp). Цель — подготовить рабочее окружение перед началом разработки.

---

## Контекст задачи

**ID:** TASK-2.1
**Название:** Auth Service
**Ветка:** `feature/auth/registration-and-login`
**Epic:** Epic 2: Реализация сервисов
**Зависимости:** phase_1_4

### Описание
Реализовать регистрацию и логин:
- HTTP: POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout
- JWT (HS256): AccessToken (7d), RefreshToken (30d)
- Публикация NATS события `user.registered` после регистрации
- DTO валидация через Zod (createZodDto)
- Prisma: таблица Users (id, email, username, passwordHash, roles, createdAt)

### Definition of Ready (DoR)
- TASK-1.4 завершена (скаффолдинг auth-service)
- Docker infra запущена (PostgreSQL, NATS, Redis)
- Prisma schema для meta DB содержит таблицу Users

### Definition of Done (DoD)
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

## Инструкции для агента

### Шаг 1: Проверка DoR
1. Убедись что все зависимости (phase_1_4) завершены. Проверь статус в `docs/mvp/mvp_phase_1.md`.
2. Если зависимости не завершены — **СТОП**. Сообщи оркестратору и не продолжай.

### Шаг 2: Синхронизация с main
```bash
git checkout main
git pull origin main
```

### Шаг 3: Создание worktree и ветки
```bash
git worktree add ../worktrees/feature-auth-registration-and-login -b feature/auth/registration-and-login main
cd ../worktrees/feature-auth-registration-and-login
```
Или без worktree:
```bash
git checkout -b feature/auth/registration-and-login main
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
1. В `docs/mvp/phase_1_5/task.md` замени статус на `PREPARING`.
2. Добавь запись в лог прогресса: дата, «Подготовка начата», имя агента.
3. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 5 на `🔄 PREPARING`.

### Шаг 6: Коммит подготовки
```bash
git add docs/mvp/
git commit -m "chore(mvp): prepare TASK-2.1 - Auth Service

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
- docs/architecture/17_auth_and_authorization.md, docs/architecture/18_error_handling.md
- docs/guides/GIT_WORKFLOW.md
- docs/guides/CODE_QUALITY.md
- docs/guides/TESTING_PYRAMID.md
- docs/agents/cursor.md
