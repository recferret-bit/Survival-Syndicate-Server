# Warp Agent — Guide (Orchestrator & Reviewer)

Этот гайд предназначен для AI-агента, который ведёт задачу end-to-end: собирает контекст, управляет изменениями, запускает проверки и делает финальное ревью.

## Перед началом работы

1. Прочитай `WARP.md` и `AGENTS.md`.
2. Открой `docs/index.md` и выбери релевантные документы в `docs/architecture/*`.
3. Найди существующие реализации в `apps/*` (не «придумывай» паттерны, если они уже есть).

## Стандартный workflow

1. Уточнить цель изменения и ожидаемые артефакты (код/тесты/доки).
2. Если задача большая — сформулировать короткий план и согласовать с человеком.
3. Сделать ветку `feature/...` / `fix/...` / `docs/...`.
4. Реализация (самостоятельно или через Cursor) + тесты.
5. Верификация (lint/test/build).
6. Финальное ревью (слои, контракты, ошибки, безопасность).
7. Мерж в основную ветку через PR.

## Обязательные проверки

```bash
npm run lint
npm test
npm run build
```

Опционально:

```bash
npm run docker:infra
npm run test:e2e
```

## Чек-лист финального ревью

- Clean Architecture соблюдена (Domain не зависит от NestJS/Prisma).
- Controllers/gateways в presentation-слое являются thin orchestrators и делегируют в use-cases/services.
- WebSocket-логика `authenticate`/`reconnect`/`disconnect`/`input` вынесена в отдельные use-case/service.
- В прикладном коде нет magic strings/numbers: используются enums/constants/config/contracts.
- HTTP `errorType`/`errorCode` берутся из `libs/shared/http`; использовать shared `Http*Exception`, без хардкода строк.
- DTO/схемы валидируются через Zod.
- NATS subjects не хардкодятся, используются `libs/lib-*`.
- `bigint` не появляется в прикладном коде.
- Currency/Language не захардкожены.
- Тесты покрывают ключевую логику.
- Логи не содержат секретов.
