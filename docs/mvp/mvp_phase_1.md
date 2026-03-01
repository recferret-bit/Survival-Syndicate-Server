# MVP Phase 1 — «Каркас» серверной архитектуры

## Цель
Проверить и отладить всю межсервисную коммуникацию (Auth → Player → Matchmaking → Orchestrator → Gameplay → WebSocket), без реализации сложной игровой логики (GameLoop).

**Ключевые инварианты:**
- Слот матча жёстко привязан к `playerId` с момента создания.
- После дисконнекта — резервирование слота на `GRACE_PERIOD` (60 сек).
- Чужой `playerId` не может занять чужой слот → `SLOT_NOT_AVAILABLE`.

## Навигация по задачам

Каждая задача — в отдельном каталоге `phase_1_X/`:
- `task.md` — описание, статус, DoR, DoD
- `prompts_prepare.md` — промпт подготовки
- `prompts_develop.md` — промпт разработки
- `prompts_review.md` — промпт ревью

---

## Реестр задач и прогресс

### Epic 1: Базовая инфраструктура

| # | ID | Задача | Статус | Зависимости | Каталог |
|---|-----|--------|--------|-------------|---------|
| 1 | TASK-1.1 | Monorepo-структура проекта | ✅ DONE | — | [phase_1_1](phase_1_1/task.md) |
| 2 | TASK-1.2 | Docker Compose | ✅ DONE | 1 | [phase_1_2](phase_1_2/task.md) |
| 3 | TASK-1.3 | Общая `libs` библиотека | ✅ DONE | 1 | [phase_1_3](phase_1_3/task.md) |
| 4 | TASK-1.4 | Скаффолдинг MVP-сервисов | ✅ DONE | 1, 3 | [phase_1_4](phase_1_4/task.md) |

### Epic 2: Реализация сервисов

| # | ID | Задача | Статус | Зависимости | Каталог |
|---|-----|--------|--------|-------------|---------|
| 5 | TASK-2.1 | Auth Service | ✅ DONE | 4 | [phase_1_5](phase_1_5/task.md) |
| 6 | TASK-2.2 | Player Service | ✅ DONE | 4, 5 | [phase_1_6](phase_1_6/task.md) |
| 7 | TASK-2.3 | Matchmaking Service | ✅ DONE | 4, 5 | [phase_1_7](phase_1_7/task.md) |
| 8 | TASK-2.4 | Local Orchestrator | ✅ DONE | 4, 7 | [phase_1_8](phase_1_8/task.md) |
| 9 | TASK-2.5 | Gameplay Service | ✅ DONE | 4, 8 | [phase_1_9](phase_1_9/task.md) |
| 10 | TASK-2.6 | WebSocket Service — connect | 🔄 PREPARING | 4, 8 | [phase_1_10](phase_1_10/task.md) |
| 11 | TASK-2.7 | WebSocket Service — reconnect | 🔲 NOT STARTED | 10 | [phase_1_11](phase_1_11/task.md) |

### Epic 3: Интеграционное тестирование

| # | ID | Задача | Статус | Зависимости | Каталог |
|---|-----|--------|--------|-------------|---------|
| 12 | TASK-3.1 | E2E: базовый флоу | 🔲 NOT STARTED | 5,6,7,8,9,10 | [phase_1_12](phase_1_12/task.md) |
| 13 | TASK-3.2 | E2E: реконнект | 🔲 NOT STARTED | 11, 12 | [phase_1_13](phase_1_13/task.md) |
| 14 | TASK-3.3 | E2E: защита слота | 🔲 NOT STARTED | 11, 12 | [phase_1_14](phase_1_14/task.md) |

### Epic 4: Пустые шаблоны non-MVP сервисов

| # | ID | Задача | Статус | Зависимости | Каталог |
|---|-----|--------|--------|-------------|---------|
| 15 | TASK-4.1 | swagger-aggregator (шаблон) | 🔲 NOT STARTED | 1, 3 | [phase_1_15](phase_1_15/task.md) |
| 16 | TASK-4.2 | building-service (шаблон) | 🔲 NOT STARTED | 1, 3 | [phase_1_16](phase_1_16/task.md) |
| 17 | TASK-4.3 | combat-progress-service (шаблон) | 🔲 NOT STARTED | 1, 3 | [phase_1_17](phase_1_17/task.md) |
| 18 | TASK-4.4 | scheduler-service (шаблон) | 🔲 NOT STARTED | 1, 3 | [phase_1_18](phase_1_18/task.md) |
| 19 | TASK-4.5 | collector-service (шаблон) | 🔲 NOT STARTED | 1, 3 | [phase_1_19](phase_1_19/task.md) |
| 20 | TASK-4.6 | payment-service (шаблон) | 🔲 NOT STARTED | 1, 3 | [phase_1_20](phase_1_20/task.md) |
| 21 | TASK-4.7 | history-service (шаблон) | 🔲 NOT STARTED | 1, 3 | [phase_1_21](phase_1_21/task.md) |

---

## Легенда статусов

- 🔲 NOT STARTED — не начата
- 🔄 PREPARING — подготовка (ветка создана, DoR проверено)
- 🛠️ IN PROGRESS — в разработке
- 👁️ IN REVIEW — на ревью
- ✅ DONE — завершена
- ❌ BLOCKED — заблокирована

## Рекомендуемый порядок выполнения

**Волна 1 (инфраструктура):** 1 → 2 → 3 → 4
**Волна 2 (параллельно: шаблоны):** 15–21 (можно параллельно с волной 3)
**Волна 3 (сервисы):** 5 → 6 || 7 → 8 → 9 || 10 → 11
**Волна 4 (E2E):** 12 → 13 || 14

## Ссылки на документацию

- [MVP Plan (исходный)](../mvp_plan.md)
- [Project Structure](../architecture/16_project_structure.md)
- [Auth & Authorization](../architecture/17_auth_and_authorization.md)
- [Error Handling](../architecture/18_error_handling.md)
- [NATS Best Practices](../architecture/15_nats_best_practices.md)
- [Service Contracts](../architecture/22_service_contracts.md)
- [WebSocket Protocol](../architecture/26_websocket_json_protocol.md)
- [Connection Handling](../architecture/27_connection_handling.md)
- [Lobby & Match Lifecycle](../architecture/32_lobby_and_match_lifecycle.md)
- [Game Init Flow](../architecture/30_game_initialization_flow.md)
- [GIT Workflow](../guides/GIT_WORKFLOW.md)
- [Code Quality](../guides/CODE_QUALITY.md)
- [Testing Pyramid](../guides/TESTING_PYRAMID.md)
- [Agents Guide](../agents/agents.md)
- [Cursor Guide](../agents/cursor.md)
- [Warp Guide](../agents/warp.md)
