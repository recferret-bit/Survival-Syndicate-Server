# AI Agents — Survival Syndicate Server

Этот каталог описывает, как AI-агенты (Warp, Cursor и т.п.) должны работать в этом репозитории.

## Источник правды
Всегда начинайте с чтения:
1. `WARP.md` — расширенный контекст (архитектура, паттерны, команды)
2. `AGENTS.md` — краткие обязательные правила
3. `.cursorrules` — правила для Cursor (подмножество)
4. `docs/index.md` + `docs/architecture/*` + `docs/01_server_development_guide.md` + `docs/mvp_plan.md`

Если документация конфликтует с кодом, приоритет:
- правила/гайдлайны (`AGENTS.md`, `.cursorrules`) → затем
- существующие реализации в `apps/*` и `libs/*`.

## Роли
- **Orchestrator (Warp):** собирает контекст, предлагает/фиксирует план, запускает проверки, делает финальное ревью.
- **Implementer (Cursor/другой агент):** делает точечные правки кода/тестов, следуя паттернам репозитория.
- **Human:** принимает решения по спорным вопросам и утверждает изменения.

## Стандартный цикл работы
1. Определить owning-service и слой (presentation/application/domain/infrastructure).
2. Прочитать релевантные документы из `docs/architecture/`.
3. Внести минимальные изменения, консистентные с текущими паттернами.
4. Добавить/обновить тесты.
5. Прогнать проверки.
6. Если меняются интеграции/контракты — обновить `libs/lib-*` (subjects/publishers/schemas).
7. Подготовить PR с понятным описанием.

## Ненарушаемые правила проекта (кратко)
- **Clean Architecture:** Domain без NestJS/Prisma; ports = abstract classes; handlers тонкие.
- **DTO/схемы:** валидация через Zod (`@anatine/zod-nestjs` / `createZodDto`) + Swagger аннотации.
- **NATS:** никогда не хардкодить subjects; использовать контракты из `libs/lib-*` и Zod schemas.
- **Деньги/ID:**
  - `bigint` запрещён в прикладном коде (разрешён только в инфраструктуре и Prisma mapper’ах).
  - для точных значений используем `BigNumber`/value objects.
  - в HTTP/NATS DTO суммы и идентификаторы передаём строками.
- **Currency/Language:** запрещены строки/enum/константы «вручную» — используем `@lib/shared/currency` и `@lib/shared/language`.
- **Логи:** не логировать секреты/токены/персональные данные.

## Команды перед PR
```bash
npm run lint
npm test
npm run build
```

Опционально (для интеграционных изменений):
```bash
npm run docker:infra
npm run test:e2e
```
