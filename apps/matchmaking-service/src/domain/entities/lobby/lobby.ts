import { Entity } from '@lib/shared';
import { LobbyProps, ZoneSelection } from './lobby.type';

export class Lobby extends Entity<LobbyProps> {
  constructor(props: LobbyProps) {
    super(props);
    this.validate();
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error('Lobby id is required');
    }
    if (!this.props.ownerPlayerId) {
      throw new Error('Owner player id is required');
    }
    if (
      !Array.isArray(this.props.playerIds) ||
      this.props.playerIds.length < 1
    ) {
      throw new Error('Lobby must contain at least one player');
    }
    if (this.props.maxPlayers < 1) {
      throw new Error('maxPlayers must be positive');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get playerIds(): string[] {
    return [...this.props.playerIds];
  }

  get status(): string {
    return this.props.status;
  }

  get matchId(): string | undefined {
    return this.props.matchId;
  }

  get zoneId(): string | undefined {
    return this.props.zoneId;
  }

  get websocketUrl(): string | undefined {
    return this.props.websocketUrl;
  }

  join(playerId: string): void {
    if (this.props.status !== 'open') {
      throw new Error('Lobby is not open');
    }
    if (this.props.playerIds.includes(playerId)) {
      return;
    }
    if (this.props.playerIds.length >= this.props.maxPlayers) {
      throw new Error('Lobby is full');
    }
    this.props.playerIds.push(playerId);
    this.props.updatedAt = new Date();
  }

  leave(playerId: string): void {
    if (this.props.status !== 'open') {
      throw new Error('Lobby is not open');
    }
    if (playerId === this.props.ownerPlayerId) {
      throw new Error('Owner cannot leave lobby');
    }
    this.props.playerIds = this.props.playerIds.filter((id) => id !== playerId);
    this.props.updatedAt = new Date();
  }

  start(matchId: string, zone: ZoneSelection): void {
    if (this.props.status !== 'open') {
      throw new Error('Lobby already started');
    }
    this.props.status = 'started';
    this.props.matchId = matchId;
    this.props.zoneId = zone.zoneId;
    this.props.websocketUrl = zone.websocketUrl;
    this.props.updatedAt = new Date();
  }

  finish(): void {
    this.props.status = 'finished';
    this.props.updatedAt = new Date();
  }
}
