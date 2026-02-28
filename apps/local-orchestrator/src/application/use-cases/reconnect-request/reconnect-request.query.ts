export class ReconnectRequestQuery {
  constructor(
    public readonly matchId: string,
    public readonly playerId: string,
  ) {}
}
