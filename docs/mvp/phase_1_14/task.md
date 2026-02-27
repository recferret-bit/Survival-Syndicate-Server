# TASK-3.3: E2E: защита слота

## Статус: `NOT STARTED`

**Epic:** Epic 3: Интеграционное тестирование
**Ветка:** `phase_1_14/test/e2e/slot-protection`
**Зависимости:** phase_1_11, phase_1_12

---

## Описание
E2E тест — защита слота:
1. Создать матч на двух игроков (A и B)
2. Игрок A разрывает соединение
3. Игрок C пытается реконнектнуться в слот A -> SLOT_NOT_AVAILABLE
4. Игрок A реконнектится с правильным JWT -> успех

## Scope (затрагиваемые файлы/каталоги)
`test/e2e/`

## Ключевые документы архитектуры
docs/architecture/27_connection_handling.md, docs/mvp_plan.md (TASK-3.3)

---

## Definition of Ready (DoR)
- TASK-2.7 завершена (reconnect с проверкой слотов)
- TASK-3.1 завершена (базовый E2E работает)

## Definition of Done (DoD)
- E2E тест: чужой playerId -> SLOT_NOT_AVAILABLE
- E2E тест: правильный playerId -> reconnect success
- Тесты запускаются через `npm run test:e2e`

---

## Тесты

**Unit-тесты (`*.unit.spec.ts`):**
Нет

**Integration-тесты (`*.integration.spec.ts`):**
E2E slot protection scenarios

---

## Лог прогресса

| Дата | Событие | Агент |
|------|---------|-------|
| — | Задача создана | System |
