# Промпт: ПОДГОТОВКА — TASK-3.2: E2E: реконнект

> Этот промпт предназначен для AI-агента (Cursor/Warp). Цель — подготовить рабочее окружение перед началом разработки.

---

## Контекст задачи

**ID:** TASK-3.2
**Название:** E2E: реконнект
**Ветка:** `test/e2e/reconnect-flow`
**Epic:** Epic 3: Интеграционное тестирование
**Зависимости:** phase_1_11, phase_1_12

### Описание
E2E тест — реконнект:
1. Регистрация + аутентификация
2. Вход в матч
3. Разрыв соединения
4. Переподключение в течение Grace Period -> server.reconnect.success
5. Переподключение после Grace Period -> server.reconnect.error { code: GRACE_EXPIRED }

### Definition of Ready (DoR)
- TASK-2.7 завершена (reconnect реализован)
- TASK-3.1 завершена (базовый E2E работает)

### Definition of Done (DoD)
- E2E тест: reconnect в пределах grace period -> success
- E2E тест: reconnect после grace period -> GRACE_EXPIRED
- Тесты запускаются через `npm run test:e2e`

---

## Инструкции для агента

### Шаг 1: Проверка DoR
1. Убедись что все зависимости (phase_1_11, phase_1_12) завершены. Проверь статус в `docs/mvp/mvp_phase_1.md`.
2. Если зависимости не завершены — **СТОП**. Сообщи оркестратору и не продолжай.

### Шаг 2: Синхронизация с main
```bash
git checkout main
git pull origin main
```

### Шаг 3: Создание worktree и ветки
```bash
git worktree add ../worktrees/test-e2e-reconnect-flow -b test/e2e/reconnect-flow main
cd ../worktrees/test-e2e-reconnect-flow
```
Или без worktree:
```bash
git checkout -b test/e2e/reconnect-flow main
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
1. В `docs/mvp/phase_1_13/task.md` замени статус на `PREPARING`.
2. Добавь запись в лог прогресса: дата, «Подготовка начата», имя агента.
3. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 13 на `🔄 PREPARING`.

### Шаг 6: Коммит подготовки
```bash
git add docs/mvp/
git commit -m "chore(mvp): prepare TASK-3.2 - E2E: реконнект

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
- docs/architecture/27_connection_handling.md, docs/mvp_plan.md (TASK-3.2)
- docs/guides/GIT_WORKFLOW.md
- docs/guides/CODE_QUALITY.md
- docs/guides/TESTING_PYRAMID.md
- docs/agents/cursor.md
