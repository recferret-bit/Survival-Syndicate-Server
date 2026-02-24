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
casino-project/
├── .cursorrules          ← Main rules file (THIS IS WHAT CURSOR READS)
├── WARP.md              ← Warp AI guidance (more detailed)
└── .cursor/
    └── README.md        ← This file (documentation only)
```

## What's Included

The `.cursorrules` file contains comprehensive guidance from `WARP.md`:

### 1. Project Context
- Microservices architecture overview
- Service ports and responsibilities
- Tech stack (NestJS, Prisma, NATS, Redis, PostgreSQL)

### 2. Clean Architecture Enforcement
- Layer structure and dependencies
- Domain layer purity (no framework imports)
- Application ports as abstract classes
- CQRS pattern usage

### 3. Path Aliases
- `@app/*` - Application services
- `@lib/*` - Shared libraries
- `@prisma/*` - Database clients

### 4. NATS Communication
- Never hardcode subjects
- Use library contracts (Publishers/Subjects)
- Request-Reply vs Pub/Sub patterns

### 5. Database Per Service
- Each service owns its database
- Never cross-access databases
- Use NATS for inter-service data

### 6. BigNumber vs BigInt (CRITICAL)
- Domain/application: Always `BigNumber`
- DTOs: Always `string` for IDs/amounts
- Prisma mappers: Use utility functions
- Infrastructure only: `bigint`

### 7. Testing Quality Standards (CRITICAL)
- **Quality over quantity**: Focus on business logic, NOT property tests
- Test business rules and real scenarios, not getters/setters
- Avoid superficial tests just for coverage
- Coverage goals by layer with quality focus
- Test pyramid: 70% unit, 20% integration, 10% E2E

### 8. Development Workflows
- Adding features
- Database schema changes
- NATS communication setup

### 9. Critical Rules
- Comprehensive DO/DO NOT list
- Common pitfalls to avoid

## Updating Rules

When updating project rules:

1. **Primary source**: Update `WARP.md` (comprehensive documentation)
2. **Secondary**: Update `.cursorrules` (extract key points from WARP.md)
3. Keep both files in sync for critical rules

## Rule Priority

If there's ever a conflict between files:
```
.cursorrules (Cursor reads this)
     ↓
  WARP.md (more detailed context)
```

Both should say the same thing, but `.cursorrules` is what Cursor AI actively uses during coding.

## Alternative Approaches (NOT USED)

We **DO NOT** use these approaches:

❌ Multiple `.cursorrules` files in subdirectories
- Complexity: Hard to track which rules apply where
- Conflicts: Rules may contradict each other
- Maintenance: Update multiple files for same change

❌ No rules file
- Inconsistency: Each developer codes differently
- No AI guidance: Cursor doesn't know project patterns

## Documentation References

For more detailed information, see:
- `WARP.md` - Complete project guidance
- `docs/TESTING_QUALITY_STANDARDS.md` - Testing best practices (MUST READ)
- `docs/BIGNUMBER_BEST_PRACTICES.md` - Financial calculations
- `docs/TESTING_GUIDE.md` - Testing patterns
- `tech-doc/layers/DOMAIN_LAYER.md` - Domain layer details
