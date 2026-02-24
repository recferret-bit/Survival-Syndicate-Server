# 32. Спецификация REST API (Мета-игра)

## 1. Общие принципы

-   **Формат:** RESTful API.
-   **Данные:** JSON.
-   **Аутентификация:** JWT. Каждый запрос (кроме `auth`) должен содержать заголовок `Authorization: Bearer <jwt_token>`.
-   **Принцип "Single Source of Truth":** Любой запрос, изменяющий состояние (`POST`, `PATCH`), в случае успеха возвращает **полный, обновленный объект `UserData`**.

## 2. Модель данных: `UserData`

Это основной объект, описывающий мета-прогрессию игрока.

```json
{
  "userId": "uuid-1234",
  "username": "Player1",
  "currencies": {
    "soft": 15000,
    "hard": 200
  },
  "buildings": [
    {
      "id": "headquarters",
      "level": 2,
      "is_under_construction": true,
      "construction_ends_at": "2026-02-08T12:30:00Z" // ISO 8601
    },
    {
      "id": "bar",
      "level": 1,
      "is_under_construction": false,
      "construction_ends_at": null
    }
  ],
  "inventory": { ... }
}
```

## 3. Эндпоинты

### Аутентификация

-   `POST /auth/login`
    -   **Тело запроса:** `{ "email": "...", "password": "..." }`
    -   **Ответ (200 OK):** `{ "jwt_token": "...", "userData": { ... } }`

### Данные игрока

-   `GET /user/me`
    -   **Тело запроса:** -
    -   **Ответ (200 OK):** `UserData` (полный объект)

### Здания (Строительство и улучшения)

-   `POST /buildings`
    -   **Назначение:** Единый эндпоинт для начала строительства, ускорения или моментального завершения.
    -   **Тело запроса:**
        ```json
        {
          "buildingId": "headquarters",
          "action": "UPGRADE" // "UPGRADE" | "SPEED_UP" | "COMPLETE_NOW"
        }
        ```
    -   **Логика сервера:**
        -   `UPGRADE`: Проверяет, достаточно ли `soft` валюты, устанавливает таймер.
        -   `SPEED_UP`: Проверяет, достаточно ли `hard` валюты, уменьшает таймер.
        -   `COMPLETE_NOW`: Проверяет, достаточно ли `hard` валюты, завершает стройку.
    -   **Ответ (200 OK):** `UserData` (полный, обновленный объект)
    -   **Ответ (400 Bad Request):** `{ "error": "not_enough_currency" }`

### Статические данные игры

-   `GET /game/config`
    -   **Назначение:** Получение всех статических игровых данных (стоимости, бонусы, и т.д.), чтобы клиент не хранил их у себя.
    -   **Ответ (200 OK):**
        ```json
        {
          "buildings": [
            {
              "id": "headquarters",
              "name": "Штаб",
              "levels": [
                { "level": 1, "soft_cost": 0, "time_seconds": 0, "bonus": "..." },
                { "level": 2, "soft_cost": 5000, "time_seconds": 1800, "bonus": "..." }
              ]
            }
          ]
        }
        ```
