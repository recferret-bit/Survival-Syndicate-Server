# scheduler-service

## Overview

Microservice for scheduled and periodic tasks: passive income, job reset, shop rotation, leaderboards. Uses Bull/BullMQ (Redis) for job queues.

## Current (Phase 1 Template)

- Clean Architecture: domain, application, infrastructure, presentation
- Entity: ScheduledJob (extends Entity<Props>)
- Ports: ScheduledJobPortRepository (abstract class)
- Bull Queue stubs: passive-income, job-reset, shop-rotation, leaderboard
- In-memory stub repository
- Stub HTTP: GET /jobs?queue=<name>
- Stub NATS controller (placeholder)

## Future

- Cron jobs scheduling
- Worker processors for each queue
- Prisma + Postgres persistence for job history
- NATS integration for notifications
- Bull Board dashboard

## Environment

| Variable                | Default | Description     |
| ----------------------- | ------- | --------------- |
| SCHEDULER_APP_PORT      | 3009    | HTTP server     |
| SCHEDULER_APP_HTTP_PREFIX | api/v1  | URL path prefix |
| REDIS_URL               | redis://localhost:6379 | Bull queues |
