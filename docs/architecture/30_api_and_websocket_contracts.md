# HTTP и WebSocket Контракты

Этот документ описывает контракты для аутентификации, матчмейкинга и игрового процесса.

---

## 1. Auth Service (Сервис Аутентификации)

### `POST /api/auth/login`

-   **Назначение:** Упрощенная аутентификация пользователя и выдача JWT.
-   **Аутентификация:** Не требуется.
-   **Request Body:**
    ```json
    {
      "username": "string"
    }
    ```
-   **Response (200 OK):**
    ```json
    {
      "accessToken": "string" 
    }
    ```
    -   `accessToken`: Стандартный JSON Web Token (JWT), содержащий `userId`, `username` и время жизни.

---

## 2. Matchmaking Service (Сервис Матчмейкинга)

-   `POST /api/matchmaking/join`: Поиск игры для группы из лобби.
-   `POST /api/matchmaking/join-solo`: Быстрый старт для соло-игрока.
-   `POST /api/lobbies/create`: Создать лобби.
-   `POST /api/lobbies/{lobbyId}/join`: Присоединиться к лобби.
-   `DELETE /api/lobbies/{lobbyId}/leave`: Покинуть лобби.
-   `POST /api/lobbies/{lobbyId}/start`: (Хост) Начать поиск игры для полного и готового лобби.

---

## 3. WebSocket Service (Игровое соединение)

Клиент использует `websocketUrl`, полученный от Матчмейкера, для установки соединения.

### Процесс подключения:

1.  Клиент открывает WebSocket соединение по адресу `websocketUrl`.
2.  **Сразу после подключения**, клиент должен отправить первое сообщение — **аутентификационное**.

### WebSocket Сообщения (контракты)

Сообщения передаются в бинарном формате, здесь для наглядности представлен их логический JSON-эквивалент.

#### 1. `client.authenticate` (Клиент -> Сервер)

-   **Назначение:** Аутентификация клиента на WebSocket сервере. **Должно быть первым сообщением.**
-   **Payload:**
    ```json
    {
      "type": "authenticate",
      "token": "string" 
    }
    ```
    -   `token`: `accessToken` (JWT), полученный от Auth Service.

#### 2. `server.authenticate.success` (Сервер -> Клиент)

-   **Назначение:** Уведомление об успешной аутентификации и готовности к игре.
-   **Payload:**
    ```json
    {
      "type": "authenticate_success",
      "matchId": "string",
      "playerId": "string"
    }
    ```
    -   `matchId`: ID конкретного матча, к которому подключен игрок.
    -   `playerId`: ID игрока, извлеченный из JWT.

#### 3. `client.lobby.set_ready` (Клиент -> Сервер, в лобби)
- **Payload:** `{ "type": "lobby_set_ready", "isReady": boolean }`

#### 4. `server.lobby.state_update` (Сервер -> Клиент, в лобби)
- **Payload:** `{ "type": "lobby_state_update", "lobbyId": "...", "players": [...] }`

#### 5. `client.input` (Клиент -> Сервер, в игре)

-   **Назначение:** Отправка ввода игрока.
-   **Payload:** Бинарная структура `PlayerInput`.

#### 6. `server.state` (Сервер -> Клиент, в игре)

-   **Назначение:** Отправка состояния мира.
-   **Payload:** Бинарная структура `WorldState`.
