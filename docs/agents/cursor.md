# Cursor Agent — Guide (Implementation)

Этот гайд предназначен для AI-агента, который делает *реализацию* (код + тесты) в этом репозитории.

## Перед началом каждой задачи
1. Прочитай `AGENTS.md` и `.cursorrules`.
2. Прочитай `WARP.md` (если задача затрагивает архитектуру/инфраструктуру/интеграции).
3. Найди релевантные документы в `docs/index.md` и `docs/architecture/*`.
4. Найди существующие паттерны в коде (аналогичные handlers/controllers/mappers).

## Как работать с кодом

### 1) Определи owning-service и слой
- `presentation/` — HTTP/NATS/WebSocket входы
- `application/` — use-cases (CQRS handlers), ports
- `domain/` — сущности, доменные сервисы, инварианты
- `infrastructure/` — Prisma, интеграции, NATS/Redis адаптеры

### 2) Следуй обязательным паттернам
- **Ports**: только abstract classes (не interfaces) для NestJS DI.
- **DTO validation**: Zod (`createZodDto`) для HTTP DTO; для NATS — Zod schemas в `libs/lib-*`.
- **HTTP Controllers**: тонкие контроллеры + Swagger decorators + CQRS (CommandBus/QueryBus).
- **NATS**: subjects не хардкодить; использовать `libs/lib-*` publishers/subjects.

### 3) Финансовые значения, ID, currency/language
- `bigint` запрещён в прикладном коде (разрешён только в инфраструктуре и Prisma mapper’ах).
- Для точных значений — `BigNumber`/value objects.
- В DTO суммы/ID передавать строками.
- Currency/Language брать только из `@lib/shared/currency` и `@lib/shared/language`.

## Тесты
- Unit-тесты — доменная логика, handlers/use-cases, мапперы.
- Integration — Prisma repositories/HTTP pipeline (при необходимости с тестовой БД).
- Следуй соглашению имён: `*.unit.spec.ts`, `*.integration.spec.ts`.

## Проверки перед завершением
```bash
npm run lint
npm test
npm run build
```

Если правки затрагивают docker/infra/интеграции:
```bash
npm run docker:infra
npm run test:e2e
```

## Коммит/PR
- Используй Conventional Commits (см. `docs/guides/GIT_WORKFLOW.md`).
- Если коммит создан AI-агентом — добавь строку `Co-Authored-By` в сообщение коммита.
