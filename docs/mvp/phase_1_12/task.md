# TASK-3.1: E2E: базовый флоу

## Статус: `NOT STARTED`

**Epic:** Epic 3: Интеграционное тестирование
**Ветка:** `phase_1_12/test/e2e/basic-flow`
**Зависимости:** phase_1_5, phase_1_6, phase_1_7, phase_1_8, phase_1_9, phase_1_10

---

## Описание
E2E тест — полный базовый флоу:
1. Регистрация пользователя (POST /auth/register)
2. Получение JWT
3. Создание лобби или solo join
4. WebSocket подключение + authenticate
5. Эхо (отправка input -> получение state)
6. Disconnect

## Scope (затрагиваемые файлы/каталоги)
`test/e2e/`

## Ключевые документы архитектуры
docs/mvp_plan.md (TASK-3.1)

---

## Definition of Ready (DoR)
- Все сервисы Epic 2 реализованы
- Docker infra запущена
- Все сервисы запущены локально или в Docker

## Definition of Done (DoD)
- E2E тест проходит: register -> JWT -> matchmaking -> WS connect -> echo -> disconnect
- Тест запускается через `npm run test:e2e`
- Все промежуточные шаги верифицированы (HTTP статусы, WS сообщения)

---

## Тесты

**Unit-тесты (`*.unit.spec.ts`):**
Нет

**Integration-тесты (`*.integration.spec.ts`):**
Полный E2E тест

---

## Лог прогресса

| Дата | Событие | Агент |
|------|---------|-------|
| — | Задача создана | System |
