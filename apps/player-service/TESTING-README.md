# Users App - Test Suite Documentation

## Overview

This document provides a comprehensive overview of all tests in the Users app, categorized by test type (Unit, Integration, E2E). The Users app follows Clean Architecture principles with strict layer separation: Domain → Application → Infrastructure → Presentation.

For general testing information, see:
- [Testing Quick Start Guide](../../docs/TESTING_README.md)
- [Comprehensive Testing Guide](../../docs/TESTING_GUIDE.md)

---

## **Test File Naming Convention**

All test files follow the naming convention:
- **Unit tests**: `*.unit.spec.ts`
- **Integration tests**: `*.integration.spec.ts`
- **E2E tests**: Located in root `/e2e` folder

---

## **Unit Tests (13 files)**

Unit tests test individual components in isolation with all dependencies mocked. They focus on business logic, validation, and error handling.

### 1. `users.http.controller.unit.spec.ts` (11 tests)
**Location**: `src/presentation/http/users.http.controller.unit.spec.ts`

**Purpose**: Tests HTTP controller routing, request handling, and IP extraction logic without database or external dependencies.

**What is Tested**:
- Controller routing and CQRS bus integration (CommandBus/QueryBus)
- IP extraction from various HTTP headers and request properties
- Fallback mechanisms for IP extraction
- Request/response flow through controller
- Profile retrieval endpoint
- Currency and language listing endpoints

**Key Tests**:

**POST /register**:
- `should call commandBus.execute with RegisterUserCommand` - Verifies register endpoint delegates to CommandBus
- `should extract IP from X-Forwarded-For header` - Tests proxy/load balancer IP extraction
- `should extract IP from X-Real-IP header` - Tests alternative IP header
- `should fallback to request.ip if headers not present` - Tests fallback chain
- `should fallback to socket.remoteAddress if ip not present` - Tests socket fallback
- `should use default IP if none available` - Tests final fallback to '0.0.0.0'

**POST /login**:
- `should call queryBus.execute with LoginUserQuery` - Verifies login endpoint delegates to QueryBus
- `should extract IP from request for login` - Tests IP extraction for login flow

**GET /profile**:
- `should call queryBus.execute with GetProfileQuery` - Verifies profile endpoint delegates to QueryBus with session user ID

**GET /currencies**:
- `should return list of currencies` - Tests currency listing endpoint returns all available currencies with proper structure

**GET /languages**:
- `should return list of languages` - Tests language listing endpoint returns all available languages with proper structure

**Dependencies Mocked**:
- CommandBus
- QueryBus

---

### 2. `register-user.handler.unit.spec.ts` (6 tests)
**Location**: `src/application/use-cases/register-user/register-user.handler.unit.spec.ts`

**Purpose**: Tests user registration business logic and validation without database or external service calls.

**What is Tested**:
- User registration flow orchestration
- Duplicate user detection (email/phone)
- Currency and language ISO code validation
- Balance service integration (mocked)
- Error handling for various failure scenarios

**Key Tests**:
- `should register user successfully` - Tests complete registration flow with all dependencies mocked
- `should reject duplicate email` - Tests conflict detection for existing email
- `should reject duplicate phone` - Tests conflict detection for existing phone
- `should reject invalid currency ISO code` - Tests currency validation against shared library
- `should reject invalid language ISO code` - Tests language validation against shared library
- `should handle balance creation failure gracefully` - Tests error handling when balance service fails

**Dependencies Mocked**:
- UserPortRepository
- TrackingPortRepository
- BalancePublisher
- AuthJwtService
- EnvService

**Note**: The actual handler uses PrismaService directly for transactions, but the unit test mocks repository ports to test business logic in isolation.

---

### 3. `login-user.handler.unit.spec.ts` (6 tests)
**Location**: `src/application/use-cases/login-user/login-user.handler.unit.spec.ts`

**Purpose**: Tests user login business logic, authentication, and authorization without database.

**What is Tested**:
- User lookup by email or phone
- Password verification
- Banned user detection
- Tracking IP update
- JWT token generation
- Error handling for authentication failures

**Key Tests**:
- `should login user successfully with email` - Tests login flow with email credential
- `should login user successfully with phone` - Tests login flow with phone credential
- `should reject login for non-existent user` - Tests unauthorized exception for invalid user
- `should reject login for banned user` - Tests authorization check for banned accounts
- `should reject login with wrong password` - Tests password verification
- `should handle tracking update failure gracefully` - Tests that login succeeds even if tracking update fails

**Dependencies Mocked**:
- UserPortRepository
- TrackingPortRepository
- AuthJwtService
- EnvService

---

### 4. `get-profile.handler.unit.spec.ts` (6 tests)
**Location**: `src/application/use-cases/get-profile/get-profile.handler.unit.spec.ts`

**Purpose**: Tests user profile retrieval business logic without database.

**What is Tested**:
- User profile retrieval by ID
- String to BigNumber to number conversion for repository calls
- Birthday date formatting (ISO string)
- Optional field handling
- Error handling for non-existent users

**Key Tests**:
- `should return user profile successfully` - Tests complete profile retrieval with all fields
- `should return profile with birthday in ISO format` - Tests birthday date serialization
- `should return profile with undefined birthday when not set` - Tests optional birthday handling
- `should throw NotFoundException when user not found` - Tests error handling for invalid user ID
- `should convert string userId to number for repository call` - Tests ID conversion logic
- `should handle user with only required fields` - Tests partial user data handling

**Dependencies Mocked**:
- UserPortRepository

---

### 5. `update-banned-users-cache.handler.unit.spec.ts` (6 tests)
**Location**: `src/application/use-cases/update-banned-users-cache/update-banned-users-cache.handler.unit.spec.ts`

**Purpose**: Tests banned users cache update business logic without database or Redis.

**What is Tested**:
- Banned users retrieval from repository
- Redis cache clearing and population
- User ID to string conversion for cache storage
- Error handling for repository and Redis failures
- Cache update order (clear before populate)

**Key Tests**:
- `should update banned users cache successfully with banned users` - Tests complete cache update flow
- `should update cache successfully with no banned users` - Tests empty banned users list handling
- `should convert user IDs to strings for cache` - Tests BigNumber to string conversion
- `should handle repository errors` - Tests database error propagation
- `should handle Redis errors` - Tests Redis error propagation
- `should clear cache before populating` - Tests cache update order

**Dependencies Mocked**:
- UserPortRepository
- RedisService

---

### 6. `user.prisma.mapper.unit.spec.ts` (20+ tests)
**Location**: `src/infrastructure/prisma/mapper/user.prisma.mapper.unit.spec.ts`

**Purpose**: Tests bidirectional mapping between Prisma entities and Domain entities, including type conversions.

**What is Tested**:
- Prisma → Domain entity conversion (`toDomain`)
- Domain → Prisma input conversion (`toPrisma`)
- List conversion (`toDomainList`)
- BigNumber ↔ bigint conversions for user IDs
- Null/undefined handling for optional fields
- BanReason enum mapping
- Empty string to null conversions

**Key Test Categories**:
- `toDomain`: 
  - Maps all Prisma user fields to domain user
  - Converts null values to undefined for optional fields
  - Converts bigint ID to BigNumber
  - Handles BanReason enum conversion
- `toPrisma`:
  - Maps domain user to Prisma create input
  - Converts undefined to null for optional fields
  - Handles all optional field types (email, phone, name, etc.)
- `toDomainList`:
  - Maps array of Prisma users to array of domain users
- Null/undefined conversions for: email, phone, name, country, birthday, banReason, banComment, banTime
- BanReason enum conversions between Prisma and domain

**Dependencies**: None (pure mapping functions)

---

### 7. `tracking.prisma.mapper.unit.spec.ts` (20+ tests)
**Location**: `src/infrastructure/prisma/mapper/tracking.prisma.mapper.unit.spec.ts`

**Purpose**: Tests bidirectional mapping between Prisma tracking entities and Domain tracking entities.

**What is Tested**:
- Prisma → Domain entity conversion (`toDomain`)
- Domain → Prisma input conversion (`toPrisma`)
- List conversion (`toDomainList`)
- BigNumber ↔ bigint conversions for userId
- Null/undefined handling for all optional tracking fields

**Key Test Categories**:
- `toDomain`:
  - Maps all Prisma tracking fields to domain tracking
  - Converts bigint userId to BigNumber
  - Converts null values to undefined for optional fields
- `toPrisma`:
  - Maps domain tracking to Prisma create input
  - Converts BigNumber userId to bigint
  - Converts undefined to null for optional fields
- `toDomainList`:
  - Maps array of Prisma tracking to array of domain tracking
- Null/undefined conversions for: gaClientId, yaClientId, clickId, utmMedium, utmSource, utmCampaign, pid, sub1, sub2, sub3

**Dependencies**: None (pure mapping functions)

---

### 8. `user.unit.spec.ts` (13 tests)
**Location**: `src/domain/entities/user/user.unit.spec.ts`

**Purpose**: Tests User domain entity validation, business logic, and domain methods.

**What is Tested**:
- Entity creation validation (email/phone requirement, password hash, language/currency codes)
- Ban management operations (ban, unban, isBanned)
- Test user management (isTestUser, setTestUser)
- Property getters
- Business rule enforcement

**Key Test Categories**:
- `Creation`:
  - Valid user creation with all fields
  - User with only email
  - User with only phone
  - Validation errors: missing email/phone, empty password hash, empty language/currency codes
- `Ban Management`:
  - Checking ban status
  - Banning user with reason and comment
  - Unbanning user (clears ban reason, comment, time)
- `Test User Management`:
  - Checking test user status
  - Setting test user flag
- `Getters`:
  - All property accessors return correct values

**Dependencies**: None (pure domain logic)

---

### 9. `tracking.unit.spec.ts` (12 tests)
**Location**: `src/domain/entities/tracking/tracking.unit.spec.ts`

**Purpose**: Tests Tracking domain entity validation, business logic, and domain methods.

**What is Tested**:
- Entity creation validation (IP addresses, userId)
- IP address update method (`updateLastIp`)
- Property getters
- Business rule enforcement

**Key Test Categories**:
- `Creation`:
  - Valid tracking creation with all fields
  - Valid tracking with optional fields
  - Validation errors: empty first IP, empty last IP, whitespace-only IPs, invalid userId (zero, negative)
- `Domain Methods`:
  - `updateLastIp` with valid IP
  - `updateLastIp` validation errors (empty IP, whitespace-only IP)
- `Getters`:
  - All property accessors return correct values
  - Optional fields return undefined when not provided

**Dependencies**: None (pure domain logic)

---

### 11. `attach-email.handler.unit.spec.ts` (6 tests)
**Location**: `src/application/use-cases/attach-email/attach-email.handler.unit.spec.ts`

**Purpose**: Tests email attachment business logic and validation without database.

**What is Tested**:
- Email attachment flow orchestration
- User existence validation
- Duplicate email detection (user already has email)
- Email uniqueness validation (email taken by another user)
- String to BigNumber to number conversion for repository calls
- Error handling for various failure scenarios

**Key Tests**:
- `should attach email successfully` - Tests complete email attachment flow with all dependencies mocked
- `should throw NotFoundException when user not found` - Tests error handling for invalid user ID
- `should throw BadRequestException when user already has email` - Tests conflict detection for existing email on user
- `should throw ConflictException when email is already taken` - Tests conflict detection for email taken by another user
- `should convert string userId to number for repository calls` - Tests ID conversion logic
- `should handle user with only phone (no email)` - Tests email attachment for phone-only users

**Dependencies Mocked**:
- UserPortRepository

---

### 12. `attach-phone.handler.unit.spec.ts` (6 tests)
**Location**: `src/application/use-cases/attach-phone/attach-phone.handler.unit.spec.ts`

**Purpose**: Tests phone attachment business logic and validation without database.

**What is Tested**:
- Phone attachment flow orchestration
- User existence validation
- Duplicate phone detection (user already has phone)
- Phone uniqueness validation (phone taken by another user)
- String to BigNumber to number conversion for repository calls
- Error handling for various failure scenarios

**Key Tests**:
- `should attach phone successfully` - Tests complete phone attachment flow with all dependencies mocked
- `should throw NotFoundException when user not found` - Tests error handling for invalid user ID
- `should throw BadRequestException when user already has phone` - Tests conflict detection for existing phone on user
- `should throw ConflictException when phone is already taken` - Tests conflict detection for phone taken by another user
- `should convert string userId to number for repository calls` - Tests ID conversion logic
- `should handle user with only email (no phone)` - Tests phone attachment for email-only users

**Dependencies Mocked**:
- UserPortRepository

---

### 13. `update-profile.handler.unit.spec.ts` (8 tests)
**Location**: `src/application/use-cases/update-profile/update-profile.handler.unit.spec.ts`

**Purpose**: Tests user profile update business logic without database.

**What is Tested**:
- Profile update flow orchestration (name, birthday, or both)
- User existence validation
- String to BigNumber to number conversion for repository calls
- Birthday string to Date object conversion
- Optional field handling (undefined birthday)
- Partial update handling (only update provided fields)
- Error handling for non-existent users

**Key Tests**:
- `should update profile with name successfully` - Tests name update flow
- `should update profile with birthday successfully` - Tests birthday update flow with date conversion
- `should update profile with both name and birthday` - Tests combined update flow
- `should throw NotFoundException when user not found` - Tests error handling for invalid user ID
- `should convert string userId to number for repository calls` - Tests ID conversion logic
- `should handle undefined birthday in response` - Tests optional birthday handling
- `should convert birthday string to Date object` - Tests date conversion logic
- `should only update provided fields` - Tests partial update behavior

**Dependencies Mocked**:
- UserPortRepository

---

### 14. `users.nats.controller.unit.spec.ts` (4 tests)
**Location**: `src/presentation/nats/users.nats.controller.unit.spec.ts`

**Purpose**: Tests NATS message handler routing and error handling without NATS infrastructure.

**What is Tested**:
- NATS message pattern handling
- CommandBus integration
- Response forwarding
- Error propagation

**Key Tests**:
- `should call commandBus.execute with UpdateBannedUsersCacheCommand` - Tests NATS handler delegates to CommandBus
- `should return response from command handler` - Tests response forwarding
- `should propagate errors from command handler` - Tests error handling
- `should handle empty banned users list` - Tests edge case handling

**Dependencies Mocked**:
- CommandBus

---

## **Integration Tests (3 files)**

Integration tests use real database connections and test the full stack from HTTP endpoints or repository operations down to the database.

### 1. `users.http.controller.integration.spec.ts` (14 tests)
**Location**: `src/presentation/http/users.http.controller.integration.spec.ts`

**Purpose**: Tests full HTTP endpoint integration with real database, validation pipeline, and external service mocks.

**What is Tested**:
- Complete HTTP request/response cycle
- Database persistence
- Zod validation pipeline
- Error handling and HTTP status codes
- JWT token generation
- Balance service integration (mocked)

**Key Test Categories**:

**POST /api/v2/users/register**:
- `should register a new user` - Tests successful registration with all fields
- `should register user with only email` - Tests registration with email only
- `should register user with only phone` - Tests registration with phone only
- `should reject duplicate email` - Tests 409 Conflict for existing email
- `should reject invalid email format` - Tests 400 Bad Request for invalid email
- `should reject invalid currency ISO code` - Tests 400 for invalid currency
- `should reject invalid language ISO code` - Tests 400 for invalid language
- `should reject password that is too short` - Tests 400 for password validation
- `should reject request without email or phone` - Tests 400 for missing credentials

**POST /api/v2/users/login**:
- `should login user with email` - Tests successful login with email
- `should login user with phone` - Tests successful login with phone
- `should reject login with wrong password` - Tests 401 Unauthorized for wrong password
- `should reject login for non-existent user` - Tests 401 for invalid user
- `should reject login without email or phone` - Tests 400 for missing credentials

**Dependencies**:
- Real PostgreSQL database (test database)
- Mocked BalancePublisher
- Real PrismaService
- Real JWT service

**Setup**: Uses `supertest` for HTTP testing, real NestJS application with test database.

---

### 2. `user.prisma.repository.integration.spec.ts` (20+ tests)
**Location**: `src/infrastructure/prisma/repositories/user.prisma.repository.integration.spec.ts`

**Purpose**: Tests database repository operations with real Prisma and PostgreSQL database.

**What is Tested**:
- Database CRUD operations
- BigNumber ↔ bigint conversions for user IDs
- Prisma query execution
- Data persistence and retrieval
- Foreign key relationships
- Transaction behavior

**Key Test Categories**:

**create**:
- `should create a user with all fields` - Tests creation with complete user data
- `should create a user with only email` - Tests optional phone field
- `should create a user with only phone` - Tests optional email field
- `should create a banned user with ban details` - Tests ban-related fields

**findById**:
- `should find user by id` - Tests ID-based lookup
- `should return null if user not found` - Tests null handling

**findByEmail**:
- `should find user by email` - Tests email-based lookup
- `should return null if email not found` - Tests null handling

**findByPhone**:
- `should find user by phone` - Tests phone-based lookup
- `should return null if phone not found` - Tests null handling

**findByEmailOrPhone**:
- `should find user by email when email is provided` - Tests email priority
- `should find user by phone when phone is provided and email not found` - Tests phone fallback
- `should find user by phone when only phone is provided` - Tests phone-only lookup
- `should prioritize email over phone when both are provided` - Tests priority logic
- `should return null when neither email nor phone match` - Tests null handling
- `should return null when both email and phone are undefined` - Tests edge case

**update**:
- `should update user with partial data` - Tests partial updates
- `should update user email to null` - Tests field clearing
- `should update user phone to null` - Tests field clearing
- `should update user ban status` - Tests ban-related updates
- `should unban user` - Tests unban operation
- `should update password hash` - Tests password updates
- `should update multiple fields at once` - Tests bulk updates
- `should handle empty string as null for optional fields` - Tests empty string handling

**Dependencies**:
- Real PostgreSQL database (test database)
- Real PrismaService
- InfrastructureModule

**Note**: Tests convert BigNumber IDs to number for repository calls (port interface uses number, but domain uses BigNumber).

---

### 3. `tracking.prisma.repository.integration.spec.ts` (10+ tests)
**Location**: `src/infrastructure/prisma/repositories/tracking.prisma.repository.integration.spec.ts`

**Purpose**: Tests database repository operations for tracking entities with real Prisma and PostgreSQL.

**What is Tested**:
- Database CRUD operations for tracking
- BigNumber ↔ bigint conversions for userId
- Foreign key relationships with User table
- Upsert operations
- Data persistence

**Key Test Categories**:

**create**:
- `should create tracking with all fields` - Tests creation with complete tracking data
- `should create tracking with only required fields` - Tests minimal creation
- `should create tracking with partial optional fields` - Tests selective optional fields

**findByUserId**:
- `should find tracking by user id` - Tests userId-based lookup
- `should return null if tracking not found for user` - Tests null handling
- `should return null for non-existent user id` - Tests invalid userId handling

**updateLastIp**:
- `should update last IP address` - Tests IP update operation
- `should update last IP multiple times` - Tests multiple updates
- `should preserve optional fields when updating last IP` - Tests field preservation during upsert

**Integration with User**:
- `should create tracking for existing user` - Tests foreign key relationship
- `should handle multiple trackings for different users` - Tests multi-user scenarios

**Dependencies**:
- Real PostgreSQL database (test database)
- Real PrismaService
- Real UserPortRepository (for creating test users)
- InfrastructureModule

**Note**: Tests use BigNumber for userId in domain, converted to bigint for Prisma queries.

---

## **Test Statistics**

| Test Type | Files | Approximate Tests | Coverage |
|-----------|-------|-------------------|----------|
| Unit Tests | 13 | ~140+ | Domain entities, mappers, handlers, controllers (HTTP + NATS) |
| Integration Tests | 3 | ~45+ | HTTP endpoints, repositories, database operations |
| **Total** | **16** | **~185+** | **All layers covered** |

**Note**: E2E tests have been moved to the root `/e2e` folder. See [Testing Quick Start Guide](../../docs/TESTING_README.md) for E2E test information.

---

## **Test Coverage Summary**

### **Unit Tests Cover**:
- ✅ **Domain Layer**: 
  - User entity (validation, business logic, ban management, test user management)
  - Tracking entity (validation, IP updates)
- ✅ **Application Layer**:
  - RegisterUserHandler (registration flow, validation, error handling)
  - LoginUserHandler (authentication, authorization, error handling)
  - GetProfileHandler (profile retrieval, ID conversion, date formatting)
  - UpdateBannedUsersCacheHandler (cache management, Redis operations)
  - AttachEmailHandler (email attachment, validation, conflict detection)
  - AttachPhoneHandler (phone attachment, validation, conflict detection)
  - UpdateProfileHandler (profile update, date conversion, partial updates)
- ✅ **Infrastructure Layer**:
  - UserPrismaMapper (Prisma ↔ Domain conversions, BigNumber handling)
  - TrackingPrismaMapper (Prisma ↔ Domain conversions, BigNumber handling)
- ✅ **Presentation Layer**:
  - UsersHttpController (routing, IP extraction, CQRS integration, profile/currencies/languages endpoints)
  - UsersNatsController (NATS message handling, CommandBus integration)

### **Integration Tests Cover**:
- ✅ **HTTP Layer**:
  - Full HTTP request/response cycle
  - Zod validation pipeline
  - Error handling and status codes
  - JWT token generation
- ✅ **Repository Layer**:
  - Database CRUD operations
  - BigNumber ↔ bigint conversions
  - Foreign key relationships
  - Transaction behavior
- ✅ **Database**:
  - Data persistence
  - Query execution
  - Constraint validation

**Note**: E2E tests covering cross-app integration, NATS messaging, and complete user journeys are located in the root `/e2e` folder.

---

## **Missing Tests / Future Improvements**

The following components currently do not have dedicated tests but are covered indirectly:

1. **NATS Integration Tests**: `users.nats.controller.integration.spec.ts` - Should test real NATS.io message handling with actual NATS cluster
2. **Get Currencies/Languages Handlers**: These are simple static data endpoints, currently tested via HTTP controller unit tests
3. **HTTP Integration Tests for Attach Email/Phone/Update Profile**: These endpoints are tested via unit tests but could benefit from integration tests with real database

All critical business logic, domain entities, use case handlers, mappers, and repositories are fully tested. All use case handlers now have comprehensive unit test coverage.

---

## **Running Tests**

### Prerequisites

1. **Test Database Setup**: 
   ```bash
   npm run test:db:create:users
   ```
   This creates the test database if it doesn't exist.

2. **Environment Variables**: 
   - `DATABASE_URL` - Test database connection string
   - `JWT_SECRET` - JWT secret for token generation (for integration tests)

### Unit Tests

Run all unit tests:
```bash
npm run test:users:unit
```

Or using workspace:
```bash
npm run test:unit --workspace=@app/player-service
```

### Integration Tests

Run all integration tests:
```bash
npm run test:users:integration
```

Or using workspace:
```bash
npm run test:integration --workspace=@app/player-service
```

**Note**: Integration tests require the test database to be set up and running.

### All Tests

Run both unit and integration tests:
```bash
npm run test:users
```

Or using workspace:
```bash
npm run test --workspace=@app/player-service
```

### E2E Tests

E2E tests are located in the root `/e2e` folder. Run them with:
```bash
npm run test:e2e
```

E2E tests require:
- All services running (users, balance, etc.)
- NATS cluster running
- Multiple database connections
- Test databases for all services

---

## **Test Dependencies**

### Unit Tests
- **No external dependencies** - All dependencies are mocked
- **Jest** - Testing framework
- **@nestjs/testing** - NestJS testing utilities

### Integration Tests
- **PostgreSQL Database** - Test database connection (configured in `prisma.test.config.ts`)
- **PrismaService** - Real Prisma client for database operations
- **JWT Secret** - For token generation/validation in HTTP integration tests
- **BalancePublisher** - Mocked for HTTP integration tests (real service not required)

### E2E Tests (in `/e2e`)
- **NATS Cluster** - For inter-service communication
- **Multiple Databases** - Test databases for users, balance, payments, etc.
- **All Services Running** - Users, balance, payments, games, etc.

---

## **Test Architecture**

### Clean Architecture Compliance

Tests follow the same Clean Architecture principles as the application:

1. **Domain Tests** (`domain/entities/*.unit.spec.ts`):
   - Pure business logic
   - No framework dependencies
   - No database dependencies
   - Test validation and domain methods

2. **Application Tests** (`application/use-cases/*/*.unit.spec.ts`):
   - Test use case handlers
   - Mock all ports (repositories, external services)
   - Test business flow orchestration
   - Test error handling

3. **Infrastructure Tests**:
   - **Mapper Tests** (`infrastructure/prisma/mapper/*.unit.spec.ts`): Test Prisma ↔ Domain conversions
   - **Repository Tests** (`infrastructure/prisma/repositories/*.integration.spec.ts`): Test database operations with real Prisma

4. **Presentation Tests**:
   - **Controller Unit Tests** (`presentation/http/*.unit.spec.ts`): Test routing and request handling
   - **Controller Integration Tests** (`presentation/http/*.integration.spec.ts`): Test full HTTP stack

### Type Safety

- **BigNumber**: Domain entities use `BigNumber` for IDs and amounts
- **bigint**: Prisma uses `bigint` for database columns
- **number**: Repository port interfaces use `number` (converted from/to BigNumber in tests)
- **Conversions**: Tests use `bigNumberToBigInt()` and `bigIntToBigNumber()` utilities from `@lib/shared`

---

## **Common Test Patterns**

### Fixtures

All tests use `UserFixtures` from `src/__fixtures__/user.fixtures.ts`:
- `createUser()` - Creates domain User entity
- `createRegisterUserDto()` - Creates registration DTO
- `createLoginUserDto()` - Creates login DTO
- `createBannedUser()` - Creates banned user
- `createTestUser()` - Creates test user
- `createTracking()` - Creates domain Tracking entity

### Mocking Patterns

**Unit Tests**:
- Mock all ports (abstract classes) using `jest.Mocked<>`
- Mock external services (BalancePublisher, AuthJwtService)
- Use `Test.createTestingModule()` for NestJS dependency injection

**Integration Tests**:
- Use real database connections
- Mock external services only (BalancePublisher for HTTP tests)
- Use real PrismaService and repositories

### Database Cleanup

Integration tests clean up data in `beforeEach`:
```typescript
beforeEach(async () => {
  await prisma.tracking.deleteMany({});
  await prisma.user.deleteMany({});
});
```

---

## **Troubleshooting**

### Test Database Issues

If integration tests fail with database connection errors:
1. Ensure test database exists: `npm run test:db:create:users`
2. Check `DATABASE_URL` in test environment
3. Verify PostgreSQL is running

### Type Errors

If you see BigNumber/number/bigint type errors:
- Domain entities use `BigNumber`
- Repository ports use `number` (convert with `.toNumber()`)
- Prisma uses `bigint` (convert with `bigNumberToBigInt()`)

### Mock Issues

If unit tests fail with mock errors:
- Ensure all dependencies are properly mocked
- Check that mock return values match expected types
- Verify mock function calls match actual handler usage

---

## **Contributing**

When adding new tests:

1. **Follow naming convention**: `*.unit.spec.ts` or `*.integration.spec.ts`
2. **Use fixtures**: Create test data using `UserFixtures`
3. **Mock dependencies**: Unit tests should mock all external dependencies
4. **Test real database**: Integration tests should use real database
5. **Update this README**: Document new tests in this file
6. **Maintain coverage**: Ensure new code has corresponding tests

---

## **References**

- [Clean Architecture Rules](../../.cursorrules)
- [Testing Guide](../../docs/TESTING_GUIDE.md)
- [BigNumber Best Practices](../../docs/BIGNUMBER_BEST_PRACTICES.md)
- [Currency/Language Usage](../../docs/CURRENCY_LANGUAGE_USAGE.md)
