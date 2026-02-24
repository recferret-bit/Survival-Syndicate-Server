# Внутренняя архитектура Gameplay Service

Этот документ описывает внутреннее устройство `Gameplay Service`, включая управление множеством игровых симуляций и логику одной симуляции.

---

## 1. Внутренний Оркестратор (Паттерн: Manager/Factory)

`Gameplay Service` выступает в роли **менеджера** или **фабрики** для инстансов `GameSimulation`. Его основная задача — управлять жизненным циклом симуляций.

### Класс: `GameplayService`

```typescript
class GameplayService {
  private simulations: Map<string, IGameSimulation>;

  constructor() {
    this.simulations = new Map<string, IGameSimulation>();
    this.subscribeToNats();
  }

  private subscribeToNats(): void {
    // Подписывается на 'gameplay.start_simulation'
    // При получении сообщения, вызывает createSimulation()
  }

  private createSimulation(matchId: string, players: Player[]): void {
    const newSimulation = new GameSimulation(matchId, players);
    this.simulations.set(matchId, newSimulation);
    newSimulation.start();
  }
  
  // Другие методы для остановки и удаления симуляций...
}
```

-   **`simulations`**: Основная структура данных, `Map`, где ключ — `matchId`, а значение — запущенный инстанс `IGameSimulation`.
-   **Логика:** При получении команды `gameplay.start_simulation` из NATS, он создает новый объект `GameSimulation`, добавляет его в `Map` и запускает его.

---

## 2. Инстанс Симуляции (Паттерн: ECS-like Systems)

Каждый инстанс симуляции инкапсулирует в себе всю логику одного матча. Архитектура внутри симуляции построена по принципу, схожему с **ECS (Entity-Component-System)**, где разные подсистемы отвечают за свою часть логики.

### Интерфейс: `IGameSimulation`
(Описан в `27_game_simulation_interface.md`).

### Класс: `GameSimulation`

```typescript
class GameSimulation implements IGameSimulation {
  public readonly instanceId: string;
  public state: IGameState;
  
  // Буферы для Lag Compensation и предсказаний
  private inputBuffer: RingBuffer<PlayerInputWithTimestamp>;
  private stateBuffer: RingBuffer<WorldStateWithTimestamp>;
  
  // Подсистемы
  // ...
  
  private gameLoop: GameLoop;

  constructor(matchId: string, players: Player[]) {
    // ...инициализация
    this.inputBuffer = new RingBuffer(128); // Храним последние ~2 секунды ввода
    this.stateBuffer = new RingBuffer(64); // Храним последние ~1 секунду состояний
  }

  public addPlayerInput(playerId: string, input: PlayerInput): void {
    // Добавляем ввод в буфер с серверной временной меткой
    this.inputBuffer.add({ ...input, receivedAt: Date.now() });
  }
  
  public update(deltaTime: number): void {
    // 1. Обработать ввод из буфера
    this.processInputs();
    
    // ... (обновление подсистем) ...

    // 6. Сгенерировать WorldState
    const newWorldState = this.generateWorldState();

    // 7. Сохранить состояние в буфер
    this.stateBuffer.add({ ...newWorldState, timestamp: Date.now() });

    // 8. Отправить WorldState клиентам
    this.publishWorldState(newWorldState);
  }

  /**
   * "Отматывает" мир назад для точной проверки, например, выстрела.
   * @param timestamp - Временная метка события на клиенте.
   */
  private rewindAndCheck(timestamp: number): IGameState {
    // 1. Найти два ближайших состояния в stateBuffer, между которыми находится timestamp.
    // 2. Интерполировать между ними, чтобы получить точное состояние мира на этот момент.
    // 3. Вернуть "отмотанное" состояние для дальнейших проверок (например, hit detection).
    return {} as IGameState;
  }
  
  // ...другие методы
}
```

**Ключевые компоненты:**
-   **`inputBuffer`**: Кольцевой буфер для `PlayerInput`. Каждый `input` сохраняется с серверной временной меткой `receivedAt` для анализа задержек.
-   **`stateBuffer`**: Кольцевой буфер, хранящий последние N состояний мира (`WorldState`) вместе с их серверными временными метками. Это позволяет "отматывать" время.
-   **`GameLoop`**: Объект, реализующий логику таймера с самокоррекцией (см. `25_game_loop_best_practices.md`). Он вызывает `update()` этого класса.
-   **Подсистемы (`Systems`):** Каждый отвечает за свой аспект игры:
    -   `PhysicsSystem`: Движение, коллизии.
    -   `CombatSystem`: Логика выстрелов, урона. При проверке попадания вызывает `rewindAndCheck()` для компенсации лага.
    -   `AISystem`: Поведение врагов.
    -   `SpawnSystem`: Логика появления новых врагов (волны).
-   **`rewindAndCheck(timestamp)`**: Ключевой метод для **Lag Compensation**. Когда сервер обрабатывает выстрел, он смотрит на `clientTimestamp` этого выстрела, находит соответствующее прошлое состояние мира в `stateBuffer` и производит проверку попадания в "прошлом".

---

## 3. Сравнение с GDD и реализацией на Клиенте

Эта архитектура **полностью соответствует** тому, что заложено в GDD и уже реализовано на клиенте.

| Серверная реализация (описанная здесь) | GDD (`28_server_architecture.md`) | Клиентская реализация | Соответствие |
|----------------------------------------|-----------------------------------|---------------------------------|--------------|
| `GameLoop` с фиксированным тиком | **Прямое соответствие.** Описан `GameLoop` с `Fixed Tick Rate`. | `ServerGameLoop` | ✅ **Да** |
| `inputQueue` для `PlayerInput` | **Прямое соответствие.** Описан `InputBuffer`. | `InputBuffer` | ✅ **Да** |
| Отправка `WorldState` после тика | **Прямое соответствие.** Описана отправка `StateBuffer`. | `ServerGameBridge` ожидает `WorldState`. | ✅ **Да** |
| `PhysicsSystem` / `CombatSystem` | **Логическое соответствие.** Документы `04_combat_systems.md` и другие описывают эту логику. | Есть `PhysicsSystem`, `CombatSystem` в клиентской симуляции. | ✅ **Да** |
| Интерфейсы `PlayerInput`, `WorldState` | **Прямое соответствие.** `25_network_protocol.md` описывает эти структуры. | Используются те же DTO. | ✅ **Да** |

**Вывод:**
Предложенная серверная архитектура является полноценной, масштабируемой реализацией того, что было спроектировано в GDD и частично имитируется на клиенте. Клиент готов к интеграции с таким сервером без необходимости серьезных изменений.
