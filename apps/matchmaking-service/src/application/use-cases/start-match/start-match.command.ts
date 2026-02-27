export class StartMatchCommand {
  constructor(
    public readonly lobbyId: string,
    public readonly requestedByPlayerId: string,
  ) {}
}
