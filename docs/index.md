# Survival Syndicate Server — Документация

## Гайды
- **[01_serverDevelopmentGuide.md](./01_serverDevelopmentGuide.md)** - Полный гайд по разработке сервера (22 части)

---

## Архитектура (`architecture/`)

| # | Документ | Описание |
|---|----------|----------|
| 01 | [01_network_optimizations.md](./architecture/01_network_optimizations.md) | Сетевые оптимизации (Delta, Interest Management) |
| 02 | [02_persistence_architecture.md](./architecture/02_persistence_architecture.md) | Архитектура персистентности (PostgreSQL, ClickHouse) |
| 03 | [03_analytics_and_events.md](./architecture/03_analytics_and_events.md) | Аналитика и события |
| 04 | [04_anti_cheat_and_validation.md](./architecture/04_anti_cheat_and_validation.md) | Anti-Cheat и валидация ввода |
| 05 | [05_anti_ddos_strategies.md](./architecture/05_anti_ddos_strategies.md) | Защита от DDoS |
| 06 | [06_payment_validation_service.md](./architecture/06_payment_validation_service.md) | Валидация покупок (IAP) |
| 07 | [07_server_monitoring_and_logging.md](./architecture/07_server_monitoring_and_logging.md) | Мониторинг и логирование |
| 08 | [08_database_schema.md](./architecture/08_database_schema.md) | Схема базы данных PostgreSQL |
| 09 | [09_building_service.md](./architecture/09_building_service.md) | Building Service — API зданий |
| 10 | [10_combat_progress_service.md](./architecture/10_combat_progress_service.md) | Combat Progress Service — боевая прогрессия |
| 11 | [11_player_service.md](./architecture/11_player_service.md) | Player Service — аккаунты + персонажи |
| 12 | [12_scheduler_service.md](./architecture/12_scheduler_service.md) | Scheduler Service — cron-задачи (Bull) |
| 13 | [13_api_reference.md](./architecture/13_api_reference.md) | **API Reference — полный список HTTP API** |
| 14 | [14_local_development_guide.md](./architecture/14_local_development_guide.md) | **Local Development Guide — Docker Compose + K8s** |
| 15 | [15_nats_best_practices.md](./architecture/15_nats_best_practices.md) | **NATS Best Practices — паттерны + JetStream в NestJS** |
| 16 | [16_project_structure.md](./architecture/16_project_structure.md) | **Project Structure — NestJS Monorepo Workspaces** |
| 17 | [17_auth_and_authorization.md](./architecture/17_auth_and_authorization.md) | **Auth & Authorization — JWT, Refresh, Guards** |
| 18 | [18_error_handling.md](./architecture/18_error_handling.md) | **Error Handling — RFC 7807 Problem Details** |
| 19 | [19_database_migrations.md](./architecture/19_database_migrations.md) | **Database Migrations — Prisma ORM** |
| 20 | [20_combat_gameplay_architecture.md](./architecture/20_combat_gameplay_architecture.md) | Архитектура боевого геймплея |
| 21 | [21_game_loop_best_practices.md](./architecture/21_game_loop_best_practices.md) | GameLoop — Best Practices (ECS, тики, детерминизм) |
| 22 | [22_service_contracts.md](./architecture/22_service_contracts.md) | Сервисные контракты (NATS) |
| 23 | [23_nats_gameplay_reporting_contract.md](./architecture/23_nats_gameplay_reporting_contract.md) | NATS: Gameplay → репортинг контракты |
| 24 | [24_nats_orchestrator_reporting_contract.md](./architecture/24_nats_orchestrator_reporting_contract.md) | NATS: Orchestrator → репортинг контракты |
| 25 | [25_api_and_websocket_contracts.md](./architecture/25_api_and_websocket_contracts.md) | **API & WebSocket контракты** |
| 26 | [26_websocket_json_protocol.md](./architecture/26_websocket_json_protocol.md) | **WebSocket JSON протокол — полные структуры** |
| 27 | [27_connection_handling.md](./architecture/27_connection_handling.md) | **Connection Handling — реконнект, grace period** |
| 28 | [28_gameplay_service_internals.md](./architecture/28_gameplay_service_internals.md) | Gameplay Service — ECS, GameLoop, интерфейсы (объединённый) |
| 29 | [29_match_history_system.md](./architecture/29_match_history_system.md) | Match History System |
| 30 | [30_game_initialization_flow.md](./architecture/30_game_initialization_flow.md) | Game Initialization Flow |
| 31 | [31_user_creation_flow.md](./architecture/31_user_creation_flow.md) | User Creation Flow |
| 32 | [32_lobby_and_match_lifecycle.md](./architecture/32_lobby_and_match_lifecycle.md) | Lobby & Match Lifecycle |

---

## Связанные репозитории
- **GDD:** https://github.com/recferret-bit/Survival-Syndicate-GDD
- **Client:** https://github.com/recferret-bit/Survival-Syndicate-Client
