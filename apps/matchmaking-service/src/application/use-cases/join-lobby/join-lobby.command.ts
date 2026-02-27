export class JoinLobbyCommand {
  constructor(
    public readonly lobbyId: string,
    public readonly playerId: string,
  ) {}
}
