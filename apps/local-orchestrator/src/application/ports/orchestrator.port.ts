export abstract class OrchestratorPort {
  abstract isHealthy(): Promise<boolean>;
}
