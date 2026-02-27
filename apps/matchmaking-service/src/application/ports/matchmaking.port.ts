export abstract class MatchmakingPort {
  abstract isHealthy(): Promise<boolean>;
}
