export abstract class GameplayPort {
  abstract isHealthy(): Promise<boolean>;
}
