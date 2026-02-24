# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

NestJS microservices monorepo with Clean Architecture. 8 independent services communicating via NATS, each with its own PostgreSQL database.

**Services:** `users` (3000), `balance` (3001), `payments` (3002), `games` (3004), `bonus` (3006), `cron`, `currency-rate` (3007), `test-payment-provider` (3003), `test-game-provider` (3005), `swagger-aggregator` (3100)

**Tech Stack:** NestJS 11, TypeScript 5.7, Prisma 7, NATS (3-node cluster), Redis, PostgreSQL 15

## Per-App and Libs Documentation

Before modifying an app, read its feature documentation for context:
- `apps/{service}/FEATURES.md` - All features and capabilities of that app
- `libs/LIBS.md` - All shared libraries and their purposes

Use these docs to understand scope, avoid breaking features, and choose the correct service for changes.

## Essential Commands

### Development
```bash
# Start specific service in watch mode
npm run start:users:debug
npm run start:balance:debug
npm run start:payments:debug

# Build all services
npm run build

# Lint (MANDATORY before completing any change)
npm run lint
npm run lint:fix
```

### Database Management
```bash
# Generate Prisma clients (after schema changes)
npm run generate:users
npm run generate:balance
npm run generate:all

# Run migrations (development)
npm run migrate:users:dev
npm run migrate:balance:dev
npm run migrate:all:dev

# Run migrations (deploy)
npm run migrate:all:deploy

# Clear all tables (local env only - uses .env.local, TEST_DIRECT_* URLs)
npm run db:clear:local
```

### Testing
```bash
# Create test databases FIRST (before first test run)
npm run test:db:create

# Run tests for specific service
npm run test:users              # All tests
npm run test:users:unit         # Unit only
npm run test:users:integration  # Integration only
npm run test:users:watch        # Watch mode

# Run all tests
npm run test:all
npm run test:all:unit
npm run test:all:integration
npm run test:e2e

# Coverage
npm run test:users:coverage
```

### Infrastructure (Docker Compose)
```bash
# Start all infrastructure
docker-compose -f docker/docker-compose.local.yml up -d

# Start specific services
docker-compose up -d postgres-1 postgres-2 postgres-3
docker-compose up -d nats-1 nats-2 nats-3
docker-compose up -d redis
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
│   │   ├── mapper/      # Entity ↔ Prisma conversions (bigint ↔ BigNumber)
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

### Path Aliases
```typescript
// Applications
@app/users/*
@app/balance/*
@app/payments/*
@app/games/*
@app/bonus/*

// Libraries
@lib/shared/*              // Common utilities, auth, health
@lib/lib-balance/*         // Balance service contracts
@lib/lib-games/*
@lib/lib-payments/*
@lib/lib-bonus/*
@lib/lib-users/*

// Prisma clients (service-specific)
@prisma/users
@prisma/balance
@prisma/payments
@prisma/games
@prisma/bonus
```

### Inter-Service Communication

**NEVER hardcode NATS subjects. ALWAYS use library contracts:**

```typescript
// ✅ CORRECT: Import from library
import { BalancePublisher } from '@lib/lib-balance';
const response = await balancePublisher.createUserBalance(request);

// ❌ WRONG: Hardcoded subject
natsClient.send('balance.create-user-balance.v1', data);
```

**Communication Libraries:**
- `@lib/lib-balance` - BalancePublisher, BalanceSubjects
- `@lib/lib-games` - GamesPublisher, GamesSubjects
- `@lib/lib-payments` - PaymentsPublisher, PaymentsSubjects
- `@lib/lib-bonus` - BonusPublisher, BonusSubjects
- `@lib/lib-users` - UsersPublisher, UsersSubjects

**Pattern:**
- Request-Reply: Use Publishers for synchronous calls
- Pub/Sub: Use subjects for async events

### NATS Publisher Response Validation (MANDATORY)

Every NATS publisher method in `/libs/lib-*/src/publishers` MUST:
1. Check if response exists: `if (!response) { throw ... }`
2. Validate response with Zod: `ResponseSchema.parse(response)`
3. Include error logging with context
4. Use try-catch around Zod validation

Reference: `libs/lib-balance/src/publishers/balance.publisher.ts`

### Database Per Service

Each service owns its database exclusively. NEVER access another service's database directly. Use NATS for cross-service data access.

## Critical Type System Rules

### BigNumber Usage (MANDATORY)

**NEVER use `bigint` in application or domain code. ALWAYS use `BigNumber` from `bignumber.js`.**

```typescript
// ✅ CORRECT: Domain entities use BigNumber
import BigNumber from 'bignumber.js';

class User {
  balance: BigNumber;  // ✅
  
  canAffordPurchase(amount: BigNumber): boolean {
    return this.balance.isGreaterThanOrEqualTo(amount);  // ✅ Use BigNumber methods
  }
}

// ❌ WRONG: Using bigint in domain
class User {
  balance: bigint;  // ❌ Never
}
```

**Utility Functions for Conversions:**
```typescript
import { 
  bigIntToBigNumber,      // Prisma → Domain
  bigNumberToBigInt,      // Domain → Prisma
  stringToBigNumber       // HTTP DTO → Domain
} from '@lib/shared';

// In mappers: Prisma → Domain
static toDomain(entity: PrismaUser): User {
  return new User({
    id: bigIntToBigNumber(entity.id),
    balance: bigIntToBigNumber(entity.balance)
  });
}

// In mappers: Domain → Prisma
static toPrisma(user: User) {
  return {
    id: bigNumberToBigInt(user.id),
    balance: bigNumberToBigInt(user.balance)
  };
}

// In handlers: String → BigNumber
const userId = stringToBigNumber(request.userId);
const amount = stringToBigNumber(request.amount);
```

**Where to Use What:**
- Domain entities, DTOs, application layer: ALWAYS `BigNumber`
- Repository ports (abstract classes): ALWAYS `BigNumber`
- Prisma mappers: Use utility functions for conversions
- Prisma schemas and generated types: `bigint` (database mapping only)

### String-Based DTOs for Financial Data and IDs

ALWAYS use `string` type for user IDs and amounts in HTTP DTOs to avoid JavaScript number precision issues (MAX_SAFE_INTEGER = 2^53 - 1).

```typescript
// ✅ CORRECT: DTOs use strings
export const PaymentRequestSchema = z.object({
  userId: z.string().regex(/^\d+$/, 'User ID must be a positive integer string'),
  amount: z.string().regex(/^\d+$/, 'Amount must be a positive integer string'),
  currency: z.nativeEnum(Currency),
});

// Handler: Convert strings to BigNumber
const userId = stringToBigNumber(request.userId);
const amount = stringToBigNumber(request.amount);

// ❌ WRONG: Using number in DTOs
export const PaymentRequestSchema = z.object({
  userId: z.number().int().positive(),  // ❌ Precision loss for IDs > 2^53
  amount: z.number().int().positive(),  // ❌ Precision loss
});
```

**Data Flow:**
```
HTTP/JSON → "12345", "10000" (string)
    ↓
Zod Validation → validated strings
    ↓
Handler → stringToBigNumber() → BigNumber
    ↓
Domain → BigNumber (safe arithmetic, business logic)
    ↓
Mapper → bigNumberToBigInt() → bigint
    ↓
Prisma → bigint → Database BIGINT column
```

### Currency and Language (STRICT ENFORCEMENT)

**Absolute ban on currency/language strings, custom enums, and constants. ONLY use shared library types.**

```typescript
// ✅ CORRECT: ONLY import from shared library
import { Currency } from '@lib/shared/currency';
import { Language, Languages, getLanguageByCode } from '@lib/shared/language';

// DTOs - Use z.nativeEnum()
export const PaymentSchema = z.object({
  currency: z.nativeEnum(Currency),  // ✅ ONLY this
});

// Domain entities
interface PaymentProps {
  currency: Currency;  // ✅ ONLY this type
}

// Comparisons
if (payment.currency === Currency.USD) {  // ✅
  // ...
}

// ❌ FORBIDDEN: ANY of these
if (payment.currency === 'USD') { }  // ❌ NEVER
const curr = 'USD';  // ❌ NEVER
enum MyCurrency { USD = 'usd' }  // ❌ NEVER
type Currency = 'USD' | 'EUR';  // ❌ NEVER redefine
const CURRENCY_USD = 'usd';  // ❌ NEVER
z.enum(['USD', 'EUR', 'BDT']);  // ❌ NEVER (use z.nativeEnum(Currency))
```

**Available Values:**
```typescript
// Currency (from @lib/shared/currency)
enum Currency {
  BDT = 'bdt',  // Taka (৳)
  EUR = 'eur',  // Euro (€)
  USD = 'usd',  // US Dollar ($)
}

// Language (from @lib/shared/language)
export const Languages = [
  new Language('English', 'en', 'en', true),
  new Language('Bengali', 'bn', 'bn-BD', true),
];
```

**Reference:**
- Currency: `libs/shared/src/currency/`
- Language: `libs/shared/src/language/`

### Currency Decimals for Provider APIs (MANDATORY)

**NEVER hardcode decimal precision (e.g. `2`) when formatting provider request/response amounts.**

Use decimals from shared currency metadata:

```typescript
import { bigNumberToDecimal, getCurrencyVelueByStringCode } from '@lib/shared';

const decimals = getCurrencyVelueByStringCode(currencyCode).getDecimals();
const amount = bigNumberToDecimal(valueInSmallestUnit, decimals);
```

**Rules:**
- For provider callbacks/webhooks and external API payloads, always resolve decimals from currency code
- Do not use `toFixed(2)`, `/100`, or default decimal helpers without passing currency decimals
- Follow balance app pattern: derive decimals via `getCurrencyVelueByStringCode(...).getDecimals()`

## HTTP Controllers, DTOs, and Use Cases

### Controller Pattern
```typescript
import { Controller, Post, Body, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('resource')
@ApiTags('Resource')  // ✅ Swagger grouping
export class ResourceHttpController {
  private readonly logger = new Logger(ResourceHttpController.name);
  
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  
  @Post('create')
  @ApiOperation({ summary: 'Create resource' })
  @ApiResponse({ status: 201, description: 'Success', type: ResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(
    @Body() dto: CreateResourceHttpDto,
    @Req() request: Request,
  ): Promise<CreateResourceResponseDto> {
    this.logger.log('Create resource request');
    return this.commandBus.execute(
      new CreateResourceCommand({ ...dto, ip: extractIp(request) }),
    );
  }
}
```

### DTO Pattern (Zod + Swagger)
```typescript
import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '@lib/shared/currency';

// Step 1: Zod schema (validation logic)
export const CreatePaymentRequestSchema = z.object({
  userId: z.string().regex(/^\d+$/),
  amount: z.string().regex(/^\d+$/),
  currency: z.nativeEnum(Currency),  // ✅ Shared enum
});

// Step 2: Extract TypeScript type
export type CreatePaymentRequestDto = z.infer<typeof CreatePaymentRequestSchema>;

// Step 3: HTTP DTO with Swagger docs
export class CreatePaymentHttpDto extends createZodDto(
  CreatePaymentRequestSchema,
) {
  @ApiProperty({ description: 'User ID', example: '12345' })
  declare userId: string;  // ✅ Use 'declare' keyword
  
  @ApiProperty({ description: 'Amount', example: '10000' })
  declare amount: string;
  
  @ApiProperty({ description: 'Currency', enum: Currency })
  declare currency: Currency;
}
```

### Use Case Handler Pattern
```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

export class CreatePaymentCommand {
  constructor(public readonly request: CreatePaymentRequestDto & { ip: string }) {}
}

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler implements ICommandHandler<CreatePaymentCommand> {
  private readonly logger = new Logger(CreatePaymentHandler.name);
  
  constructor(
    private readonly repository: PaymentPortRepository,  // ✅ Abstract class
  ) {}
  
  async execute(command: CreatePaymentCommand): Promise<CreatePaymentResponseDto> {
    this.logger.log('Creating payment');
    // Business logic - keep handlers thin (<50 lines)
    const payment = await this.repository.create(...);
    return { paymentId: payment.id, success: true };
  }
}
```

**File Organization:**
```
application/use-cases/create-payment/
├── create-payment.command.ts    # Command/Query class
├── create-payment.dto.ts        # Zod + HTTP DTO + Response DTO
└── create-payment.handler.ts    # Handler implementation
```

## Testing Requirements - Quality First

**Core Philosophy: QUALITY OVER QUANTITY**

Tests must validate **business logic and real-world scenarios**, NOT just achieve coverage numbers.

### Testing Principles (MANDATORY)

**✅ DO - Focus on Business Value:**
- Test business rules and invariants (validation, state transitions, calculations)
- Test edge cases and error conditions (zero, negative, maximum values)
- Test real-world scenarios (concurrent updates, multi-step flows)
- Test complex calculations (wagering, conversions, commissions)
- Test error handling and rollback scenarios
- Write descriptive test names explaining the business rule

**❌ DON'T - Avoid Superficial Tests:**
- DON'T test simple getters/setters that just return properties
- DON'T test obvious property assignments (`user.getName() === 'John'`)
- DON'T test framework behavior (DI, class instantiation)
- DON'T write redundant tests just for coverage numbers
- DON'T test trivial constructors with no validation
- DON'T test DTOs with no business logic (just property bags)

**Examples:**
```typescript
// ❌ BAD: Testing property assignment (no business value)
it('should set user name', () => {
  const user = new User({ name: 'John' });
  expect(user.getName()).toBe('John');  // ❌ Worthless
});

// ✅ GOOD: Testing business logic
it('should prevent withdrawal when balance is insufficient', () => {
  const user = new User({ balance: new BigNumber(100) });
  expect(() => user.withdraw(new BigNumber(200)))
    .toThrow('Insufficient balance');
});

// ✅ GOOD: Testing real-world scenario
it('should handle concurrent balance updates correctly', async () => {
  const userId = new BigNumber(1);
  await Promise.all([
    repository.increment(userId, Currency.USD, new BigNumber(100)),
    repository.increment(userId, Currency.USD, new BigNumber(200)),
  ]);
  const balance = await repository.findByUserIdAndCurrency(userId, Currency.USD);
  expect(balance.getAmount()).toEqual(new BigNumber(300));
});
```

**Test Pyramid:** 70% Unit, 20% Integration, 10% E2E

**Coverage Goals (Quality First):**
- Domain: 100% business logic coverage (skip trivial getters)
- Application: 90%+ use case orchestration
- Infrastructure: 70%+ critical paths
- Presentation: 80%+ controllers

**Remember:** Coverage is NOT quality. 70% coverage of real scenarios beats 100% coverage of trivial assertions.

**File Naming:**
- Unit: `*.spec.ts`
- Integration: `*.integration.spec.ts`
- E2E: `e2e/**/*.e2e.spec.ts`

**Required Tests by Layer:**

1. **Domain Layer (Unit Tests ONLY):**
   - Every entity → `entity-name.spec.ts`
   - Every domain service → `service-name.spec.ts`
   - NO mocking needed (pure TypeScript)

2. **Application Layer (Unit Tests ONLY):**
   - Every use case handler → `handler-name.spec.ts`
   - Mock ALL ports (repositories, external services)

3. **Presentation Layer (Unit + Integration):**
   - HTTP Controllers:
     - Unit test: `controller.spec.ts` (mock dependencies)
     - Integration test: `controller.integration.spec.ts` (supertest + real DB)
   - NATS Controllers:
     - Unit test: `controller.spec.ts` (mock dependencies)
     - Integration test: `controller.integration.spec.ts` (real NATS + real DB)

4. **Infrastructure Layer:**
   - Repositories: `repository.integration.spec.ts` (real DB)
   - Mappers: `mapper.spec.ts` (unit test, verify BigNumber ↔ bigint conversions)

**Before First Test Run:**
```bash
# Create test databases (PostgreSQL must be running)
npm run test:db:create
```

**Testing Patterns:**
- Unit tests: Mock ALL infrastructure
- Integration tests: Real database + real NATS, mock external services only
- Never hardcode NATS subjects in tests - use library publishers
- Clean test databases before each run
- Use transactions for test isolation

**Reference:**
- **Testing Quality Standards: `docs/TESTING_QUALITY_STANDARDS.md` (MUST READ)**
- Testing Guide: `docs/TESTING_GUIDE.md`
- Testing Quick Start: `docs/TESTING_README.md`
- Service-specific: `apps/{service}/TESTING-README.md`

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
1. Update `prisma/{service}/schema.prisma`
2. Run: `npm run migrate:{service}:dev`
3. Regenerate: `npm run generate:{service}`
4. Update mappers in `infrastructure/prisma/mapper/`
5. Update repositories if needed
6. **MANDATORY:** Run `npm run lint`

**Adding NATS Communication:**
1. Define subject/types in `libs/lib-{service}/src/subjects.ts`
2. Create/update publisher in `libs/lib-{service}/src/publishers/`
3. Add handler in `apps/{service}/src/presentation/nats/`
4. Use publisher from other services (never hardcode subjects)
5. **MANDATORY:** Run `npm run lint`

## Logging Best Practices

**Reference:** `docs/LOGGING_BEST_PRACTICES.md`

**Key Principles:**
1. **Structured Logging**: Use objects with `operationId`, not string concatenation
2. **Layer-specific**:
   - Presentation: Log requests/responses
   - Application: Log operation start/end
   - Domain: NO logging (pure business logic)
   - Infrastructure: Only critical DB errors
3. **Mask PII**: Never log passwords, full emails, tokens - use masking utilities
4. **Error context**: Always include `operationId`, `userId`, `operation`, `error`

```typescript
// ✅ CORRECT
this.logger.log('User registered', {
  operationId: 'uuid-123',
  userId: '12345',
  operation: 'RegisterUser',
  service: 'users',
});

// ❌ WRONG
this.logger.log(`User ${userId} registered`);
```

## Critical Rules - Never Violate

**DO NOT:**
- Put business logic in application/infrastructure layers
- Use Prisma directly from handlers (use repositories via ports)
- Hardcode NATS subjects (use library contracts)
- Define ports as interfaces (use abstract classes for NestJS DI)
- Access other services' databases directly (use NATS)
- Use `bigint` in domain/application code (use `BigNumber`)
- Use `BigInt()` or manual `.toString()` conversions (use utility functions)
- Use `number` type for IDs/amounts in DTOs (use `string`)
- Import framework code in domain layer
- Use ANY currency/language strings, custom enums, or constants
- Use `z.enum()` for currency (use `z.nativeEnum(Currency)`)
- Skip running `npm run lint` after code changes

**DO:**
- Keep handlers thin (<50 lines)
- Use CQRS pattern (Commands for writes, Queries for reads)
- Use path aliases (@app/*, @lib/*, @prisma/*)
- Use string validation for IDs/amounts in DTOs
- Convert strings to BigNumber with `stringToBigNumber()`
- Use `bigIntToBigNumber()` and `bigNumberToBigInt()` in mappers
- Follow test pyramid (70% unit, 20% integration, 10% E2E)
- Create test databases before running tests
- Run `npm run lint` after EVERY code change

## Documentation References

- Clean Architecture: `docs/games/docs/architecture/CLEAN-ARCHITECTURE.md`
- Domain Layer: `tech-doc/layers/DOMAIN_LAYER.md`
- NATS Request-Reply: `tech-doc/communication/NATS_REQUEST_REPLY.md`
- NATS Pub/Sub: `tech-doc/communication/NATS_MESSAGING.md`
- BigNumber Best Practices: `docs/BIGNUMBER_BEST_PRACTICES.md`
- **Testing Quality Standards: `docs/TESTING_QUALITY_STANDARDS.md` (MUST READ)**
- Testing Guide: `docs/TESTING_GUIDE.md`
- Logging Best Practices: `docs/LOGGING_BEST_PRACTICES.md`
