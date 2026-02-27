# Промпт: ПОДГОТОВКА — TASK-1.2: Docker Compose

> Этот промпт предназначен для AI-агента (Cursor/Warp). Цель — подготовить рабочее окружение перед началом разработки.

---

## Контекст задачи

**ID:** TASK-1.2
**Название:** Docker Compose
**Ветка:** `phase_1_2/feature/infra/docker-compose`
**Epic:** Epic 1: Базовая инфраструктура
**Зависимости:** phase_1_1

### Описание
Настроить `docker-compose.infra.yml` для PostgreSQL (meta + catalog), NATS, Redis.
Настроить `docker-compose.full.yml` для запуска всех сервисов.
Создать `.env.example`.

### Definition of Ready (DoR)
- TASK-1.1 завершена
- Установлен Docker и Docker Compose

### Definition of Done (DoD)
- `docker/docker-compose.infra.yml` поднимает PostgreSQL, NATS, Redis
- `docker/docker-compose.full.yml` содержит конфигурации всех сервисов
- `docker/.env.example` содержит все необходимые переменные
- `npm run docker:infra` успешно запускает инфраструктуру
- Health checks проходят для всех контейнеров

---

## Инструкции для агента

### Шаг 1: Проверка DoR
1. Убедись что все зависимости (phase_1_1) завершены. Проверь статус в `docs/mvp/mvp_phase_1.md`.
2. Если зависимости не завершены — **СТОП**. Сообщи оркестратору и не продолжай.

### Шаг 2: Синхронизация с main
```bash
git checkout main
git pull origin main
```

### Шаг 3: Создание worktree и ветки
```bash
git worktree add ../worktrees/feature-infra-docker-compose -b phase_1_2/feature/infra/docker-compose main
cd ../worktrees/feature-infra-docker-compose
```
Или без worktree:
```bash
git checkout -b phase_1_2/feature/infra/docker-compose main
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
1. В `docs/mvp/phase_1_2/task.md` замени статус на `PREPARING`.
2. Добавь запись в лог прогресса: дата, «Подготовка начата», имя агента.
3. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 2 на `🔄 PREPARING`.

### Шаг 6: Коммит подготовки
```bash
git add docs/mvp/
git commit -m "chore(mvp): prepare TASK-1.2 - Docker Compose

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
- docs/architecture/16_project_structure.md
- docs/guides/GIT_WORKFLOW.md
- docs/guides/CODE_QUALITY.md
- docs/guides/TESTING_PYRAMID.md
- docs/agents/cursor.md
