export class LeaveLobbyCommand {
  constructor(
    public readonly lobbyId: string,
    public readonly playerId: string,
  ) {}
}
