# building-service

## Overview

Microservice for building and upgrade logic: construction, upgrades, unlocks, bonuses, passive income.

## Current (Phase 1 Template)

- Clean Architecture: domain, application, infrastructure, presentation
- Entities: BuildingEntity, UpgradeEntity (extend Entity<Props>)
- Ports: BuildingPortRepository, UpgradePortRepository (abstract classes)
- In-memory stub repositories
- Stub HTTP: GET /characters/:characterId/buildings
- Stub NATS controller (placeholder)

## Future

- Prisma + Postgres_Meta, Postgres_Catalog
- Full REST API (build, upgrade, effects, collect)
- NATS integration (wallet, character)
- BonusCalculator, UpgradeValidator, UnlockManager

## Environment

| Variable                 | Default | Description     |
| ------------------------ | ------- | --------------- |
| BUILDING_APP_PORT        | 3007    | HTTP server     |
| BUILDING_APP_HTTP_PREFIX | api/v1  | URL path prefix |
