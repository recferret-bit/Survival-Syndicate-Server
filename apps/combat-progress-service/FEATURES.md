# combat-progress-service

## Overview

Microservice for combat progression: player level (XP), Battle Pass, achievements, trophies, combat pool.

## Current (Phase 1 Template)

- Clean Architecture: domain, application, infrastructure, presentation
- Entities: PlayerProgress, BattlePass, Achievement (extend Entity<Props>)
- Ports: PlayerProgressPortRepository, BattlePassPortRepository, AchievementPortRepository (abstract classes)
- In-memory stub repositories
- Stub HTTP: GET /characters/:characterId/combat
- Stub NATS controller (placeholder)

## Future

- Prisma + Postgres_Meta
- Full REST API (level up, Battle Pass progression, achievements)
- NATS integration (player, gameplay)
- Trophy system, combat pool management

## Environment

| Variable                     | Default | Description     |
| ---------------------------- | ------- | --------------- |
| COMBAT_PROGRESS_APP_PORT     | 3008    | HTTP server     |
| COMBAT_PROGRESS_APP_HTTP_PREFIX | api/v1  | URL path prefix |
