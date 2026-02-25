# Контракты взаимодействия сервисов

Этот документ определяет API и события, через которые взаимодействуют ключевые сервисы боевой архитектуры.

---

## 1. Matchmaking Service (Глобальный)

Отвечает за подбор игроков.

### REST API Endpoints

#### `POST /api/matchmaking/queue`
-   **Назначение:** Добавляет игрока в очередь поиска матча.
-   **Request Body:**
    ```json
    {
      "playerId": "string",
      "gameMode": "string",
      "playerRating": "number"
    }
    ```
-   **Response:** `202 Accepted` (Запрос принят, игрок в очереди).

### NATS Publications

#### Тема: `matchmaking.found_match`
-   **Назначение:** Публикует сообщение, когда матч найден.
-   **Payload:**
    ```json
    {
      "matchId": "string",
      "lobbyId": "string",
      "teams": [
        { "teamId": "a", "players": ["playerId1", "playerId2"] },
        { "teamId": "b", "players": ["playerId3", "playerId4"] }
      ]
    }
    ```

---

## 2. Local Orchestrator (внутри Зоны)

Управляет матчами в своей Зоне.

### NATS Subscriptions

#### Тема: `matchmaking.found_match`
-   **Назначение:** Слушает это событие, чтобы начать размещение игроков.
-   **Действие:**
    1.  Определяет, в какой `Gameplay Service` поместить матч.
    2.  Публикует событие `gameplay.start_simulation`.
    3.  Сохраняет у себя маппинг `playerId` -> `matchId`.

### NATS Publications

#### Тема: `gameplay.start_simulation`
-   **Назначение:** Команда для `Gameplay Service` на запуск нового инстанса симуляции.
-   **Payload:**
    ```json
    {
      "matchId": "string",
      "gameMode": "string",
      "players": ["playerId1", "playerId2", ...]
    }
    ```

#### Тема: `player.input.{matchId}.{playerId}`
-   **Назначение:** Перенаправляет ввод конкретного игрока в нужный `Gameplay Service`.
-   **Payload:** `PlayerInput` (бинарный формат).

---

## 3. WebSocket Service (внутри Зоны)

Точка входа для клиентов.

### WebSocket Events

-   **Входящие:** Принимает бинарные сообщения `PlayerInput`.
-   **Исходящие:** Отправляет бинарные сообщения `WorldState`.

### NATS Publications

#### Тема: `player.input.{matchId}.{playerId}`
-   **Назначение:** Публикует ввод игрока, полученный по WebSocket.
-   **Действие:** После аутентификации игрока и получения `matchId` от Оркестратора, сервис начинает публиковать все входящие `PlayerInput` в эту тему.

### NATS Subscriptions

#### Тема: `gameplay.world_state.{matchId}`
-   **Назначение:** Получает актуальное состояние мира для конкретного матча.
-   **Действие:** Немедленно пересылает полученный `WorldState` всем игрокам, которые привязаны к этому `matchId`.

---

## 4. Gameplay Service (внутри Зоны)

Выполняет симуляцию игр.

### NATS Subscriptions

#### Тема: `gameplay.start_simulation`
-   **Назначение:** Получает команду на запуск новой симуляции.
-   **Действие:** Создает новый инстанс `GameSimulation` в своей внутренней `Map` и подписывает его на соответствующую тему ввода.

#### Тема: `player.input.{matchId}.*`
-   **Назначение:** Получает ввод от всех игроков конкретного матча.
-   **Действие:** Передает `PlayerInput` в нужный инстанс `GameSimulation`.

### NATS Publications

#### Тема: `gameplay.world_state.{matchId}`
-   **Назнаczenie:** Публикует актуальное состояние мира после каждого тика.
-   **Payload:** `WorldState` (бинарный формат).

#### Тема: `match.finished`
-   **Назначение:** `Gameplay Service` публикует это событие по окончании матча.
-   **Payload:**
    ```json
    {
      "matchId": "string",
      "lobbyId": "string",
      "results": { ... } 
    }
    ```
