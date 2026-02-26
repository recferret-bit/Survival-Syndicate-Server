# TASK-3.2: E2E: реконнект

## Статус: `NOT STARTED`

**Epic:** Epic 3: Интеграционное тестирование
**Ветка:** `test/e2e/reconnect-flow`
**Зависимости:** phase_1_11, phase_1_12

---

## Описание
E2E тест — реконнект:
1. Регистрация + аутентификация
2. Вход в матч
3. Разрыв соединения
4. Переподключение в течение Grace Period -> server.reconnect.success
5. Переподключение после Grace Period -> server.reconnect.error { code: GRACE_EXPIRED }

## Scope (затрагиваемые файлы/каталоги)
`test/e2e/`

## Ключевые документы архитектуры
docs/architecture/27_connection_handling.md, docs/mvp_plan.md (TASK-3.2)

---

## Definition of Ready (DoR)
- TASK-2.7 завершена (reconnect реализован)
- TASK-3.1 завершена (базовый E2E работает)

## Definition of Done (DoD)
- E2E тест: reconnect в пределах grace period -> success
- E2E тест: reconnect после grace period -> GRACE_EXPIRED
- Тесты запускаются через `npm run test:e2e`

---

## Тесты

**Unit-тесты (`*.unit.spec.ts`):**
Нет

**Integration-тесты (`*.integration.spec.ts`):**
E2E reconnect scenarios

---

## Лог прогресса

| Дата | Событие | Агент |
|------|---------|-------|
| — | Задача создана | System |
