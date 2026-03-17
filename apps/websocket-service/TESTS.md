# websocket-service - TESTS

## Test Commands

- Unit: `npm run test:websocket-service:unit`
- Integration: `npm run test:websocket-service:integration`
- E2E: `npm run test:websocket-service:e2e`

## E2E Scenarios

- `test/e2e/basic-flow.e2e-spec.ts` — TASK-3.1: базовый E2E флоу (register → JWT → matchmaking → WS → echo → disconnect)
- `test/e2e/reconnect-flow.e2e-spec.ts` — TASK-3.2: реконнект (grace success / GRACE_EXPIRED)

## Rule

- Every new/updated test in this service must be reflected in this file.
