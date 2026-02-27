# Промпт: ПОДГОТОВКА — TASK-4.6: payment-service (шаблон)

> Этот промпт предназначен для AI-агента (Cursor/Warp). Цель — подготовить рабочее окружение перед началом разработки.

---

## Контекст задачи

**ID:** TASK-4.6
**Название:** payment-service (шаблон)
**Ветка:** `phase_1_20/chore/scaffold/payment-service`
**Epic:** Epic 4: Пустые шаблоны
**Зависимости:** phase_1_1, phase_1_3

### Описание
Шаблон: PurchaseEntity, IAppleIAPPort, IGooglePlayIAPPort, payment.http.controller.ts (POST /api/payment/validate).

### Definition of Ready (DoR)
- TASK-1.1 и TASK-1.3 завершены

### Definition of Done (DoD)
- Clean Architecture структура
- IAP port abstractions
- `npm run build` и `npm run lint` проходят

---

## Инструкции для агента

### Шаг 1: Проверка DoR
1. Убедись что все зависимости (phase_1_1, phase_1_3) завершены. Проверь статус в `docs/mvp/mvp_phase_1.md`.
2. Если зависимости не завершены — **СТОП**. Сообщи оркестратору и не продолжай.

### Шаг 2: Синхронизация с main
```bash
git checkout main
git pull origin main
```

### Шаг 3: Создание worktree и ветки
```bash
git worktree add ../worktrees/chore-scaffold-payment-service -b phase_1_20/chore/scaffold/payment-service main
cd ../worktrees/chore-scaffold-payment-service
```
Или без worktree:
```bash
git checkout -b phase_1_20/chore/scaffold/payment-service main
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
1. В `docs/mvp/phase_1_20/task.md` замени статус на `PREPARING`.
2. Добавь запись в лог прогресса: дата, «Подготовка начата», имя агента.
3. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 20 на `🔄 PREPARING`.

### Шаг 6: Коммит подготовки
```bash
git add docs/mvp/
git commit -m "chore(mvp): prepare TASK-4.6 - payment-service (шаблон)

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
- docs/architecture/06_payment_validation_service.md
- docs/guides/GIT_WORKFLOW.md
- docs/guides/CODE_QUALITY.md
- docs/guides/TESTING_PYRAMID.md
- docs/agents/cursor.md
