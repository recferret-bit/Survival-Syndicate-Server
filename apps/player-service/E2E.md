# Users Service - E2E Tests

The Users service participates in cross-service E2E tests. It provides user registration and authentication used by all E2E flows.

## Participating Test Suites

| Suite | Run Command | Role |
|-------|-------------|------|
| Payments E2E | `npm run test:payments:e2e` | User registration, JWT auth for deposit/withdrawal |
| Bonus E2E | `npm run test:bonus:e2e` | User registration, JWT auth for deposit and bonus flows |

## What Is Tested

- User registration (email, password, currency, language)
- JWT token issuance
- Session extraction for authenticated requests
- Validation (invalid email, short password)
- Rejection of unauthenticated requests

## Prerequisites

- All services running (`docker-compose up -d` or `npm run start:local`)
- Databases migrated and seeded
