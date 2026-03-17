# history-service

## Overview

Microservice for match history and replay storage: records finished matches, serves history and replays.

## Current (Phase 1 Template)

- Clean Architecture: domain, application, infrastructure, presentation
- Entities: MatchHistory, Replay (extend Entity<Props>)
- Ports: MatchHistoryPortRepository (abstract class)
- In-memory stub repository
- Use-cases: GetMatchHistoryQuery, HandleMatchFinishedCommand
- HTTP: GET /history/:matchId
- NATS: subscribed to GameplaySubjects.MATCH_FINISHED (match.finished)

## Future

- Prisma persistence for match history and replays
- Replay storage (blob/JSON)
- NATS integration for replay requests

## Environment

| Variable              | Default | Description     |
| --------------------- | ------- | --------------- |
| HISTORY_APP_PORT     | 3012    | HTTP server     |
| HISTORY_APP_HTTP_PREFIX | api/v1  | URL path prefix |
