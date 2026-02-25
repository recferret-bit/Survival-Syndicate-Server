# Testing Pyramid — Survival Syndicate Server

## Цели
- Быстро ловить регрессии в доменной логике и use-cases.
- Проверять интеграции (Prisma/DB, NATS контракты) отдельным слоем.
- Иметь небольшой набор E2E, которые гарантируют работоспособность ключевых пользовательских флоу.

## Пирамида
```
           E2E
     Integration tests
         Unit tests
```

## 1) Unit tests (много)
Тестируем изоляционно:
- domain entities/services (инварианты)
- application handlers (CQRS) с моками ports
- mapper’ы (Domain ↔ Prisma)
- presentation controllers: только routing/делегирование/валидация (без реальной БД)

Соглашение имён: `*.unit.spec.ts`.

## 2) Integration tests (средне)
Тестируем реальные интеграции:
- Prisma repositories с тестовой БД
- HTTP pipeline (validation + filters) при необходимости
- важные сериализации/конверсии (BigNumber ↔ storage types)

Соглашение имён: `*.integration.spec.ts`.

## 3) E2E tests (мало)
Тестируем сценарии уровня системы:
- ключевые API флоу
- (для MVP) WS connect/disconnect/reconnect сценарии из `docs/mvp_plan.md`

Команды (общие):
```bash
npm test
npm run test:cov
npm run test:e2e
```

## Практические правила
- Тесты должны быть детерминированными и быстрыми.
- Не мокать Zod-схемы — валидируем реальные DTO/контракты.
- Для тестов с БД использовать отдельные тестовые базы/контейнеры.
