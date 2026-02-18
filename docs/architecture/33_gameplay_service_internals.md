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
  
  private inputQueue: Map<string, PlayerInput[]>;
  
  // Подсистемы
  private physicsSystem: PhysicsSystem;
  private combatSystem: CombatSystem;
  private aiSystem: AISystem;
  private spawnSystem: SpawnSystem;
  
  private gameLoop: GameLoop; // Использует "Подход 2" с самокоррекцией

  constructor(matchId: string, players: Player[]) {
    // ...инициализация
  }

  public start(): void {
    this.gameLoop.start();
  }
  
  public update(deltaTime: number): void {
    // 1. Обработать ввод
    this.processInputs();
    
    // 2. Обновить AI
    this.aiSystem.update(this.state, deltaTime);
    
    // 3. Физика и движение
    this.physicsSystem.update(this.state, deltaTime);
    
    // 4. Логика боя
    this.combatSystem.update(this.state, deltaTime);
    
    // 5. Спавн
    this.spawnSystem.update(this.state, deltaTime);

    // 6. Сгенерировать и отправить WorldState
    this.publishWorldState();
  }
  
  // ...другие методы
}
```

**Ключевые компоненты:**
-   **`inputQueue`**: Очередь, куда складываются `PlayerInput` от игроков для обработки в следующем тике.
-   **`GameLoop`**: Объект, реализующий логику таймера с самокоррекцией (см. `25_game_loop_best_practices.md`). Он вызывает `update()` этого класса.
-   **Подсистемы (`Systems`):** Каждый отвечает за свой аспект игры:
    -   `PhysicsSystem`: Движение, коллизии.
    -   `CombatSystem`: Логика выстрелов, урона.
    -   `AISystem`: Поведение врагов.
    -   `SpawnSystem`: Логика появления новых врагов (волны).

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
