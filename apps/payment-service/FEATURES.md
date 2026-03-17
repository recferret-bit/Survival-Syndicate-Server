# payment-service

## Overview

Microservice for IAP (In-App Purchase) validation: Apple App Store, Google Play Store.

## Current (Phase 1 Template)

- Clean Architecture: domain, application, infrastructure, presentation
- Entity: Purchase (extends Entity<Props>)
- Ports: AppleIAPPort, GooglePlayIAPPort (abstract classes)
- Stub adapters for Apple and Google Play
- Use-case: ValidatePaymentCommand + handler
- HTTP: POST /payment/validate (receipt, productId, platform, characterId)

## Future

- Real Apple Server API validation
- Real Google Play Developer API validation
- Prisma + purchase history persistence
- NATS events for validated purchases

## Environment

| Variable              | Default | Description     |
| --------------------- | ------- | --------------- |
| PAYMENT_APP_PORT      | 3011    | HTTP server     |
| PAYMENT_APP_HTTP_PREFIX | api/v1  | URL path prefix |
