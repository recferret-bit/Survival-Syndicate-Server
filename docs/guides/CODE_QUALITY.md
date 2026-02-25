# Code Quality — Survival Syndicate Server

## Обязательные инструменты

### 1) ESLint
```bash
npm run lint
npm run lint:fix
```

Правило: перед PR — **0 ошибок**. Предупреждения допускаются только если уже приняты в проекте и обоснованы.

### 2) Prettier
```bash
npm run format
```

### 3) Тесты
```bash
npm test
npm run test:cov
```

### 4) Сборка (как type-check + compile)
```bash
npm run build
```

## Ненарушаемые правила кода

### Clean Architecture
- Domain без NestJS/Prisma.
- Ports — abstract classes.
- Use-case handlers — тонкие (< 50 строк), оркестрация без «доменных» правил.

### Валидация (Zod)
- HTTP DTO: `createZodDto` + Zod schema.
- NATS request/response: Zod schemas в `libs/lib-*`.

### NATS subjects
- Запрещено хардкодить subject строки.
- Используем `Subjects`/`Publishers` из `libs/lib-*`.

### BigNumber / bigint
- **Запрещено использовать `bigint` в прикладном коде.**
- `bigint` разрешён только:
  - в инфраструктуре
  - в Prisma mapper’ах при маппинге `BIGINT`
- Денежные значения / точные числа: `BigNumber` и value objects.
- В DTO (HTTP/NATS) суммы и идентификаторы передаём строками.

Подробно: `docs/BIGNUMBER_BEST_PRACTICE.md`.

### Currency / Language
- Запрещено хардкодить строки/enum/константы для валют и языков.
- Используем `@lib/shared/currency` и `@lib/shared/language`.

### Логи и безопасность
- Не логировать токены, пароли, секреты, персональные данные.
- Ошибки наружу — через единый формат (см. `docs/architecture/18_error_handling.md`).

## Минимальный pre-push набор
```bash
npm run format
npm run lint
npm test
npm run build
```
