# Shared Libraries

## libs/shared

Common utilities and infrastructure used across all apps.

- **Auth** — JWT strategy, guards (AuthJwtGuard), UserSession
- **NATS** — Client module, stream config, registerNonDurablePattern
- **Redis** — Cache, distributed locking
- **Health** — Health check endpoints (Terminus)
- **Metrics** — Prometheus metrics
- **Env** — EnvService, environment schema (Zod validation)
- **Decorators** — Common decorators
- **Filters** — Exception filters (RFC 7807)
- **Interceptors** — Logging, timeout interceptors
- **Pipes** — Validation pipes
- **Utils** — Common utility functions

## libs/lib-player

Player service NATS contracts.

- **PlayerPublisher** — getCharacter, createCharacter, getUser, updateUser
- **PlayerSubjects** — GET_CHARACTER, CREATE_CHARACTER, GET_USER, UPDATE_USER
- **Schemas** — Request/response Zod schemas

## libs/lib-building

Building service NATS contracts.

- **BuildingPublisher** — getBuildings, upgradeBuilding, collectIncome, getBonuses
- **BuildingSubjects** — GET_BUILDINGS, UPGRADE, COLLECT_INCOME, GET_BONUSES
- **Events** — building.event.built, building.event.upgraded, building.event.content_unlocked
- **Schemas** — Request/response Zod schemas

## libs/lib-game-server

Game server NATS contracts.

- **GameServerPublisher** — startSimulation, getServerStatus
- **GameServerSubjects** — START_SIMULATION, SERVER_STATUS, WORLD_STATE
- **Events** — gameplay.start_simulation, gameplay.world_state.{matchId}
- **Schemas** — Request/response Zod schemas

## libs/lib-combat-progress

Combat progress service NATS contracts.

- **CombatProgressPublisher** — addXP, getCombatProfile, getPool, checkAchievements
- **CombatProgressSubjects** — ADD_XP, GET_PROFILE, GET_POOL, CHECK_ACHIEVEMENTS
- **Events** — combat.event.level_up, combat.event.achievement_completed
- **Schemas** — Request/response Zod schemas

## libs/lib-analytics

Analytics service NATS contracts.

- **AnalyticsPublisher** — publishEvent, publishBatchEvents
- **AnalyticsSubjects** — PUBLISH_EVENT, PUBLISH_BATCH
- **Event types** — match_start, match_end, player_death, currency_earned, building_upgrade, iap_purchase
- **Schemas** — Request/response Zod schemas
