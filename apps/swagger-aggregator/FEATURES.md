# swagger-aggregator

## Overview

HTTP-only service that aggregates OpenAPI specifications from all services and exposes a unified Swagger UI and `/openapi.json` endpoint.

## Current (Phase 1 Template)

- Stub `GET /openapi.json` returning minimal OpenAPI 3.0 document
- No domain/application/infrastructure layers
- Health and metrics endpoints via shared ApplicationBootstrapBuilder

## Future

- Fetch OpenAPI specs from each service
- Merge into single document
- Serve Swagger UI at `/docs`

## Environment

| Variable                | Default   | Description      |
| ----------------------- | --------- | ----------------- |
| SWAGGER_APP_PORT        | 3000      | HTTP server port  |
| SWAGGER_APP_HTTP_PREFIX  | api/v1    | URL path prefix   |
