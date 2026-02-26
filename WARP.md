# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Survival Syndicate — an online multiplayer survival game server built as a NestJS monorepo (workspaces). The server is the **absolute source of truth** for all game state. It runs deterministic game simulations at a fixed tick rate, handles real-time WebSocket communication, and manages meta-game progression (buildings, combat progress, player accounts).

## Microservices Architecture

### Central Zone (Global Scope)
Services that do not require ultra-low latency and operate at global scope.
- `swagger-aggregator` — агрегирует OpenAPI-спецификации со всех сервисов, предоставляет единую Swagger UI
- `auth-service` — JWT issuance/auth
- `matchmaking-service` — selects a Zone and returns `websocketUrl`
- `player-service` — player meta/progression
- `building-service` — meta buildings/upgrades
- `combat-progress-service` — meta combat progression
- `scheduler-service` — cron/jobs
- `collector-service` — analytics/events ingestion (ClickHouse)
- `payment-service` — IAP validation
- `history-service` — match history / replays storage pipeline

### Local Zone (Zone Scope)
Services running close to players; responsible for real-time gameplay.
- `local-orchestrator` — manages a Zone and its capacity/placement decisions (see `docs/mvp_plan.md`)
- `gameplay-service` — runs match simulations (see `docs/architecture/33_gameplay_service_internals.md`)
- `websocket-service` — WebSocket entry point for the Zone (see `docs/architecture/30_api_and_websocket_contracts.md`)

Naming note: legacy docs/code may mention `game-server` and `analytics-service`; in the Central/Zone model the real-time stack is split into `websocket-service` + `gameplay-service`, and analytics ingestion is `collector-service`.

**Communication:**
- Inter-service: NATS for request-reply and pub/sub
- Client → Game Server: WebSocket (binary/JSON)
- Client → Meta Services: HTTP REST напрямую к каждому сервису (каждый имеет собственный HTTP-контроллер)
- Databases: PostgreSQL (Postgres_Meta for player data, Postgres_Catalog for static game config)

## Per-App and Libs Documentation

Before modifying an app, read its feature documentation for context:
- `apps/{service}/FEATURES.md` — All features and capabilities of that app
- `libs/LIBS.md` — All shared libraries and their purposes
- `docs/` — Complete architecture documentation (32 documents)

## Commands

### Development

```bash
# Start specific service in watch mode
npm run start:swagger-aggregator:dev
npm run start:auth-service:dev
npm run start:player-service:dev
npm run start:building-service:dev
npm run start:combat-progress-service:dev
npm run start:scheduler-service:dev
npm run start:game-server:dev
npm run start:analytics-service:dev

# Start all services locally
npm run start:local

# Build all services
npm run build
npm run build:all

# Format code
npm run format

# Lint (MANDATORY before completing any change)
npm run lint
npm run lint:fix
```

### Infrastructure

```bash
# Start all infrastructure (PostgreSQL, NATS, Redis)
npm run docker:infra

# Stop infrastructure
npm run docker:infra:down

# Full stack with Docker
npm run docker:full
```

### Database Management

**Two shared databases (Meta + Catalog):**

```bash
# Generate Prisma clients
npm run prisma:generate

# Run migrations (development)
npm run prisma:migrate:dev

# Run migrations (deploy)
npm run prisma:migrate:deploy

# Prisma Studio
npm run prisma:studio:meta
npm run prisma:studio:catalog

# Reset and seed
npm run prisma:reset
npm run prisma:seed
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

## Architecture

### Clean Architecture Layers

All services follow Clean Architecture with four layers:

```
Presentation (Outermost)
  ↓ depends on
Application (Use Cases)
  ↓ depends on
Domain (Business Logic)
  ↓ depends on
Infrastructure (Database, External APIs)
```

**Directory Structure in Each Service:**

```
apps/{service}/src/
├── domain/              # Pure business logic, zero framework dependencies
│   ├── entities/        # Business entities with identity
│   └── services/        # Domain services (optional)
├── application/         # Orchestration layer
│   ├── use-cases/       # CQRS command/query handlers
│   └── ports/           # Abstract classes for infrastructure (not interfaces)
├── infrastructure/      # Technical implementations
│   ├── prisma/          # Database access layer
│   │   ├── mapper/      # Entity ↔ Prisma conversions
│   │   └── repositories/ # Repository implementations
│   └── external/        # Third-party integrations
└── presentation/        # Entry points
    ├── http/            # HTTP controllers + DTOs
    └── nats/            # NATS message handlers
```

**Key Rules:**
- Domain layer has NO framework imports, NO infrastructure knowledge
- Application ports MUST be abstract classes (not interfaces) for NestJS DI
- Business logic lives in domain entities/services only
- Handlers are thin orchestrators (<50 lines)
- Use CQRS pattern: Commands for writes, Queries for reads

### Game Server Architecture

The `game-server` service is unique — it runs real-time gameplay simulations:

- **GameLoop**: Fixed tick rate (30 FPS), deterministic simulation
- **InputBuffer**: `Map<playerId, RingBuffer<PlayerInput>>` — stores last N inputs per player
- **StateBuffer**: `RingBuffer<WorldState>` — stores last N world states for lag compensation
- **PhysicsSystem**: Deterministic physics (movement, collisions)
- **LagCompensationSystem**: "Rewinds" world state using StateBuffer for hit detection
- **CombatSystem**: Authoritative weapon fire, ammo management, damage calculation
- **AISystem**: Enemy behavior
- **SpawnSystem**: Wave-based enemy spawning

**Game Server communicates via:**
- WebSocket: Receives `PlayerInput`, sends `WorldState`
- NATS: Receives `gameplay.start_simulation`, publishes `gameplay.world_state.{matchId}`

### Inter-Service Communication

**NEVER hardcode NATS subjects.** Always use library contracts:

```typescript
// ✅ CORRECT: Import from library
import { PlayerPublisher } from '@lib/lib-player';
const response = await playerPublisher.getCharacter(request);

// ❌ WRONG: Hardcoded subject
natsClient.send('player.get-character.v1', data);
```

**Communication Libraries:**
- `@lib/lib-player` — Player service contracts
- `@lib/lib-building` — Building service contracts
- `@lib/lib-game-server` — Game server contracts
- `@lib/lib-combat-progress` — Combat progress contracts
- `@lib/lib-analytics` — Analytics service contracts

**Shared Library:**
- `@lib/shared` — Common utilities (auth guards, health checks, Redis, NATS client, env config)

### Database Architecture

Two shared PostgreSQL databases:
- **Postgres_Meta** — Player data, buildings, trophies, achievements, wallet
- **Postgres_Catalog** — Static game config (building levels, weapon stats, enemy types)

**Prisma Clients:**
- `@prisma/meta` — Meta database Prisma client
- `@prisma/catalog` — Catalog database Prisma client

### TypeScript Path Aliases

```typescript
// Applications
@app/swagger-aggregator/*
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

// Prisma
@prisma/meta
@prisma/catalog
```

## Development Workflow

**Adding New Feature:**

1. Identify which service owns the feature
2. Define domain entities/value objects (domain layer)
3. Create application ports as abstract classes (application/ports)
4. Implement use case handlers (application/use-cases)
5. Add infrastructure implementations (infrastructure layer)
6. Create HTTP/NATS controllers (presentation layer)
7. If adding inter-service communication, update library contracts
8. Write tests following the pyramid (unit → integration → E2E)
9. **MANDATORY:** Run `npm run lint` before completing any change

**Modifying Database Schema:**

1. Update Prisma schema: `prisma/meta/schema.prisma` or `prisma/catalog/schema.prisma`
2. Create migration: `npm run prisma:migrate:dev`
3. Regenerate client: `npm run prisma:generate`
4. Update mappers in `infrastructure/prisma/mapper/`
5. **MANDATORY:** Run `npm run lint`

## Common Pitfalls

- **DO NOT** put business logic in application or infrastructure layers
- **DO NOT** use Prisma directly from handlers — use repositories via ports
- **DO NOT** hardcode NATS subjects — always use library contracts
- **DO NOT** define ports as interfaces — use abstract classes for NestJS DI
- **DO NOT** import framework code in domain layer
- **DO NOT** skip running `npm run lint` after code changes

## Documentation References

- Architecture docs: `docs/architecture/` (32 documents covering all aspects)
- Server development guide: `docs/01_server_development_guide.md`
- Game loop best practices: `docs/architecture/21_game_loop_best_practices.md`
- Service contracts: `docs/architecture/22_service_contracts.md`
- Gameplay internals: `docs/architecture/28_gameplay_service_internals.md`
- NATS best practices: `docs/architecture/15_nats_best_practices.md`
- WebSocket contracts: `docs/architecture/25_api_and_websocket_contracts.md`
- Connection handling: `docs/architecture/27_connection_handling.md`
