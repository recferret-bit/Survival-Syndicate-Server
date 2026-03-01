# Интеграционные тесты

Интеграционные тесты используют реальные PostgreSQL и NATS. Для запуска нужна подготовленная среда.

## Быстрый старт

```bash
# 1. Запустить инфраструктуру (PostgreSQL, NATS, Redis)
npm run docker:infra

# 2. Создать тестовые БД и применить миграции
npm run test:integration:setup

# 3. Запустить интеграционные тесты
npm run test:integration
```

## Пошаговая настройка

### 1. Инфраструктура

```bash
npm run docker:infra
```

Поднимает PostgreSQL (порт 5432), NATS (4222), Redis (6379).

### 2. Тестовые базы данных

Тесты ожидают БД `users_test` и `balance_test` на localhost:5432.

**Создание БД (если ещё не созданы):**
```bash
node scripts/create-test-databases.mjs
# или вручную (требует psql):
psql "postgresql://postgres:postgres@localhost:5432/postgres" -c "CREATE DATABASE users_test;"
psql "postgresql://postgres:postgres@localhost:5432/postgres" -c "CREATE DATABASE balance_test;"
```

### 3. Миграции для тестовых БД

При `NODE_ENV=local` Jest и приложение используют `TEST_DIRECT_*` URL. Миграции тоже:

```bash
NODE_ENV=local \
  TEST_DIRECT_USERS_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/users_test" \
  TEST_DIRECT_BALANCE_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/balance_test" \
  npm run prisma:migrate:deploy
```

Скрипт `test:integration:setup` выполняет это автоматически.

### 4. Запуск тестов

```bash
npm run test:integration
```

`jest.setup.ts` задаёт `NODE_ENV=local` и `TEST_DIRECT_*` URL по умолчанию (localhost:5432).

## Переменные окружения

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `NODE_ENV` | `local` (в Jest) | При `local` используются тестовые БД |
| `TEST_DIRECT_USERS_DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/users_test` | БД users для тестов |
| `TEST_DIRECT_BALANCE_DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/balance_test` | БД balance для тестов |
| `NATS_SERVERS` | `nats://localhost:4222` | NATS для тестов balance/player |
| `REDIS_URL` | `redis://localhost:6379` | Redis |

## Какие тесты требуют БД

- `users.http.controller.integration.spec.ts` — users_test
- `user-balance.prisma.repository.integration.spec.ts` — balance_test
- `balance.nats.controller.integration.spec.ts` — balance_test, NATS
- `balance-admin.http.controller.integration.spec.ts` — balance_test
- и др. `*.integration.spec.ts` с Prisma

## Тесты без БД

Следующие интеграционные тесты **не требуют** БД и проходят без подготовки:

- `local-orchestrator.nats.controller.integration.spec.ts`
- `gameplay.nats.controller.integration.spec.ts`
- `ws.gateway.unit.spec.ts` (pipeline-тесты в unit)

## Устранение ошибок

**`Database users_test does not exist`**
- Запустите `npm run test:integration:setup`
- Либо создайте БД вручную (см. шаг 2)

**`connect ECONNREFUSED 127.0.0.1:5432`**
- Запустите `npm run docker:infra`
- Убедитесь, что PostgreSQL слушает порт 5432

**`connect ECONNREFUSED 127.0.0.1:4222`** / **NatsError: TIMEOUT**
- NATS не запущен или request-reply не отвечает. Запустите `npm run docker:infra`
- Тесты `balance.nats.controller.integration.spec.ts` при недоступности NATS **пропускаются** (не падают): проверяется TCP до порта 4222 и пробный request-reply; при таймауте тесты, требующие NATS, завершаются без ошибки
