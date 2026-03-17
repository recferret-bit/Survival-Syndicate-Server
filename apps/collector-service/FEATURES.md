# collector-service

## Overview

Microservice for ingesting analytics events and persisting them to ClickHouse. No domain layer — works with raw event payloads.

## Current (Phase 1 Template)

- Structure without domain: application (ports), infrastructure, presentation
- ClickHousePortRepository (abstract class)
- ClickHouseStubRepository — logs events, no real ClickHouse
- NATS: subscribed to `CollectorSubjects.PUBLISH_EVENT` from @lib/lib-collector
- analytics.nats.controller.ts — receives events, inserts via repository

## Future

- Real ClickHouse client (e.g. @clickhouse/client)
- CLICKHOUSE_URL from env
- Batch inserts, buffer/flush
- Event schema validation, partitioning
- HTTP ingest endpoint (optional)

## Environment

| Variable              | Default | Description     |
| --------------------- | ------- | --------------- |
| COLLECTOR_APP_PORT    | 3010    | HTTP server     |
| COLLECTOR_APP_HTTP_PREFIX | api/v1  | URL path prefix |
