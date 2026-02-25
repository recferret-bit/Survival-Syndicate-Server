# Cursor AI Rules Configuration

## File Structure

We use a **single `.cursorrules` file** at the project root for all Cursor AI rules.

### Why Single File?

✅ **Best Practice: One `.cursorrules` file at project root**

**Advantages:**
- **Single source of truth** - All rules in one place
- **Easier maintenance** - Update once, applies everywhere
- **No conflicts** - No rule merging or precedence issues
- **Version control** - Track changes in single file
- **Team consistency** - Everyone gets same rules
- **Cursor's design** - Reads `.cursorrules` from root by default

### File Location

```
survival-syndicate-server/
├── .cursorrules          ← Main rules file (THIS IS WHAT CURSOR READS)
├── WARP.md              ← Warp AI guidance (more detailed)
├── AGENTS.md            ← AI agent rules (concise)
└── .cursor/
    └── README.md        ← This file (documentation only)
```

## What's Included

The `.cursorrules` file contains comprehensive guidance for the Survival Syndicate game server:

### 1. Project Context
- Central vs Local Zone split (see `docs/mvp_plan.md`)
- Central Zone services: api-gateway, auth-service, matchmaking-service, player-service, building-service, combat-progress-service, scheduler-service, collector-service, payment-service, history-service
- Local Zone services: local-orchestrator, gameplay-service, websocket-service
- Tech stack: NestJS 11, TypeScript 5.7, Prisma 7, NATS, Redis, PostgreSQL 15, WebSocket, ClickHouse

### 2. Clean Architecture Enforcement
- Layer structure and dependencies
- Domain layer purity (no framework imports)
- Application ports as abstract classes
- CQRS pattern usage

### 3. Game Server Architecture
- GameLoop (30 FPS fixed tick rate)
- InputBuffer / StateBuffer for lag compensation
- Physics, Combat, AI, Spawn systems
- WebSocket + NATS communication

### 4. Path Aliases
- `@app/*` - Application services
- `@lib/*` - Shared libraries
- `@prisma/meta`, `@prisma/catalog` - Database clients

### 5. NATS Communication
- Never hardcode subjects
- Use library contracts (Publishers/Subjects)
- Publisher response validation with Zod

### 6. Database Architecture
- Two shared databases: Postgres_Meta + Postgres_Catalog
- Prisma ORM with migrations

### 7. Testing
- Test pyramid: 70% unit, 20% integration, 10% E2E
- Quality over quantity

## Updating Rules

When updating project rules:

1. **Primary source**: Update `WARP.md` (comprehensive documentation)
2. **Secondary**: Update `.cursorrules` (extract key points from WARP.md)
3. **Tertiary**: Update `AGENTS.md` (concise version)
4. Keep all files in sync for critical rules

## Rule Priority

If there's ever a conflict between files:
```
.cursorrules (Cursor reads this)
     ↓
  WARP.md (more detailed context)
     ↓
  AGENTS.md (concise version)
```

## Documentation References

For more detailed information, see:
- `WARP.md` - Complete project guidance
- `AGENTS.md` - Concise AI agent rules
- `docs/architecture/` - 37 architecture documents
- `docs/01_server_development_guide.md` - Full development guide
