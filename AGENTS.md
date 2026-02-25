# AGENTS.md

This file provides guidance to AI agents (Cursor, Warp) when working with code in this repository.

## Project Overview

Survival Syndicate — online multiplayer survival game server. NestJS monorepo with 8 microservices communicating via NATS. The server is the authoritative source of truth for all game state, running deterministic simulations at a fixed tick rate.

**Services:** `api-gateway`, `auth-service`, `player-service`, `building-service`, `combat-progress-service`, `scheduler-service`, `game-server`, `analytics-service`

**Tech Stack:** NestJS 11, TypeScript 5.7, Prisma 7, NATS, Redis, PostgreSQL 15, WebSocket, ClickHouse (analytics)

## Per-App and Libs Documentation

Before modifying an app, read its feature documentation for context:
- `apps/{service}/FEATURES.md` — All features and capabilities of that app
- `libs/LIBS.md` — All shared libraries and their purposes
- `docs/architecture/` — 32 architecture documents covering all aspects

## Essential Commands

### Development
```bash
# Start specific service in watch/debug mode
npm run start:player-service:debug
npm run start:building-service:debug
npm run start:game-server:debug

# Start all services locally
npm run start:local

# Build all services
npm run build

# Lint (MANDATORY before completing any change)
npm run lint
npm run lint:fix
```

### Database Management
```bash
# Generate Prisma clients (after schema changes)
npm run prisma:generate

# Run migrations (development)
npm run prisma:migrate:dev

# Run migrations (deploy)
npm run prisma:migrate:deploy

# Prisma Studio (inspect data)
npm run prisma:studio:meta
npm run prisma:studio:catalog
```

### Testing
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Infrastructure (Docker Compose)
```bash
# Start all infrastructure (PostgreSQL, NATS, Redis)
npm run docker:infra

# Full stack
npm run docker:full
```

## Architecture Fundamentals

### Clean Architecture Layers (Strict Dependency Direction)

```
Presentation → Application → Domain → Infrastructure
```

**Directory Structure in Each Service:**
```
apps/{service}/src/
├── domain/              # Pure business logic, ZERO framework imports
│   ├── entities/        # Business entities with identity
│   └── services/        # Domain services (optional)
├── application/         # Orchestration layer
│   ├── use-cases/       # CQRS command/query handlers
│   └── ports/           # Abstract classes (NOT interfaces) for DI
├── infrastructure/      # Technical implementations
│   ├── prisma/
│   │   ├── mapper/      # Entity ↔ Prisma conversions
│   │   └── repositories/ # Repository implementations
│   └── external/        # Third-party integrations
└── presentation/        # Entry points
    ├── http/            # HTTP controllers + DTOs
    └── nats/            # NATS message handlers
```

**Critical Rules:**
- Domain layer: NO NestJS imports, NO Prisma, NO framework dependencies
- Application ports: MUST be abstract classes (not interfaces) for NestJS DI
- Business logic: ONLY in domain entities/services
- Handlers: Thin orchestrators (<50 lines)

### Game Server Architecture

The `game-server` service runs real-time gameplay simulations:

- **GameLoop**: Fixed tick rate (30 FPS), deterministic
- **InputBuffer**: `Map<playerId, RingBuffer<PlayerInput>>` — last N inputs per player
- **StateBuffer**: `RingBuffer<WorldState>` — last N states for lag compensation
- **PhysicsSystem**: Movement, collisions
- **LagCompensationSystem**: Rewinds world state for hit detection
- **CombatSystem**: Authoritative weapon fire, ammo, damage
- **AISystem / SpawnSystem**: Enemy behavior and wave spawning

**Communication:**
- WebSocket: `PlayerInput` → Server → `WorldState`
- NATS: `gameplay.start_simulation`, `gameplay.world_state.{matchId}`

### Path Aliases
```typescript
// Applications
@app/api-gateway/*
@app/auth-service/*
@app/player-service/*
@app/building-service/*
@app/combat-progress-service/*
@app/scheduler-service/*
@app/game-server/*
@app/analytics-service/*

// Libraries
@lib/shared/*
@lib/lib-player/*
@lib/lib-building/*
@lib/lib-game-server/*
@lib/lib-combat-progress/*
@lib/lib-analytics/*

// Prisma clients
@prisma/meta
@prisma/catalog
```

### Inter-Service Communication

**NEVER hardcode NATS subjects. ALWAYS use library contracts:**

```typescript
// ✅ CORRECT: Import from library
import { PlayerPublisher } from '@lib/lib-player';
const response = await playerPublisher.getCharacter(request);

// ❌ WRONG: Hardcoded subject
natsClient.send('player.get-character.v1', data);
```

**Communication Libraries:**
- `@lib/lib-player` — PlayerPublisher, PlayerSubjects
- `@lib/lib-building` — BuildingPublisher, BuildingSubjects
- `@lib/lib-game-server` — GameServerPublisher, GameServerSubjects
- `@lib/lib-combat-progress` — CombatProgressPublisher, CombatProgressSubjects
- `@lib/lib-analytics` — AnalyticsPublisher, AnalyticsSubjects

### Database Architecture

Two shared PostgreSQL databases (not per-service):
- **Postgres_Meta** — Player data, buildings, trophies, achievements, wallet
- **Postgres_Catalog** — Static game config (building levels, weapon stats, enemy types)

## Development Workflow

**Adding New Feature:**
1. Identify owning service
2. Domain entities/value objects (domain layer)
3. Application ports as abstract classes (application/ports)
4. Use case handlers (application/use-cases)
5. Infrastructure implementations (infrastructure layer)
6. HTTP/NATS controllers (presentation layer)
7. Update library contracts if inter-service communication
8. Write tests (unit → integration → E2E)
9. **MANDATORY:** Run `npm run lint` before completing ANY change

**Modifying Database Schema:**
1. Update `prisma/meta/schema.prisma` or `prisma/catalog/schema.prisma`
2. Run: `npm run prisma:migrate:dev`
3. Regenerate: `npm run prisma:generate`
4. Update mappers in `infrastructure/prisma/mapper/`
5. **MANDATORY:** Run `npm run lint`

## Critical Rules — Never Violate

**DO NOT:**
- Put business logic in application/infrastructure layers
- Use Prisma directly from handlers (use repositories via ports)
- Hardcode NATS subjects (use library contracts)
- Define ports as interfaces (use abstract classes for NestJS DI)
- Import framework code in domain layer
- Skip running `npm run lint` after code changes

**DO:**
- Keep handlers thin (<50 lines)
- Use CQRS pattern (Commands for writes, Queries for reads)
- Use path aliases (@app/*, @lib/*, @prisma/*)
- Follow test pyramid (70% unit, 20% integration, 10% E2E)
- Run `npm run lint` after EVERY code change

## Documentation References

- Architecture docs: `docs/architecture/` (32 documents)
- Server development guide: `docs/01_server_development_guide.md`
- Game loop: `docs/architecture/21_game_loop_best_practices.md`
- Service contracts: `docs/architecture/22_service_contracts.md`
- NATS best practices: `docs/architecture/15_nats_best_practices.md`
- Database schema: `docs/architecture/08_database_schema.md`
- WebSocket contracts: `docs/architecture/25_api_and_websocket_contracts.md`
- Gameplay internals: `docs/architecture/28_gameplay_service_internals.md`
