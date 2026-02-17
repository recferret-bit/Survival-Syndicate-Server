# 18. Local Development Guide — Руководство по локальной разработке

## 1. Обзор

Три режима запуска окружения:

| Режим | Инфраструктура | Сервисы | Мониторинг | Использование |
|-------|----------------|---------|------------|---------------|
| **infra-only** | Docker Compose | Вручную (IDE/терминал) | — | Активная разработка |
| **full-stack** | Docker Compose | Docker Compose | Prometheus, Grafana, Loki, Jaeger | Локальное тестирование, Dev |
| **k8s** | Managed / External | Kubernetes | Полный стек | Staging, Production |

---

## 2. Структура директорий

```
Survival-Syndicate-Server/
├── docker/
│   ├── docker-compose.infra.yml      # Только инфраструктура
│   ├── docker-compose.full.yml       # Инфра + все сервисы + мониторинг
│   ├── .env.example                  # Шаблон переменных
│   ├── .env.local                    # Локальные переменные (gitignore)
│   ├── prometheus/
│   │   └── prometheus.yml
│   ├── grafana/
│   │   ├── provisioning/
│   │   │   ├── dashboards/
│   │   │   └── datasources/
│   │   └── dashboards/
│   ├── loki/
│   │   └── loki-config.yml
│   └── jaeger/
│       └── jaeger-config.yml
├── k8s/
│   ├── namespace.yml
│   ├── configmaps/
│   ├── secrets/
│   ├── services/
│   ├── deployments/
│   ├── ingress.yml
│   └── monitoring/
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── player-service/
│   ├── building-service/
│   ├── combat-progress-service/
│   ├── scheduler-service/
│   ├── game-server/
│   └── analytics-service/
└── docs/
```

---

## 3. Режим 1: Infrastructure Only (docker-compose.infra.yml)

Для активной разработки — запускаем только инфраструктуру, сервисы стартуем вручную из IDE.

### docker/docker-compose.infra.yml

```yaml
version: '3.8'

services:
  # ============================================
  # PostgreSQL Meta (игровые данные)
  # ============================================
  postgres-meta:
    image: postgres:16-alpine
    container_name: ss-postgres-meta
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-survival}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-survival_secret}
      POSTGRES_DB: survival_meta
    ports:
      - "5432:5432"
    volumes:
      - postgres_meta_data:/var/lib/postgresql/data
      - ./init-scripts/meta:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U survival -d survival_meta"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ss-network

  # ============================================
  # PostgreSQL Catalog (справочники)
  # ============================================
  postgres-catalog:
    image: postgres:16-alpine
    container_name: ss-postgres-catalog
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-survival}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-survival_secret}
      POSTGRES_DB: survival_catalog
    ports:
      - "5433:5432"
    volumes:
      - postgres_catalog_data:/var/lib/postgresql/data
      - ./init-scripts/catalog:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U survival -d survival_catalog"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ss-network

  # ============================================
  # NATS (messaging)
  # ============================================
  nats:
    image: nats:2.10-alpine
    container_name: ss-nats
    command: 
      - "--jetstream"
      - "--store_dir=/data"
      - "--http_port=8222"
    ports:
      - "4222:4222"   # Client connections
      - "8222:8222"   # HTTP monitoring
    volumes:
      - nats_data:/data
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:8222/healthz"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ss-network

  # ============================================
  # Redis (cache + Bull queues)
  # ============================================
  redis:
    image: redis:7-alpine
    container_name: ss-redis
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ss-network

  # ============================================
  # ClickHouse (analytics)
  # ============================================
  clickhouse:
    image: clickhouse/clickhouse-server:24-alpine
    container_name: ss-clickhouse
    environment:
      CLICKHOUSE_USER: ${CLICKHOUSE_USER:-survival}
      CLICKHOUSE_PASSWORD: ${CLICKHOUSE_PASSWORD:-survival_analytics}
      CLICKHOUSE_DB: survival_analytics
    ports:
      - "8123:8123"   # HTTP interface
      - "9000:9000"   # Native protocol
    volumes:
      - clickhouse_data:/var/lib/clickhouse
      - ./init-scripts/clickhouse:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:8123/ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ss-network

volumes:
  postgres_meta_data:
  postgres_catalog_data:
  nats_data:
  redis_data:
  clickhouse_data:

networks:
  ss-network:
    driver: bridge
```

### Использование

```bash
# Запуск инфраструктуры
cd docker
docker compose -f docker-compose.infra.yml up -d

# Проверка статуса
docker compose -f docker-compose.infra.yml ps

# Логи конкретного сервиса
docker compose -f docker-compose.infra.yml logs -f postgres-meta

# Остановка
docker compose -f docker-compose.infra.yml down

# Полная очистка (включая volumes)
docker compose -f docker-compose.infra.yml down -v
```

### Запуск сервисов вручную

```bash
# Терминал 1: API Gateway
cd services/api-gateway
npm run dev

# Терминал 2: Auth Service
cd services/auth-service
npm run dev

# ... и т.д.
```

---

## 4. Режим 2: Full Stack (docker-compose.full.yml)

Для локального тестирования и Dev окружения — всё в контейнерах.

### docker/docker-compose.full.yml

```yaml
version: '3.8'

services:
  # ============================================
  # INFRASTRUCTURE
  # ============================================
  
  postgres-meta:
    image: postgres:16-alpine
    container_name: ss-postgres-meta
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-survival}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-survival_secret}
      POSTGRES_DB: survival_meta
    ports:
      - "5432:5432"
    volumes:
      - postgres_meta_data:/var/lib/postgresql/data
      - ./init-scripts/meta:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U survival -d survival_meta"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ss-network

  postgres-catalog:
    image: postgres:16-alpine
    container_name: ss-postgres-catalog
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-survival}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-survival_secret}
      POSTGRES_DB: survival_catalog
    ports:
      - "5433:5432"
    volumes:
      - postgres_catalog_data:/var/lib/postgresql/data
      - ./init-scripts/catalog:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U survival -d survival_catalog"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ss-network

  nats:
    image: nats:2.10-alpine
    container_name: ss-nats
    command: 
      - "--jetstream"
      - "--store_dir=/data"
      - "--http_port=8222"
    ports:
      - "4222:4222"
      - "8222:8222"
    volumes:
      - nats_data:/data
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:8222/healthz"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ss-network

  redis:
    image: redis:7-alpine
    container_name: ss-redis
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ss-network

  clickhouse:
    image: clickhouse/clickhouse-server:24-alpine
    container_name: ss-clickhouse
    environment:
      CLICKHOUSE_USER: ${CLICKHOUSE_USER:-survival}
      CLICKHOUSE_PASSWORD: ${CLICKHOUSE_PASSWORD:-survival_analytics}
      CLICKHOUSE_DB: survival_analytics
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - clickhouse_data:/var/lib/clickhouse
      - ./init-scripts/clickhouse:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:8123/ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ss-network

  # ============================================
  # BACKEND SERVICES
  # ============================================

  api-gateway:
    build:
      context: ../services/api-gateway
      dockerfile: Dockerfile
    container_name: ss-api-gateway
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      APP_PORT: 3000
      MANAGEMENT_PORT: 9000
      NATS_URL: nats://nats:4222
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      JAEGER_ENDPOINT: http://jaeger:14268/api/traces
    ports:
      - "3000:3000"   # API
      - "9000:9000"   # Metrics
    depends_on:
      nats:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:9000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - ss-network
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=9000"
      - "prometheus.path=/metrics"

  auth-service:
    build:
      context: ../services/auth-service
      dockerfile: Dockerfile
    container_name: ss-auth-service
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      APP_PORT: 3001
      MANAGEMENT_PORT: 9001
      POSTGRES_META_URL: postgresql://survival:${POSTGRES_PASSWORD}@postgres-meta:5432/survival_meta
      NATS_URL: nats://nats:4222
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      JAEGER_ENDPOINT: http://jaeger:14268/api/traces
    ports:
      - "3001:3001"
      - "9001:9001"
    depends_on:
      postgres-meta:
        condition: service_healthy
      nats:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:9001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - ss-network
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=9001"
      - "prometheus.path=/metrics"

  player-service:
    build:
      context: ../services/player-service
      dockerfile: Dockerfile
    container_name: ss-player-service
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      APP_PORT: 3002
      MANAGEMENT_PORT: 9002
      POSTGRES_META_URL: postgresql://survival:${POSTGRES_PASSWORD}@postgres-meta:5432/survival_meta
      NATS_URL: nats://nats:4222
      REDIS_URL: redis://redis:6379
      JAEGER_ENDPOINT: http://jaeger:14268/api/traces
    ports:
      - "3002:3002"
      - "9002:9002"
    depends_on:
      postgres-meta:
        condition: service_healthy
      nats:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:9002/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - ss-network
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=9002"
      - "prometheus.path=/metrics"

  building-service:
    build:
      context: ../services/building-service
      dockerfile: Dockerfile
    container_name: ss-building-service
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      APP_PORT: 3003
      MANAGEMENT_PORT: 9003
      POSTGRES_META_URL: postgresql://survival:${POSTGRES_PASSWORD}@postgres-meta:5432/survival_meta
      POSTGRES_CATALOG_URL: postgresql://survival:${POSTGRES_PASSWORD}@postgres-catalog:5432/survival_catalog
      NATS_URL: nats://nats:4222
      REDIS_URL: redis://redis:6379
      JAEGER_ENDPOINT: http://jaeger:14268/api/traces
    ports:
      - "3003:3003"
      - "9003:9003"
    depends_on:
      postgres-meta:
        condition: service_healthy
      postgres-catalog:
        condition: service_healthy
      nats:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:9003/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - ss-network
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=9003"
      - "prometheus.path=/metrics"

  combat-progress-service:
    build:
      context: ../services/combat-progress-service
      dockerfile: Dockerfile
    container_name: ss-combat-progress-service
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      APP_PORT: 3004
      MANAGEMENT_PORT: 9004
      POSTGRES_META_URL: postgresql://survival:${POSTGRES_PASSWORD}@postgres-meta:5432/survival_meta
      POSTGRES_CATALOG_URL: postgresql://survival:${POSTGRES_PASSWORD}@postgres-catalog:5432/survival_catalog
      NATS_URL: nats://nats:4222
      REDIS_URL: redis://redis:6379
      JAEGER_ENDPOINT: http://jaeger:14268/api/traces
    ports:
      - "3004:3004"
      - "9004:9004"
    depends_on:
      postgres-meta:
        condition: service_healthy
      postgres-catalog:
        condition: service_healthy
      nats:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:9004/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - ss-network
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=9004"
      - "prometheus.path=/metrics"

  scheduler-service:
    build:
      context: ../services/scheduler-service
      dockerfile: Dockerfile
    container_name: ss-scheduler-service
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      APP_PORT: 3005
      MANAGEMENT_PORT: 9005
      POSTGRES_META_URL: postgresql://survival:${POSTGRES_PASSWORD}@postgres-meta:5432/survival_meta
      NATS_URL: nats://nats:4222
      REDIS_URL: redis://redis:6379
      JAEGER_ENDPOINT: http://jaeger:14268/api/traces
    ports:
      - "3005:3005"
      - "9005:9005"
    depends_on:
      postgres-meta:
        condition: service_healthy
      nats:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:9005/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - ss-network
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=9005"
      - "prometheus.path=/metrics"

  game-server:
    build:
      context: ../services/game-server
      dockerfile: Dockerfile
    container_name: ss-game-server
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      APP_PORT: 3006
      MANAGEMENT_PORT: 9006
      WS_PORT: 7000
      NATS_URL: nats://nats:4222
      REDIS_URL: redis://redis:6379
      JAEGER_ENDPOINT: http://jaeger:14268/api/traces
    ports:
      - "3006:3006"   # HTTP API
      - "9006:9006"   # Metrics
      - "7000:7000"   # WebSocket (game traffic)
    depends_on:
      nats:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:9006/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - ss-network
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=9006"
      - "prometheus.path=/metrics"

  analytics-service:
    build:
      context: ../services/analytics-service
      dockerfile: Dockerfile
    container_name: ss-analytics-service
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      APP_PORT: 3007
      MANAGEMENT_PORT: 9007
      CLICKHOUSE_URL: http://clickhouse:8123
      CLICKHOUSE_USER: ${CLICKHOUSE_USER:-survival}
      CLICKHOUSE_PASSWORD: ${CLICKHOUSE_PASSWORD:-survival_analytics}
      NATS_URL: nats://nats:4222
      JAEGER_ENDPOINT: http://jaeger:14268/api/traces
    ports:
      - "3007:3007"
      - "9007:9007"
    depends_on:
      clickhouse:
        condition: service_healthy
      nats:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:9007/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - ss-network
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=9007"
      - "prometheus.path=/metrics"

  # ============================================
  # MONITORING
  # ============================================

  prometheus:
    image: prom/prometheus:v2.50.0
    container_name: ss-prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=7d'
      - '--web.enable-lifecycle'
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    networks:
      - ss-network

  grafana:
    image: grafana/grafana:10.3.0
    container_name: ss-grafana
    environment:
      GF_SECURITY_ADMIN_USER: ${GRAFANA_USER:-admin}
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
      GF_USERS_ALLOW_SIGN_UP: false
    ports:
      - "3100:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
      - ./grafana/dashboards:/var/lib/grafana/dashboards:ro
    depends_on:
      - prometheus
      - loki
      - jaeger
    networks:
      - ss-network

  loki:
    image: grafana/loki:2.9.4
    container_name: ss-loki
    command: -config.file=/etc/loki/local-config.yaml
    ports:
      - "3200:3100"
    volumes:
      - ./loki/loki-config.yml:/etc/loki/local-config.yaml:ro
      - loki_data:/loki
    networks:
      - ss-network

  promtail:
    image: grafana/promtail:2.9.4
    container_name: ss-promtail
    command: -config.file=/etc/promtail/config.yml
    volumes:
      - ./loki/promtail-config.yml:/etc/promtail/config.yml:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - loki
    networks:
      - ss-network

  jaeger:
    image: jaegertracing/all-in-one:1.54
    container_name: ss-jaeger
    environment:
      COLLECTOR_OTLP_ENABLED: true
    ports:
      - "16686:16686"   # Jaeger UI
      - "14268:14268"   # HTTP collector
      - "6831:6831/udp" # UDP agent
      - "4317:4317"     # OTLP gRPC
      - "4318:4318"     # OTLP HTTP
    networks:
      - ss-network

volumes:
  postgres_meta_data:
  postgres_catalog_data:
  nats_data:
  redis_data:
  clickhouse_data:
  prometheus_data:
  grafana_data:
  loki_data:

networks:
  ss-network:
    driver: bridge
```

### Конфигурация Prometheus

```yaml
# docker/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:9000']

  - job_name: 'auth-service'
    static_configs:
      - targets: ['auth-service:9001']

  - job_name: 'player-service'
    static_configs:
      - targets: ['player-service:9002']

  - job_name: 'building-service'
    static_configs:
      - targets: ['building-service:9003']

  - job_name: 'combat-progress-service'
    static_configs:
      - targets: ['combat-progress-service:9004']

  - job_name: 'scheduler-service'
    static_configs:
      - targets: ['scheduler-service:9005']

  - job_name: 'game-server'
    static_configs:
      - targets: ['game-server:9006']

  - job_name: 'analytics-service'
    static_configs:
      - targets: ['analytics-service:9007']

  # Infrastructure
  - job_name: 'nats'
    static_configs:
      - targets: ['nats:8222']
    metrics_path: /varz

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
```

### Конфигурация Loki

```yaml
# docker/loki/loki-config.yml
auth_enabled: false

server:
  http_listen_port: 3100

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

limits_config:
  retention_period: 168h  # 7 days
```

### Конфигурация Promtail

```yaml
# docker/loki/promtail-config.yml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: containers
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
      - source_labels: ['__meta_docker_container_label_prometheus_scrape']
        regex: 'true'
        action: keep
```

### Grafana Datasources

```yaml
# docker/grafana/provisioning/datasources/datasources.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100

  - name: Jaeger
    type: jaeger
    access: proxy
    url: http://jaeger:16686
```

### Использование Full Stack

```bash
# Запуск всего
cd docker
docker compose -f docker-compose.full.yml up -d

# Мониторинг
open http://localhost:3100  # Grafana (admin/admin)
open http://localhost:9090  # Prometheus
open http://localhost:16686 # Jaeger

# Масштабирование Game Server
docker compose -f docker-compose.full.yml up -d --scale game-server=3

# Остановка
docker compose -f docker-compose.full.yml down
```

---

## 5. Режим 3: Kubernetes (Minikube для Dev)

### Предварительные требования

```bash
# Установка minikube
brew install minikube  # macOS
# или
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Запуск кластера
minikube start --cpus=4 --memory=8192 --driver=docker

# Включение ingress
minikube addons enable ingress
minikube addons enable metrics-server
```

### Namespace

```yaml
# k8s/namespace.yml
apiVersion: v1
kind: Namespace
metadata:
  name: survival-syndicate
  labels:
    name: survival-syndicate
```

### ConfigMap

```yaml
# k8s/configmaps/app-config.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: survival-syndicate
data:
  NODE_ENV: "production"
  NATS_URL: "nats://nats.survival-syndicate.svc.cluster.local:4222"
  REDIS_URL: "redis://redis.survival-syndicate.svc.cluster.local:6379"
  POSTGRES_META_HOST: "postgres-meta.survival-syndicate.svc.cluster.local"
  POSTGRES_CATALOG_HOST: "postgres-catalog.survival-syndicate.svc.cluster.local"
  CLICKHOUSE_HOST: "clickhouse.survival-syndicate.svc.cluster.local"
  JAEGER_ENDPOINT: "http://jaeger.survival-syndicate.svc.cluster.local:14268/api/traces"
```

### Secrets (для Vault интеграции)

```yaml
# k8s/secrets/app-secrets.yml
# В Dev используем sealed-secrets или external-secrets с Vault
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: survival-syndicate
type: Opaque
stringData:
  POSTGRES_PASSWORD: "survival_secret"
  JWT_SECRET: "your-jwt-secret-here"
  JWT_REFRESH_SECRET: "your-refresh-secret-here"
  CLICKHOUSE_PASSWORD: "survival_analytics"
```

### Vault Integration (для Dev/Prod)

```yaml
# k8s/secrets/vault-auth.yml
apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultAuth
metadata:
  name: vault-auth
  namespace: survival-syndicate
spec:
  method: kubernetes
  mount: kubernetes
  kubernetes:
    role: survival-syndicate
    serviceAccount: default

---
# k8s/secrets/vault-secrets.yml
apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultStaticSecret
metadata:
  name: app-secrets
  namespace: survival-syndicate
spec:
  type: kv-v2
  mount: secret
  path: survival-syndicate/app
  destination:
    name: app-secrets
    create: true
  refreshAfter: 30s
```

### Service Deployment (пример: API Gateway)

```yaml
# k8s/deployments/api-gateway.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: survival-syndicate
  labels:
    app: api-gateway
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9000"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: api-gateway
          image: survival-syndicate/api-gateway:latest
          ports:
            - name: http
              containerPort: 3000
            - name: metrics
              containerPort: 9000
          envFrom:
            - configMapRef:
                name: app-config
            - secretRef:
                name: app-secrets
          env:
            - name: APP_PORT
              value: "3000"
            - name: MANAGEMENT_PORT
              value: "9000"
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 9000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 9000
            initialDelaySeconds: 5
            periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: survival-syndicate
spec:
  selector:
    app: api-gateway
  ports:
    - name: http
      port: 80
      targetPort: 3000
    - name: metrics
      port: 9000
      targetPort: 9000
```

### Game Server (WebSocket)

```yaml
# k8s/deployments/game-server.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: game-server
  namespace: survival-syndicate
  labels:
    app: game-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: game-server
  template:
    metadata:
      labels:
        app: game-server
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9006"
    spec:
      containers:
        - name: game-server
          image: survival-syndicate/game-server:latest
          ports:
            - name: http
              containerPort: 3006
            - name: websocket
              containerPort: 7000
            - name: metrics
              containerPort: 9006
          envFrom:
            - configMapRef:
                name: app-config
            - secretRef:
                name: app-secrets
          env:
            - name: APP_PORT
              value: "3006"
            - name: MANAGEMENT_PORT
              value: "9006"
            - name: WS_PORT
              value: "7000"
          resources:
            requests:
              cpu: "200m"
              memory: "256Mi"
            limits:
              cpu: "1000m"
              memory: "1Gi"
          livenessProbe:
            httpGet:
              path: /health
              port: 9006
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 9006
            initialDelaySeconds: 5
            periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: game-server
  namespace: survival-syndicate
spec:
  selector:
    app: game-server
  ports:
    - name: http
      port: 80
      targetPort: 3006
    - name: websocket
      port: 7000
      targetPort: 7000
    - name: metrics
      port: 9006
      targetPort: 9006
```

### Ingress (nginx, self-signed TLS)

```yaml
# k8s/ingress.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: survival-syndicate-ingress
  namespace: survival-syndicate
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
    # WebSocket support
    nginx.ingress.kubernetes.io/proxy-http-version: "1.1"
    nginx.ingress.kubernetes.io/upstream-hash-by: "$remote_addr"
spec:
  tls:
    - hosts:
        - api.survival.local
        - game.survival.local
        - monitor.survival.local
      secretName: survival-tls
  rules:
    # API Gateway
    - host: api.survival.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-gateway
                port:
                  number: 80

    # Game Server (WebSocket)
    - host: game.survival.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: game-server
                port:
                  number: 7000

    # Grafana
    - host: monitor.survival.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: grafana
                port:
                  number: 3000
```

### Self-Signed TLS Certificate

```bash
# Генерация self-signed сертификата
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt \
  -subj "/CN=*.survival.local" \
  -addext "subjectAltName=DNS:api.survival.local,DNS:game.survival.local,DNS:monitor.survival.local"

# Создание secret
kubectl create secret tls survival-tls \
  --cert=tls.crt --key=tls.key \
  -n survival-syndicate
```

### Monitoring Stack (Helm)

```bash
# Добавляем репозитории
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Prometheus + Grafana (kube-prometheus-stack)
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace survival-syndicate \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set grafana.adminPassword=admin

# Loki
helm install loki grafana/loki-stack \
  --namespace survival-syndicate \
  --set promtail.enabled=true \
  --set loki.persistence.enabled=true

# Jaeger
helm install jaeger jaegertracing/jaeger \
  --namespace survival-syndicate \
  --set allInOne.enabled=true
```

### Развёртывание

```bash
# Применение конфигураций
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yml

# Проверка статуса
kubectl get pods -n survival-syndicate
kubectl get services -n survival-syndicate
kubectl get ingress -n survival-syndicate

# Локальный доступ через minikube
echo "$(minikube ip) api.survival.local game.survival.local monitor.survival.local" | sudo tee -a /etc/hosts

# Или через tunnel
minikube tunnel
```

---

## 6. Environment Variables

### .env.example

```bash
# docker/.env.example

# ============================================
# Database
# ============================================
POSTGRES_USER=survival
POSTGRES_PASSWORD=survival_secret

# ============================================
# ClickHouse
# ============================================
CLICKHOUSE_USER=survival
CLICKHOUSE_PASSWORD=survival_analytics

# ============================================
# Auth
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# ============================================
# Monitoring
# ============================================
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin

# ============================================
# Environment
# ============================================
NODE_ENV=development
```

### Vault структура (Dev/Prod)

```
secret/
└── survival-syndicate/
    ├── app/
    │   ├── JWT_SECRET
    │   ├── JWT_REFRESH_SECRET
    │   └── API_KEYS
    ├── database/
    │   ├── POSTGRES_PASSWORD
    │   └── CLICKHOUSE_PASSWORD
    └── external/
        ├── PAYMENT_API_KEY
        └── ANALYTICS_KEY
```

---

## 7. Порты сервисов

| Сервис | APP_PORT | MANAGEMENT_PORT | Дополнительные |
|--------|----------|-----------------|----------------|
| API Gateway | 3000 | 9000 | — |
| Auth Service | 3001 | 9001 | — |
| Player Service | 3002 | 9002 | — |
| Building Service | 3003 | 9003 | — |
| Combat Progress Service | 3004 | 9004 | — |
| Scheduler Service | 3005 | 9005 | — |
| Game Server | 3006 | 9006 | WS: 7000 |
| Analytics Service | 3007 | 9007 | — |

| Инфраструктура | Порт |
|----------------|------|
| PostgreSQL Meta | 5432 |
| PostgreSQL Catalog | 5433 |
| NATS | 4222, 8222 (monitoring) |
| Redis | 6379 |
| ClickHouse | 8123 (HTTP), 9000 (native) |

| Мониторинг | Порт |
|------------|------|
| Prometheus | 9090 |
| Grafana | 3100 |
| Loki | 3200 |
| Jaeger UI | 16686 |

---

## 8. Быстрый старт

### Вариант 1: Разработка (infra-only)

```bash
# 1. Клонируем репозиторий
git clone git@github.com:recferret-bit/Survival-Syndicate-Server.git
cd Survival-Syndicate-Server

# 2. Копируем env
cp docker/.env.example docker/.env.local

# 3. Запускаем инфраструктуру
cd docker && docker compose -f docker-compose.infra.yml up -d

# 4. Открываем IDE и запускаем нужные сервисы
code .
```

### Вариант 2: Полный стек

```bash
# 1. Клонируем и настраиваем
git clone git@github.com:recferret-bit/Survival-Syndicate-Server.git
cd Survival-Syndicate-Server
cp docker/.env.example docker/.env.local

# 2. Запускаем всё
cd docker && docker compose -f docker-compose.full.yml up -d

# 3. Проверяем
open http://localhost:3000/health      # API Gateway
open http://localhost:3100             # Grafana
open http://localhost:16686            # Jaeger
```

### Вариант 3: Kubernetes

```bash
# 1. Запускаем minikube
minikube start --cpus=4 --memory=8192
minikube addons enable ingress

# 2. Применяем манифесты
kubectl apply -f k8s/

# 3. Добавляем hosts
echo "$(minikube ip) api.survival.local game.survival.local" | sudo tee -a /etc/hosts

# 4. Открываем
open https://api.survival.local/health
```

---

## 9. Troubleshooting

### Compose: сервис не стартует

```bash
# Проверить логи
docker compose -f docker-compose.full.yml logs -f <service-name>

# Проверить healthcheck
docker inspect <container-id> | jq '.[0].State.Health'

# Перезапустить один сервис
docker compose -f docker-compose.full.yml restart <service-name>
```

### K8s: pod в CrashLoopBackOff

```bash
# Логи пода
kubectl logs -f <pod-name> -n survival-syndicate

# Предыдущие логи (если перезапускался)
kubectl logs -f <pod-name> -n survival-syndicate --previous

# Describe для событий
kubectl describe pod <pod-name> -n survival-syndicate
```

### Database: миграции

```bash
# Подключение к PostgreSQL
docker exec -it ss-postgres-meta psql -U survival -d survival_meta

# Или через kubectl
kubectl exec -it <postgres-pod> -n survival-syndicate -- psql -U survival -d survival_meta
```
