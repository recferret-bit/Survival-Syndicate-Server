# Интерфейсы симуляции игры

Этот документ определяет TypeScript-интерфейсы для управления одним инстансом игровой симуляции (`GameSimulation`) и описания его состояния (`GameState`).

Эти интерфейсы будут использоваться внутри `Gameplay Service` для управления множеством параллельных матчей.

---

## 1. `IGameSimulation` - Интерфейс инстанса игры

Описывает методы, которые должен предоставлять каждый инстанс симуляции.

```typescript
import { PlayerInput } from './player_input'; // Предполагаемый DTO

interface IGameSimulation {
  /**
   * Уникальный идентификатор этого инстанса игры/матча.
   */
  readonly instanceId: string;

  /**
   * Текущее состояние игры.
   */
  readonly state: IGameState;

  /**
   * Запускает игровой цикл (GameLoop) для этого инстанса.
   */
  start(): void;

  /**
   * Останавливает игровой цикл.
   */
  stop(): void;

  /**
   * Добавляет ввод от игрока в очередь на обработку в следующем тике.
   * @param playerId - ID игрока.
   * @param input - Объект с данными ввода.
   */
  addPlayerInput(playerId: string, input: PlayerInput): void;

  /**
   * Обновляет состояние симуляции на один шаг (тик).
   * Вызывается таймером с фиксированной частотой.
   * @param deltaTime - Время, прошедшее с предыдущего тика, в секундах.
   */
  update(deltaTime: number): void;
}
```

---

## 2. `IGameState` - Интерфейс состояния игры

Описывает структуру данных, которая хранится в `Gameplay Service` для каждого активного инстанса. Это "снимок" текущего состояния матча.

```typescript
interface IPlayerState {
  playerId: string;
  // Другие данные об игроке в матче: позиция, здоровье, статы и т.д.
  position: { x: number; y: number };
  health: number;
}

interface IGameState {
  /**
   * Уникальный идентификатор этого инстанса, совпадает с IGameSimulation.instanceId.
   */
  readonly instanceId: string;

  /**
   * Карта (Map) с состояниями всех игроков в этом матче.
   * Ключ - playerId, значение - объект с состоянием игрока.
   */
  readonly players: Map<string, IPlayerState>;

  /**
   * Время с начала матча в миллисекундах.
   */
  readonly gameTimeMs: number;
  
  /**
   * Текущий статус матча (ожидание, идет, закончен).
   */
  readonly status: 'waiting' | 'in_progress' | 'finished';

  // Другие глобальные данные о матче: состояние мира, номер тика и т.д.
}
```
