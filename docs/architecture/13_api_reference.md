# 17. API Reference — Полный список HTTP API

## Обзор

Все API доступны через **API Gateway** по адресу `https://api.survival-syndicate.com`.

**Аутентификация:** `Authorization: Bearer <jwt>` (кроме Auth Service)

---

## 1. Auth Service (порт 3001)

### Регистрация

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "securePassword123"
}
```

**Response 201:**
```json
{
  "success": true,
  "user": {
    "id": "uuid-123",
    "email": "player@example.com"
  },
  "tokens": {
    "accessToken": "jwt...",
    "refreshToken": "refresh...",
    "expiresIn": 3600
  }
}
```

**Ошибки:**
- `400 EMAIL_ALREADY_EXISTS`
- `400 INVALID_EMAIL_FORMAT`
- `400 PASSWORD_TOO_WEAK`

---

### Логин

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "securePassword123"
}
```

**Response 200:**
```json
{
  "success": true,
  "user": {
    "id": "uuid-123",
    "email": "player@example.com"
  },
  "tokens": {
    "accessToken": "jwt...",
    "refreshToken": "refresh...",
    "expiresIn": 3600
  }
}
```

**Ошибки:**
- `401 INVALID_CREDENTIALS`
- `403 ACCOUNT_BANNED`

---

### Обновление токена

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh..."
}
```

**Response 200:**
```json
{
  "accessToken": "new-jwt...",
  "refreshToken": "new-refresh...",
  "expiresIn": 3600
}
```

---

### Выход

```http
POST /api/v1/auth/logout
Authorization: Bearer <jwt>
```

**Response 200:**
```json
{
  "success": true
}
```

---

### Смена пароля

```http
POST /api/v1/auth/change-password
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePassword123"
}
```

---

### Восстановление пароля

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "player@example.com"
}
```

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newSecurePassword123"
}
```

---

## 2. Player Service (порт 3002)

### Пользователи

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/users/me` | Профиль текущего пользователя |
| PATCH | `/api/v1/users/me` | Обновить профиль |
| GET | `/api/v1/users/me/full` | Полные данные (UserData) |

### Персонажи

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/users/me/characters` | Список персонажей |
| POST | `/api/v1/users/me/characters` | Создать персонажа |
| GET | `/api/v1/characters/{id}` | Получить персонажа |
| PATCH | `/api/v1/characters/{id}` | Обновить персонажа |
| DELETE | `/api/v1/characters/{id}` | Удалить персонажа |

### Друзья

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/users/me/friends` | Список друзей |
| POST | `/api/v1/users/me/friends` | Отправить запрос |
| PATCH | `/api/v1/users/me/friends/{userId}` | Принять/отклонить |
| DELETE | `/api/v1/users/me/friends/{userId}` | Удалить из друзей |

---

## 3. Building Service (порт 3004)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/characters/{id}/buildings` | Список зданий |
| POST | `/api/v1/characters/{id}/buildings` | Построить здание |
| POST | `/api/v1/characters/{id}/buildings/{buildingId}/upgrade` | Апгрейд |
| GET | `/api/v1/characters/{id}/buildings/effects` | Бонусы от зданий |
| POST | `/api/v1/characters/{id}/buildings/collect` | Собрать пассивный доход |

### Построить здание

```http
POST /api/v1/characters/{characterId}/buildings
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "buildingId": "laboratory",
  "slot": 3
}
```

### Апгрейд

```http
POST /api/v1/characters/{characterId}/buildings/{buildingId}/upgrade
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "useHardCurrency": false,
  "instantComplete": false
}
```

---

## 4. Combat Progress Service (порт 3005)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/characters/{id}/combat` | Боевой профиль |
| GET | `/api/v1/characters/{id}/combat/trophies` | Трофеи |
| GET | `/api/v1/characters/{id}/combat/achievements` | Достижения |
| GET | `/api/v1/characters/{id}/combat/pool` | Боевой пул |
| POST | `/api/v1/characters/{id}/combat/unlock` | Разблокировать предмет |

### Разблокировать предмет

```http
POST /api/v1/characters/{characterId}/combat/unlock
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "itemType": "weapon",
  "itemId": "shotgun_street_sweeper"
}
```

**Response 200:**
```json
{
  "success": true,
  "unlocked": {
    "itemType": "weapon",
    "itemId": "shotgun_street_sweeper",
    "name": "Уборщик"
  },
  "trophiesSpent": [
    { "trophyId": "trophy_patrol_insignia", "quantity": 5 }
  ]
}
```

---

## 5. Wallet Service (порт 3006)

### Получить баланс

```http
GET /api/v1/characters/{characterId}/wallet
Authorization: Bearer <jwt>
```

**Response 200:**
```json
{
  "characterId": "uuid-123",
  "soft": 125000,
  "hard": 450,
  "updatedAt": "2026-02-11T12:00:00Z"
}
```

---

### История транзакций

```http
GET /api/v1/characters/{characterId}/wallet/transactions?limit=20&offset=0
Authorization: Bearer <jwt>
```

**Response 200:**
```json
{
  "transactions": [
    {
      "id": "tx-123",
      "type": "earn",
      "currency": "soft",
      "amount": 5000,
      "source": "heist_reward",
      "balanceAfter": 125000,
      "createdAt": "2026-02-11T11:30:00Z"
    },
    {
      "id": "tx-122",
      "type": "spend",
      "currency": "soft",
      "amount": 3000,
      "source": "building_upgrade",
      "metadata": { "buildingId": "laboratory", "level": 2 },
      "balanceAfter": 120000,
      "createdAt": "2026-02-11T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 20,
    "offset": 0
  }
}
```

---

### Потратить валюту (внутренний API)

```http
POST /api/v1/internal/wallet/spend
X-Internal-Key: <service_key>
Content-Type: application/json

{
  "characterId": "uuid-123",
  "currency": "soft",
  "amount": 5000,
  "source": "building_upgrade",
  "metadata": { "buildingId": "laboratory", "level": 3 }
}
```

**Response 200:**
```json
{
  "success": true,
  "newBalance": 120000,
  "transactionId": "tx-124"
}
```

**Ошибки:**
- `400 INSUFFICIENT_FUNDS`

---

### Начислить валюту (внутренний API)

```http
POST /api/v1/internal/wallet/add
X-Internal-Key: <service_key>
Content-Type: application/json

{
  "characterId": "uuid-123",
  "currency": "soft",
  "amount": 10000,
  "source": "heist_reward",
  "metadata": { "matchId": "match-456" }
}
```

---

## 6. Matchmaking Service (порт 3007)

### Найти игру

```http
POST /api/v1/matchmaking/find
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "characterId": "uuid-char-1",
  "gameMode": "pve_heist",
  "difficulty": "medium",
  "preferredRegion": "auto"
}
```

**Response 200:**
```json
{
  "success": true,
  "match": {
    "matchId": "match-uuid-789",
    "websocketUrl": "wss://spb.game.survival-syndicate.com:8080",
    "token": "one-time-match-token",
    "region": "RU-SPE",
    "expiresAt": "2026-02-11T13:10:00Z"
  }
}
```

**Ошибки:**
- `400 CHARACTER_NOT_FOUND`
- `400 INSUFFICIENT_ENERGY`
- `503 NO_SERVERS_AVAILABLE`

---

### Отменить поиск

```http
POST /api/v1/matchmaking/cancel
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "characterId": "uuid-char-1"
}
```

---

### Получить статус серверов (admin)

```http
GET /api/v1/matchmaking/servers
X-Admin-Key: <admin_key>
```

**Response 200:**
```json
{
  "servers": [
    {
      "serverId": "k8s-pod-spb-1a",
      "region": "RU-SPE",
      "city": "Saint Petersburg",
      "currentPlayers": 50,
      "runningMatches": 10,
      "maxMatches": 20,
      "status": "healthy",
      "lastHeartbeat": "2026-02-11T13:05:00Z"
    }
  ]
}
```

---

## 7. Collector Service (порт 3008)

### Отправить события (от клиента)

```http
POST /api/v1/analytics/events
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "characterId": "uuid-123",
  "events": [
    {
      "name": "button_click",
      "params": { "button_id": "play_button", "screen": "main_menu" },
      "timestamp": "2026-02-11T13:00:00Z"
    },
    {
      "name": "screen_view",
      "params": { "screen": "inventory" },
      "timestamp": "2026-02-11T13:00:05Z"
    }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "eventsReceived": 2
}
```

---

### Отправить события (от сервера, внутренний)

```http
POST /api/v1/internal/analytics/server-events
X-Internal-Key: <service_key>
Content-Type: application/json

{
  "source": "game_server",
  "events": [
    {
      "name": "match_completed",
      "params": {
        "matchId": "match-456",
        "characterIds": ["uuid-1", "uuid-2"],
        "duration": 1200,
        "result": "victory"
      },
      "timestamp": "2026-02-11T13:00:00Z"
    }
  ]
}
```

---

## 8. Payment Service (порт 3009)

### Валидация покупки (iOS)

```http
POST /api/v1/payments/validate/apple
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "characterId": "uuid-123",
  "receiptData": "base64-encoded-receipt...",
  "productId": "crystals_500"
}
```

**Response 200:**
```json
{
  "success": true,
  "purchase": {
    "productId": "crystals_500",
    "crystalsAdded": 500
  },
  "wallet": {
    "soft": 125000,
    "hard": 950
  }
}
```

**Ошибки:**
- `400 INVALID_RECEIPT`
- `400 RECEIPT_ALREADY_USED`
- `400 PRODUCT_NOT_FOUND`

---

### Валидация покупки (Android)

```http
POST /api/v1/payments/validate/google
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "characterId": "uuid-123",
  "purchaseToken": "google-purchase-token...",
  "productId": "crystals_500"
}
```

---

### История покупок

```http
GET /api/v1/characters/{characterId}/payments/history
Authorization: Bearer <jwt>
```

**Response 200:**
```json
{
  "purchases": [
    {
      "id": "purchase-123",
      "platform": "apple",
      "productId": "crystals_500",
      "amount": 500,
      "priceUsd": 4.99,
      "createdAt": "2026-02-10T15:00:00Z"
    }
  ]
}
```

---

## 9. Scheduler Service (порт 3010)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/v1/scheduler/jobs/{jobType}/run` | Запустить задачу вручную |
| GET | `/api/v1/scheduler/queues` | Статус очередей |
| GET | `/api/v1/scheduler/jobs/{jobType}/history` | История задач |
| POST | `/api/v1/scheduler/queues/{name}/pause` | Приостановить очередь |
| POST | `/api/v1/scheduler/queues/{name}/resume` | Возобновить очередь |

**Требует:** `X-Admin-Key`

---

## 10. Общие эндпоинты (все сервисы)

### Management порт (9xxx)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/ping` | Liveness probe |
| GET | `/health` | Readiness probe |
| GET | `/metrics` | Prometheus metrics |

### Формат ошибок

Все ошибки возвращаются в едином формате:

```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Not enough soft currency",
    "details": {
      "required": 5000,
      "available": 3000
    }
  }
}
```

### HTTP коды

| Код | Значение |
|-----|----------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (валидация, бизнес-ошибки) |
| 401 | Unauthorized (нет/невалидный токен) |
| 403 | Forbidden (нет прав) |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## 11. Rate Limits

| Endpoint группа | Лимит |
|-----------------|-------|
| Auth (login, register) | 10 req/min per IP |
| Payments | 5 req/min per user |
| Analytics events | 100 req/min per user |
| Остальные | 60 req/min per user |
