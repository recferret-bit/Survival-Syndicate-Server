# Architecture Guide — Survival Syndicate Server

Этот репозиторий — NestJS monorepo с микросервисами и общими библиотеками. Основная цель — авторитативный сервер для Survival Syndicate.

## 1) Структура репозитория
- `apps/` — микросервисы (каждый сервис — отдельный NestJS app)
- `libs/` — shared libs и контракты (NATS subjects/publishers/schemas)
- `prisma/` — Prisma schemas, migrations, seed
- `docker/` — docker-compose и инфраструктура
- `helm/` — Kubernetes/Helm чарты
- `docs/` — архитектура и гайды

Примечание: целевая архитектура содержит больше сервисов, чем может быть реализовано в `apps/` прямо сейчас. На момент обновления этого гайда в `apps/` присутствуют: `auth-service`, `player-service`, `scheduler-service` (список будет расширяться).

## 2) Модель зон (Central / Local)
Архитектура разделена на:
- **Central Zone (global scope)** — мета-сервисы и всё, что не требует минимальной задержки.
- **Local Zones (zone scope)** — реалтайм сервисы рядом с игроками (`websocket-service`, `gameplay-service`, `local-orchestrator`).

Примечание: код и скрипты могут содержать legacy-названия (`game-server`, `analytics-service`). Смотрите `WARP.md`/`AGENTS.md` и документы в `docs/architecture/`.

## 3) Clean Architecture (обязательная структура сервиса)
Каждый сервис следует строгому направлению зависимостей:

```
Presentation → Application → Domain → Infrastructure
```

Рекомендуемая структура:

```
apps/{service}/src/
├── domain/              # бизнес-логика, без NestJS/Prisma
├── application/         # use-cases (CQRS), ports (abstract classes)
├── infrastructure/      # Prisma/Redis/NATS adapters, mapper'ы
└── presentation/        # http/nats/websocket controllers
```

Ключевые правила:
- Domain не импортирует NestJS/Prisma.
- Ports — abstract classes (не TS interfaces), чтобы NestJS DI работал стабильно.
- Handlers/use-cases — тонкие оркестраторы, бизнес-правила в Domain.

## 4) Контракты и коммуникация между сервисами
- Межсервисная коммуникация: NATS (request/reply + pub/sub).
- **Subjects не хардкодим.** Контракты живут в `libs/lib-*`:
  - `Subjects`/`Publisher` для request/reply
  - Zod schemas для request/response

## 5) HTTP API стиль
- Контроллеры тонкие: принимают DTO → вызывают CommandBus/QueryBus.
- DTO валидируются через Zod (`createZodDto`).
- Swagger decorators обязательны для публичных эндпоинтов.

Смотри также:
- `docs/01_server_development_guide.md`
- `docs/architecture/16_project_structure.md`
- `docs/architecture/22_service_contracts.md`
