export abstract class WebsocketPort {
  abstract isHealthy(): Promise<boolean>;
}
