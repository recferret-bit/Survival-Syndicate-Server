# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

NestJS-based casino platform built as a microservices monorepo using Clean Architecture principles. The system consists of 8 independent microservices communicating via NATS, each with its own PostgreSQL database.

## Microservices Architecture

**Core Services:**
- `users` (port 3000) - User registration, authentication, JWT management
- `balance` (port 3001) - Multi-currency balance management, ledger system
- `payments` (port 3002) - Payment processing, deposits/withdrawals
- `games` (port 3004) - Game provider integration, session management
- `bonus` (port 3006) - Bonus activation, wagering, campaigns
- `cron` - Scheduled tasks and background jobs

**Test Services:**
- `test-payment-provider` (port 3003) - Mock payment provider for testing
- `test-game-provider` (port 3005) - Mock game provider for testing

**Communication:**
- Inter-service: NATS (3-node cluster) for request-reply and pub/sub
- Client: HTTP REST APIs
- Cache/Locking: Redis
- Databases: PostgreSQL (separate database per service)

## Per-App and Libs Documentation

Before modifying an app, read its feature documentation for context:
- `apps/{service}/FEATURES.md` - All features and capabilities of that app
- `libs/LIBS.md` - All shared libraries and their purposes

Use these docs to understand scope, avoid breaking features, and choose the correct service for changes.

## Commands

### Development

```bash
# Start specific service in watch mode
npm run start:users:debug
npm run start:balance:debug
npm run start:payments:debug
npm run start:games:debug
npm run start:bonus:debug

# Build all services
npm run build

# Format code
npm run format
```

### Infrastructure

```bash
# Start all infrastructure services (PostgreSQL, NATS cluster, Redis)
docker-compose up -d

# Start specific services
docker-compose up -d postgres
docker-compose up -d nats-1 nats-2 nats-3
docker-compose up -d redis
```

### Database Management

**Each service has its own database and Prisma schema:**

```bash
# Generate Prisma client for specific service
npm run generate:users
npm run generate:balance
npm run generate:payments
npm run generate:games
npm run generate:bonus

# Run migrations for specific service (development)
npm run migrate:users:dev
npm run migrate:balance:dev
npm run migrate:payments:dev
npm run migrate:games:dev
npm run migrate:bonus:dev
```

**Important:** Always use the service-specific scripts. The `PRISMA_DB` environment variable determines which database to target.

### Testing

```bash
# Test specific service (unit + integration)
npm run test:users
npm run test:balance
npm run test:payments
npm run test:games

# Test by type
npm run test:users:unit
npm run test:users:integration
npm run test:users:watch

# Coverage
npm run test:users:coverage
npm run test:balance:coverage

# E2E tests (tests cross-service communication)
npm run test:e2e

# Test all services
npm run test:all
npm run test:all:unit
npm run test:all:integration
```

**Test Database Setup:**

Before running tests, create test databases:

```bash
# Create all test databases and run migrations
npm run test:db:create

# Create specific test database
npm run test:db:create:users
npm run test:db:create:balance

# Clean test databases (drop and recreate)
npm run test:db:clean
npm run test:db:clean:users
```

**Prerequisites:** PostgreSQL container must be running (`docker-compose up -d postgres`)

## Architecture

### Clean Architecture Layers

All services follow strict Clean Architecture with four layers:

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

### Inter-Service Communication

**NEVER hardcode NATS subjects.** Always use library contracts:

```typescript
// ✅ CORRECT: Import from library
import { BalancePublisher } from '@lib/lib-balance';
const response = await balancePublisher.createUserBalance(request);

// ❌ WRONG: Hardcoded subject
natsClient.send('balance.create-user-balance.v1', data);
```

**Communication Libraries:**
- `@lib/lib-balance` - Balance service contracts (BalancePublisher, BalanceSubjects)
- `@lib/lib-games` - Games service contracts (GamesPublisher, GamesSubjects)
- `@lib/lib-payments` - Payments service contracts (PaymentsPublisher, PaymentsSubjects)
- `@lib/lib-bonus` - Bonus service contracts (BonusPublisher, BonusSubjects)

**Shared Libraries:**
- `@lib/shared` - Common utilities (auth guards, currency/language enums, Redis, health checks)

**Pattern:**
- Request-Reply: Use Publishers for synchronous calls
- Pub/Sub: Use subjects for async events (user.created, payment.completed)

#### NATS Publisher Response Validation - MANDATORY

**CRITICAL: Every NATS publisher method in `/libs/lib-*/src/publishers` MUST validate responses.**

**Required Pattern for ALL Publisher Methods:**

```typescript
import { Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RequestSchema, ResponseSchema } from '../schemas';

@Injectable()
export class SomePublisher {
  private readonly logger = new Logger(SomePublisher.name);
  
  constructor(@Inject('NATS_CLIENT') private readonly client: ClientProxy) {}
  
  async someMethod(dto: Request): Promise<Response> {
    // Step 1: Validate request (optional but recommended)
    RequestSchema.parse(dto);
    
    // Step 2: Send request and get response
    const response = await this.client
      .send<Response>(SomeSubject, dto)
      .toPromise();
    
    // Step 3: ✅ MANDATORY - Check if response exists
    if (!response) {
      this.logger.error(
        `Received undefined response from service`,
        { dto },
      );
      throw new Error(
        'Service did not return a valid response. The service may be unavailable or the request timed out.',
      );
    }
    
    // Step 4: ✅ MANDATORY - Validate response with Zod
    try {
      return ResponseSchema.parse(response);
    } catch (error) {
      this.logger.error(
        `Invalid response format from service`,
        { response, error },
      );
      throw new Error(
        `Service returned an invalid response format: ${error.message}`,
      );
    }
  }
}
```

**Why This is Critical:**
1. **Service Unavailability**: NATS `.toPromise()` returns `undefined` if no handler responds
2. **Timeout Scenarios**: Network issues or overloaded services
3. **Type Safety**: Response might not match expected schema
4. **Debugging**: Proper error logging helps trace inter-service issues
5. **Error Handling**: Calling service gets clear error messages

**What to Check:**
- ✅ Response existence check: `if (!response) { throw ... }`
- ✅ Zod validation: `ResponseSchema.parse(response)`
- ✅ Error logging with context
- ✅ Descriptive error messages
- ✅ Try-catch around Zod validation

**Bad Example (NEVER do this):**

```typescript
// ❌ WRONG: No validation, no error checking
async createUser(dto: Request): Promise<Response> {
  const response = await this.client
    .send<Response>(Subject, dto)
    .toPromise();
  
  return response;  // ❌ What if response is undefined?
}

// ❌ WRONG: No Zod validation
async createUser(dto: Request): Promise<Response> {
  const response = await this.client
    .send<Response>(Subject, dto)
    .toPromise();
  
  if (!response) throw new Error('No response');
  return response;  // ❌ Response format not validated
}
```

**Reference Implementation:**
- `libs/lib-balance/src/publishers/balance.publisher.ts`
- All methods in this file follow the correct pattern

### Database Per Service

Each microservice owns its database exclusively:

```
users_db                    → Users service
balance_db                  → Balance service  
payments_db                 → Payments service
games_db                    → Games service
bonus_db                    → Bonus service
test_payment_provider_db    → Test provider
test_game_provider_db       → Test provider
```

**Path Mappings:**

Prisma clients are generated to separate paths:
- `@prisma/users` - Users Prisma client
- `@prisma/balance` - Balance Prisma client
- `@prisma/payments` - Payments Prisma client
- `@prisma/games` - Games Prisma client

### TypeScript Path Aliases

```typescript
// Applications
@app/users/*      // apps/users/src/*
@app/balance/*    // apps/balance/src/*
@app/payments/*   // apps/payments/src/*
@app/games/*      // apps/games/src/*
@app/bonus/*      // apps/bonus/src/*

// Libraries
@lib/shared/*              // libs/shared/src/*
@lib/lib-balance/*         // libs/lib-balance/src/*
@lib/lib-games/*           // libs/lib-games/src/*
@lib/lib-payments/*        // libs/lib-payments/src/*
@lib/lib-bonus/*           // libs/lib-bonus/src/*
@lib/lib-affise/*          // libs/lib-affise/src/*
@lib/lib-dengage/*         // libs/lib-dengage/src/*
@lib/lib-exchange-rate/*   // libs/lib-exchange-rate/src/*

// Prisma
@prisma/users
@prisma/balance
@prisma/payments
@prisma/games
```

## Testing Strategy

**Core Philosophy: QUALITY OVER QUANTITY**

Tests should validate **business logic and real-world scenarios**, not just achieve coverage numbers.

### Testing Principles - MANDATORY

**✅ DO - Focus on Business Value:**
- Test business rules and invariants (validation, state transitions, calculations)
- Test edge cases and error conditions (zero, negative, maximum values)
- Test real-world scenarios and workflows (concurrent updates, multi-step flows)
- Test complex calculations (wagering, conversions, commissions)
- Test error handling and rollback scenarios
- Write descriptive test names explaining the business rule

**❌ DON'T - Avoid Superficial Tests:**
- DON'T test simple getters/setters that just return properties
- DON'T test obvious property assignments (user.getName() === 'John')
- DON'T test framework behavior (dependency injection, class instantiation)
- DON'T write redundant tests for coverage numbers
- DON'T test trivial constructors with no validation logic
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
    repository.increment(userId, Currency.USD, new BigNumber(50)),
  ]);
  
  const balance = await repository.findByUserIdAndCurrency(userId, Currency.USD);
  expect(balance.getAmount()).toEqual(new BigNumber(350));
});
```

**Test Pyramid:**
- 70% Unit tests (domain logic, use cases)
- 20% Integration tests (controllers, repositories with real DB)
- 10% E2E tests (cross-service flows)

**Test File Locations:**
- Unit: `*.spec.ts` (next to source files)
- Integration: `*.integration.spec.ts` (in same directories)
- E2E: `e2e/**/*.e2e.spec.ts` (root level)

**Coverage Goals (Quality First):**
- Domain: 100% business logic coverage (skip trivial getters)
- Application: 90%+ use case orchestration
- Infrastructure: 70%+ critical paths
- Presentation: 80%+ controllers

**Remember:** Coverage is NOT quality. 70% coverage of real scenarios beats 100% coverage of trivial assertions.

**See:** `docs/TESTING_QUALITY_STANDARDS.md` for comprehensive testing guidelines

### Required Test Coverage by Layer

**Domain Layer (100% Unit Tests Required):**
- ✅ **Every entity** MUST have unit tests (`entity-name.spec.ts`)
- ✅ **Every domain service** MUST have unit tests (`service-name.spec.ts`)
- Tests should cover all business logic methods
- NO mocking needed - domain is pure TypeScript

**Application Layer (100% Unit Tests Required):**
- ✅ **Every use case handler** MUST have unit tests (`handler-name.spec.ts`)
- Mock all ports (repositories, external services)
- Test business flows and error handling
- Verify correct port method calls

**Presentation Layer (Unit + Integration Tests Required):**

*HTTP Controllers:*
- ✅ **Unit test** (`controller-name.spec.ts`) - Mock all dependencies
- ✅ **Integration test** (`controller-name.integration.spec.ts`) - Use `supertest` for HTTP requests
  - Real database connection
  - Test full request/response cycle
  - Validate status codes, body structure
  - Test authentication/authorization

*NATS Controllers:*
- ✅ **Unit test** (`controller-name.spec.ts`) - Mock all dependencies
- ✅ **Integration test** (`controller-name.integration.spec.ts`) - Use real NATS.io connection
  - Real NATS connection (docker-compose up -d nats-1 nats-2 nats-3)
  - Real database connection
  - Test message handling with actual NATS publish/subscribe
  - Validate request/response patterns
  - Test full NATS request-reply cycle

**Infrastructure Layer (Mixed Testing Required):**

*Repositories:*
- ✅ **Integration test** (`repository-name.integration.spec.ts`) - REQUIRED
  - Real database connection
  - Test CRUD operations
  - Verify Prisma queries work correctly
  - Use transactions for test isolation

*Mappers:*
- ✅ **Unit test** (`mapper-name.spec.ts`) - REQUIRED
  - Test `toDomain()` conversion
  - Test `toPrisma()` conversion
  - Verify BigNumber conversions
  - NO database needed

### Testing Patterns

**Fixtures:**
- Use fixtures from `apps/{service}/src/__fixtures__/`
- Create reusable test data builders
- Keep fixtures close to usage

**Mocking:**
- Unit tests: Mock ALL infrastructure (repositories, external services, NATS)
- Integration tests: Use REAL database and REAL NATS.io, mock external services only
- Never mock what you're testing

**Database:**
- Integration tests use real test database
- Clean test databases before each test run
- Use transactions for test isolation where possible

**NATS:**
- Never hardcode NATS subjects in tests
- Use library publishers for message sending
- Both E2E and integration tests use real NATS.io (docker-compose up -d nats-1 nats-2 nats-3)
- Unit tests mock NATS infrastructure

**Supertest for HTTP:**
```typescript
// Example HTTP integration test
import request from 'supertest';

it('should create withdrawal', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/v2/payments/withdrawal')
    .set('Authorization', `Bearer ${token}`)
    .send({ amount: '10000', currency: 'USD' })
    .expect(201);
    
  expect(response.body.success).toBe(true);
});
```

**Current Test Coverage:**
- Users: 11 test files, ~140+ tests
- Balance: 17 test files, ~190+ tests

**Documentation:**
- `docs/TESTING_QUALITY_STANDARDS.md` - Testing best practices and quality standards (MUST READ)
- `docs/TESTING_GUIDE.md` - Comprehensive testing patterns and setup
- `docs/TESTING_README.md` - Quick start guide

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
9. **MANDATORY:** Verify no lint errors with `npm run lint` before completing any change

**Modifying Database Schema:**

1. Update Prisma schema: `prisma/{service}/schema.prisma`
2. Create migration: `npm run migrate:{service}:dev`
3. Regenerate client: `npm run generate:{service}`
4. Update mappers in `infrastructure/prisma/mapper/`
5. Update repositories if needed
6. **MANDATORY:** Run `npm run lint` to verify no lint errors

**Adding NATS Communication:**

1. Define subject and types in service library (`libs/lib-{service}/src/subjects.ts`)
2. Create/update publisher in library (`libs/lib-{service}/src/publishers/`)
3. Add handler in service app (`apps/{service}/src/presentation/nats/`)
4. Use publisher from other services (never hardcode subjects)
5. **MANDATORY:** Run `npm run lint` to verify no lint errors

## BigNumber vs BigInt Usage

**CRITICAL RULE:** Never use `bigint` in application or domain code. Always use `BigNumber` from `bignumber.js`.

**Why:** BigNumber provides safe decimal arithmetic for financial calculations, while bigint is only for Prisma database mapping.

**Usage Pattern:**

```typescript
// ✅ CORRECT: Domain entities use BigNumber
import BigNumber from 'bignumber.js';

class User {
  balance: BigNumber;  // ✅
}

// ✅ CORRECT: Use utility functions for conversions
import { bigIntToBigNumber, bigNumberToBigInt } from '@lib/shared';

// In mappers: Prisma → Domain
static toDomain(entity: PrismaUser): User {
  return new User({
    balance: bigIntToBigNumber(entity.balance)  // ✅
  });
}

// In mappers: Domain → Prisma
static toPrisma(user: User) {
  return {
    balance: bigNumberToBigInt(user.balance)  // ✅
  };
}

// ❌ WRONG: Using bigint in domain
class User {
  balance: bigint;  // ❌ Never do this
}

// ❌ WRONG: Manual conversion
new BigNumber(entity.balance.toString())  // ❌
BigInt(user.balance.toString())  // ❌
```

**Where to Use What:**
- **Domain entities, DTOs, application layer**: Always `BigNumber`
- **Repository ports (abstract classes)**: Always `BigNumber`
- **Prisma mappers**: Use `bigIntToBigNumber()` and `bigNumberToBigInt()` for conversions
- **Prisma schemas and generated types**: `bigint` (database mapping only)

**String-Based DTOs for Financial Data and User IDs:**

Always use `string` type for user IDs and amounts in HTTP DTOs to avoid JavaScript number precision issues.

**CRITICAL: userId Best Practice**
- In Prisma database: `userId` is stored as `bigint` (BIGINT column)
- In HTTP requests/controllers: `userId` is validated as `string` in DTOs
- In domain/application logic: `userId` is converted to `BigNumber` using `stringToBigNumber()`
- Never use `number` type for `userId` in DTOs or requests

```typescript
// ✅ CORRECT: DTOs use strings for IDs and amounts
import { z } from 'zod';

export const InitWithdrawalRequestSchema = z.object({
  userId: z.string().regex(/^\d+$/, 'User ID must be a positive integer string'),
  amount: z.string().regex(/^\d+$/, 'Amount must be a positive integer string'),
  currency: z.nativeEnum(Currency),
});

// Handler: Convert strings to BigNumber
import { stringToBigNumber } from '@lib/shared';

const userId = stringToBigNumber(request.userId);  // ✅ string → BigNumber
const amount = stringToBigNumber(request.amount);  // ✅ string → BigNumber

// ❌ WRONG: Using number in DTOs (precision loss for large values)
export const InitWithdrawalRequestSchema = z.object({
  userId: z.number().int().positive(),  // ❌ Unsafe for IDs > 2^53
  amount: z.number().int().positive(),  // ❌ Unsafe for large amounts
});
```

**Why Strings?**
- JavaScript `Number` type has precision limit: `MAX_SAFE_INTEGER = 2^53 - 1`
- JSON serialization corrupts large numbers: `9007199254740993` becomes `9007199254740992`
- Strings preserve exact values during HTTP transport

**Data Flow for userId and amounts:**
```
HTTP Request → userId: "12345", amount: "10000" (string)
     ↓
DTO Validation → validated strings
     ↓
Handler → stringToBigNumber(userId), stringToBigNumber(amount)
     ↓
Domain Layer → BigNumber (safe arithmetic, business logic)
     ↓
Mapper → bigNumberToBigInt(userId), bigNumberToBigInt(amount)
     ↓
Prisma → bigint (database storage)
     ↓
Database → BIGINT column (users.id, transactions.amount, etc.)
```

**See:** `docs/BIGNUMBER_BEST_PRACTICES.md` for complete guide.

## Currency and Language - STRICT ENFORCEMENT

**ABSOLUTE RULE:** Currency and language strings, custom enums, and constants are **BANNED**.

**ONLY allowed sources:**
- `@lib/shared/currency` - Currency enum and utilities ONLY
- `@lib/shared/language` - Language class and utilities ONLY

**Any other usage is FORBIDDEN and will break the codebase.**

### Currency - Mandatory Usage

```typescript
// ✅ CORRECT: ONLY import from @lib/shared/currency
import { Currency } from '@lib/shared/currency';
import { getCurrencySymbol, CurrencyService } from '@lib/shared/currency';

// DTOs - ONLY z.nativeEnum(Currency)
export const PaymentRequestSchema = z.object({
  currency: z.nativeEnum(Currency),  // ✅
});

// Domain entities
interface PaymentProps {
  currency: Currency;  // ✅ ONLY this type
}

// Comparisons
if (payment.currency === Currency.USD) {  // ✅
  // ...
}

// Get currency details
const symbol = getCurrencySymbol(Currency.USD);  // ✅
```

### What is FORBIDDEN for Currency

**Never do any of the following:**

```typescript
// ❌ FORBIDDEN: Raw strings
if (payment.currency === 'USD') { }  // ❌ NEVER
if (payment.currency === 'usd') { }  // ❌ NEVER
const curr = 'USD';  // ❌ NEVER

// ❌ FORBIDDEN: Custom enums
enum MyCurrency { USD = 'usd' }  // ❌ NEVER

// ❌ FORBIDDEN: String literal types
type Currency = 'USD' | 'EUR';  // ❌ NEVER redefine
type CurrencyCode = 'usd' | 'eur';  // ❌ NEVER

// ❌ FORBIDDEN: Constants
const CURRENCY_USD = 'usd';  // ❌ NEVER
const USD = 'USD';  // ❌ NEVER
const CURRENCIES = ['USD', 'EUR'];  // ❌ NEVER

// ❌ FORBIDDEN: Object literals
const currencies = { USD: 'usd' };  // ❌ NEVER

// ❌ FORBIDDEN: Hardcoded validation
z.string().refine(v => ['USD'].includes(v));  // ❌ NEVER
z.enum(['USD', 'EUR', 'BDT']);  // ❌ NEVER (use z.nativeEnum(Currency))
```

### Language - Mandatory Usage

```typescript
// ✅ CORRECT: ONLY import from @lib/shared/language
import { Language, Languages, getLanguageByCode } from '@lib/shared/language';

// Use Language instances
const lang = Languages.find(l => l.code === 'en');  // ✅
const langByCode = getLanguageByCode('en');  // ✅
```

### What is FORBIDDEN for Language

```typescript
// ❌ FORBIDDEN: Raw strings
if (user.language === 'en') { }  // ❌ NEVER
const lang = 'English';  // ❌ NEVER

// ❌ FORBIDDEN: Custom enums
enum Lang { EN = 'en' }  // ❌ NEVER
type LanguageCode = 'en' | 'bn';  // ❌ NEVER

// ❌ FORBIDDEN: Constants
const LANG_EN = 'en';  // ❌ NEVER
```

### Available Values

**Currency (from `@lib/shared/currency`):**
```typescript
enum Currency {
  BDT = 'bdt',  // Taka (৳)
  EUR = 'eur',  // Euro (€)
  USD = 'usd',  // US Dollar ($)
}

// Utilities:
- getCurrencySymbol(currency: Currency): string
- getCurrencyName(currency: Currency): string
- CurrencyService class
```

**Language (from `@lib/shared/language`):**
```typescript
export const Languages = [
  new Language('English', 'en', 'en', true),
  new Language('Bengali', 'bn', 'bn-BD', true),
];

// Utilities:
- getLanguageByCode(code: string): Language | undefined
```

### Why This is Critical

1. **Type safety**: Prevents typos and invalid values
2. **Consistency**: Single source of truth across 8 microservices
3. **Maintainability**: Change in one place updates everywhere
4. **Integration**: Prisma schemas, DTOs, domain entities all aligned

**Reference:**
- `libs/shared/src/currency/` - Currency enum, utilities, service
- `libs/shared/src/language/` - Language class and utilities
- **NO OTHER FILES** should define currency/language values

## HTTP Controllers, DTOs, and Use Cases - Best Practices

### HTTP Controller Pattern

**Structure:**
```typescript
import { Controller, Post, Body, Req, Logger, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '@lib/shared/auth';

@Controller('users')  // ✅ Route prefix
@ApiTags('Users')     // ✅ Swagger grouping
export class UsersHttpController {
  private readonly logger = new Logger(UsersHttpController.name);  // ✅ Logger
  
  constructor(
    private readonly commandBus: CommandBus,  // ✅ For write operations
    private readonly queryBus: QueryBus,      // ✅ For read operations
  ) {}
  
  @Post('register')  // ✅ HTTP method + path
  @Public()          // ✅ Auth decorator (if public endpoint)
  @ApiOperation({ summary: 'Register a new user' })  // ✅ Swagger operation
  @ApiResponse({     // ✅ Document success response
    status: 201,
    description: 'User registered successfully',
    type: RegisterUserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })  // ✅ Error responses
  @ApiResponse({ status: 409, description: 'Conflict - user already exists' })
  async register(
    @Body() dto: RegisterUserHttpDto,  // ✅ Use HTTP DTO
    @Req() request: Request,
  ): Promise<RegisterUserResponseDto> {
    this.logger.log(`Register request received`);  // ✅ Log incoming requests
    
    // ✅ Controller just orchestrates - delegates to command/query bus
    return this.commandBus.execute(
      new RegisterUserCommand({
        ...dto,
        ip: this.extractIp(request),  // ✅ Add server-side data
      }),
    );
  }
}
```

**Key Rules:**
- ✅ Use `@ApiTags()` for Swagger grouping
- ✅ Use `@ApiOperation()` for endpoint description
- ✅ Use `@ApiResponse()` for all possible HTTP status codes
- ✅ Log incoming requests with `Logger`
- ✅ Thin controllers - delegate to CommandBus/QueryBus
- ✅ Add server-side data (IP, timestamps) in controller
- ✅ Use HTTP DTOs (not internal DTOs)
- ✅ Return response DTOs with proper typing

### DTO Pattern with Zod Validation

**Zod Schema (Validation Logic):**
```typescript
import { z } from 'zod';
import { Currency } from '@lib/shared/currency';

// ✅ Define validation schema with Zod
export const CreatePaymentRequestSchema = z.object({
  userId: z.string().regex(/^\d+$/, 'User ID must be a positive integer string'),
  amount: z.string().regex(/^\d+$/, 'Amount must be a positive integer string'),
  currency: z.nativeEnum(Currency),  // ✅ Use shared enum
  // ... other fields
});

// ✅ Extract TypeScript type from schema
export type CreatePaymentRequestDto = z.infer<typeof CreatePaymentRequestSchema>;
```

**HTTP DTO (Swagger Documentation):**
```typescript
import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';

// ✅ Generate base DTO from Zod schema
export class CreatePaymentHttpDto extends createZodDto(
  CreatePaymentRequestSchema,
) {
  // ✅ Add Swagger documentation
  @ApiProperty({
    description: 'User ID as string',
    example: '12345',
  })
  declare userId: string;
  
  @ApiProperty({
    description: 'Amount in smallest currency unit',
    example: '10000',
  })
  declare amount: string;
  
  @ApiProperty({
    description: 'Currency code',
    enum: Currency,
    example: Currency.USD,
  })
  declare currency: Currency;
}
```

**Response DTO (Swagger Documentation):**
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentResponseDto {
  @ApiProperty({ description: 'Payment ID', example: 'pay_123456' })
  paymentId: string;
  
  @ApiProperty({ description: 'Payment status', example: 'pending' })
  status: string;
  
  @ApiProperty({ description: 'Success indicator', example: true })
  success: boolean;
}
```

**Key DTO Rules:**
- ✅ Use Zod for validation logic (single source of truth)
- ✅ Use `createZodDto()` to generate NestJS DTO from Zod schema
- ✅ Add `@ApiProperty()` decorators for Swagger documentation
- ✅ Use `declare` keyword for properties (no initialization)
- ✅ Separate HTTP DTOs from internal request/response DTOs
- ✅ Use `z.nativeEnum()` for shared enums (Currency, Language)
- ✅ String validation for IDs and amounts (not numbers)
- ✅ Document all possible values in Swagger (examples, enums)

### Use Case Handler Pattern

**Command/Query:**
```typescript
// Command (write operation)
export class RegisterUserCommand {
  constructor(
    public readonly request: RegisterUserRequestDto & { ip: string },
  ) {}
}

// Query (read operation)
export class GetUserQuery {
  constructor(
    public readonly userId: number,
  ) {}
}
```

**Handler:**
```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  private readonly logger = new Logger(RegisterUserHandler.name);
  
  constructor(
    // ✅ Inject ports (abstract classes)
    private readonly userRepository: UserPortRepository,
    private readonly authService: AuthJwtService,
  ) {}
  
  async execute(
    command: RegisterUserCommand,
  ): Promise<RegisterUserResponseDto> {
    const { request } = command;
    
    // ✅ Log operation start
    this.logger.log(`Registering user: ${request.email}`);
    
    // ✅ Business logic here
    // - Validate
    // - Call repositories
    // - Transform data
    
    // ✅ Return response DTO
    return {
      token: 'jwt-token',
      user: { id: 1, email: request.email },
    };
  }
}
```

**Key Use Case Rules:**
- ✅ Separate Commands (writes) from Queries (reads)
- ✅ Commands return response DTOs, Queries return domain entities or DTOs
- ✅ Handlers orchestrate business logic
- ✅ Keep handlers focused (<100 lines)
- ✅ Log important operations
- ✅ Inject ports (abstract classes), not concrete implementations
- ✅ Validate in DTO schema, business rules in handler
- ✅ Handle async operations properly (await external calls)

### Complete Flow Example

```
HTTP Request → Controller → Command/Query → Handler → Ports → Infrastructure
     ↓              ↓            ↓             ↓         ↓           ↓
  JSON Body    HTTP DTO    Internal DTO   Business   Repository  Database
                  ↓            ↓          Logic
            Zod Schema   Type-safe
            Validation   TypeScript
```

**File Organization:**
```
application/use-cases/register-user/
├── register-user.command.ts     # Command class
├── register-user.dto.ts         # Zod schema + HTTP DTO + Response DTO
└── register-user.handler.ts     # Handler implementation
```

### Validation Best Practices

**Zod Schema Features:**
```typescript
export const RegisterUserRequestSchema = z.object({
  // ✅ String with regex validation
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format'),
  
  // ✅ Email validation
  email: z.string().email('Invalid email format'),
  
  // ✅ String length constraints
  password: z.string().min(6).max(100),
  
  // ✅ Enum validation
  currency: z.nativeEnum(Currency),
  
  // ✅ Custom refinement
  currencyCode: z.string().refine(
    (code) => validCodes.includes(code),
    { message: 'Invalid currency code' },
  ),
  
  // ✅ Optional fields
  name: z.string().optional(),
  
  // ✅ Transform data
}).transform((data) => ({
  ...data,
  email: data.email?.trim().toLowerCase(),
}));
```

**Reference:**
- Example controller: `apps/users/src/presentation/http/users.http.controller.ts`
- Example DTOs: `apps/users/src/application/use-cases/register-user/register-user.dto.ts`
- Example handler: `apps/users/src/application/use-cases/register-user/register-user.handler.ts`

## Logging Best Practices

**See full guide:** `docs/LOGGING_BEST_PRACTICES.md`

### Key Principles

1. **Structured Logging**: Use objects, not strings
   ```typescript
   // ✅ CORRECT
   this.logger.log('User registered', { userId, operationId, email: maskEmail(email) });
   
   // ❌ WRONG
   this.logger.log(`User ${userId} registered with email ${email}`);
   ```

2. **Logging by Layer**:
   - **Presentation**: Log requests/responses with operationId
   - **Application**: Log operation start/end and critical business steps
   - **Domain**: NO logging (pure business logic)
   - **Infrastructure**: Only critical DB errors and performance issues

3. **Log Levels**:
   - `error` - Unexpected errors requiring attention
   - `warn` - Expected problems (race conditions, retries)
   - `log` - Important business events
   - `debug` - Detailed development info

4. **Always Include**:
   - `operationId` (UUID for request tracing)
   - `userId` (who performed the action)
   - `operation` (what was attempted)
   - `service` (which service)

5. **Never Log**:
   - Passwords, tokens, JWT
   - Full email/phone (use `maskEmail()`, `maskPhone()`)
   - Credit card numbers
   - Any PII without masking

6. **Error Logging**:
   ```typescript
   this.logger.error('Operation failed', {
     operationId,
     userId,
     operation: 'CreateUserBalance',
     error: serializeError(error),
   });
   ```

**Utilities**: Use shared functions from `@lib/shared/logging` (when implemented):
- `maskEmail()`, `maskPhone()`
- `generateOperationId()`
- `serializeError()`
- `createLogContext()`

## TypeScript Type Best Practices - MANDATORY

**CRITICAL RULE:** Function-level type objects, `never`, and `any` types are PROHIBITED.

### Required Pattern

All types and interfaces MUST be defined at the class level or in separate type definition files.

```typescript
// ✅ CORRECT: Interface defined at class level or top of file
interface UserData {
  id: string;
  email: string;
  balance: BigNumber;
}

class UserService {
  processUser(data: UserData): void {
    // implementation
  }
}

// ✅ CORRECT: Type alias at class/file level
type PaymentStatus = 'pending' | 'completed' | 'failed';

class PaymentService {
  getStatus(): PaymentStatus {
    return 'pending';
  }
}
```

### What is FORBIDDEN

```typescript
// ❌ FORBIDDEN: Function-level type object
class UserService {
  processUser(data: { id: string; email: string }): void {  // ❌ NEVER
    // ...
  }
}

// ❌ FORBIDDEN: Returning function-level type object
class UserService {
  getUser(): { id: string; email: string } {  // ❌ NEVER
    return { id: '1', email: 'test@example.com' };
  }
}

// ❌ FORBIDDEN: Using 'any' type
class UserService {
  processData(data: any): void {  // ❌ NEVER
    // ...
  }
}

// ❌ FORBIDDEN: Using 'never' type (except in very specific error cases)
function getData(): never {  // ❌ Avoid unless truly necessary
  throw new Error('Not implemented');
}

// ❌ FORBIDDEN: Function parameter with inline object type
processPayment(payment: { amount: string; currency: Currency }): Promise<void> {  // ❌ NEVER
  // ...
}
```

### Correct Alternatives

```typescript
// ✅ Define interface or type at appropriate level
interface ProcessUserRequest {
  id: string;
  email: string;
}

class UserService {
  processUser(data: ProcessUserRequest): void {
    // ...
  }
}

// ✅ For return types
interface UserResponse {
  id: string;
  email: string;
}

class UserService {
  getUser(): UserResponse {
    return { id: '1', email: 'test@example.com' };
  }
}

// ✅ Use specific types instead of 'any'
interface ProcessDataRequest {
  type: string;
  payload: unknown;  // Use 'unknown' if type truly varies, then narrow with type guards
}

class DataService {
  processData(data: ProcessDataRequest): void {
    // Use type guards to narrow 'unknown'
    if (typeof data.payload === 'string') {
      // Now TypeScript knows it's a string
    }
  }
}
```

### Type Organization

**For small, single-use types:** Define at the top of the file, before the class
**For shared types:** Create separate type definition files in the same directory
**For domain types:** Define in `domain/` layer with entities
**For DTOs:** Define alongside Zod schemas in use-case folders

```
application/use-cases/create-payment/
├── create-payment.command.ts
├── create-payment.dto.ts        # Types and interfaces here
├── create-payment.handler.ts
└── create-payment.types.ts      # Optional: Additional shared types
```

### Code Review Checklist

When reviewing code, verify:
- [ ] NO inline object types in function signatures
- [ ] NO `any` type usage (use `unknown` with type guards if needed)
- [ ] NO `never` type (except for functions that genuinely never return)
- [ ] ALL types/interfaces defined at class level or in separate files
- [ ] Types are properly named and descriptive
- [ ] Shared types are extracted to reusable definitions

## Common Pitfalls

- **DO NOT** put business logic in application or infrastructure layers
- **DO NOT** use Prisma directly from handlers - use repositories via ports
- **DO NOT** hardcode NATS subjects - always use library contracts
- **DO NOT** define ports as interfaces - use abstract classes for NestJS DI
- **DO NOT** access other services' databases directly - use NATS communication
- **DO NOT** forget to run `npm run test:db:create` before first test run
- **DO NOT** mix test and development databases - they use separate URLs
- **DO NOT** use `bigint` in domain/application code - always use `BigNumber`
- **DO NOT** use `BigInt()` constructor or manual `.toString()` conversions - use utility functions
- **DO NOT** use `number` type for user IDs or amounts in DTOs - always use `string` to avoid precision loss
- **DO NOT** skip tests - every layer component requires specific test types (see Testing Strategy)
- **DO NOT** use real NATS in integration tests for NATS controllers - mock NATS infrastructure
- **DO NOT** skip integration tests for HTTP controllers - use `supertest` for full HTTP cycle testing
- **CRITICAL - DO NOT** use ANY currency strings, custom enums, or constants - ONLY `Currency` from `@lib/shared/currency`
- **CRITICAL - DO NOT** use ANY language strings, custom enums, or constants - ONLY `Language` from `@lib/shared/language`
- **CRITICAL - DO NOT** use `z.enum(['USD', 'EUR'])` - use `z.nativeEnum(Currency)`
- **CRITICAL - DO NOT** create custom Currency or Language types/enums/constants anywhere
- **CRITICAL - DO NOT** hardcode 'USD', 'EUR', 'BDT', 'usd', 'eur', 'en', 'bn' or any currency/language strings
- **CRITICAL - DO NOT** use function-level inline object types in signatures - define interfaces/types at class/file level
- **CRITICAL - DO NOT** use `any` type - use `unknown` with type guards or specific types
- **CRITICAL - DO NOT** use `never` type except for functions that genuinely never return

## Environment Configuration

Copy `.env.example` to `.env` and configure:

- Database URLs for each service (7 separate databases)
- NATS cluster servers (3 nodes for HA)
- Redis URL
- JWT secret
- Service ports (3000-3006)
- API prefixes (default: `api/v2/{service}`)

**CRITICAL RULE: All Environment Variables MUST be Registered in Shared Schema**

Every new environment variable MUST be added directly to `/libs/shared/src/application/env/env.ts` with Zod validation.

```typescript
// ✅ CORRECT: Add to env.ts schema
export const commonSchema = z.object({
  // ... existing variables
  
  // New environment variable with validation
  SLOTEGRATOR_BASE_URL: z.string().optional(),
  SLOTEGRATOR_MERCHANT_ID: z.string().optional(),
  SLOTEGRATOR_MERCHANT_KEY: z.string().optional(),
});

// ❌ WRONG: Using environment variables without registering in schema
const apiKey = process.env.SOME_API_KEY; // ❌ Not validated
```

**Why This is Critical:**
1. **Type Safety**: All environment variables are typed via `z.infer<typeof commonSchema>`
2. **Validation**: Zod validates required variables and formats on application startup
3. **Documentation**: Schema serves as single source of truth for all env vars
4. **Consistency**: All services use the same env variable definitions

**Workflow:**
1. Add variable to `.env.local` and `.env.dev` files
2. Add variable to `/libs/shared/src/application/env/env.ts` schema with appropriate Zod validation
3. Use the validated variable via the EnvService in your application code

## Documentation References

- Clean Architecture: `docs/games/docs/architecture/CLEAN-ARCHITECTURE.md`
- Domain Layer: `tech-doc/layers/DOMAIN_LAYER.md`
- NATS Request-Reply: `tech-doc/communication/NATS_REQUEST_REPLY.md`
- NATS Pub/Sub: `tech-doc/communication/NATS_MESSAGING.md`
- Testing Guide: `docs/TESTING_GUIDE.md`
- Testing Quick Start: `docs/TESTING_README.md`
- Service-specific tests: `apps/{service}/TESTING-README.md`
