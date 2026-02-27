export type LobbyStatus = 'open' | 'started' | 'finished';

export type ZoneSelection = {
  zoneId: string;
  websocketUrl: string;
};

export type LobbyProps = {
  id: string;
  ownerPlayerId: string;
  playerIds: string[];
  maxPlayers: number;
  status: LobbyStatus;
  zoneId?: string;
  websocketUrl?: string;
  matchId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateLobby = {
  ownerPlayerId: string;
  maxPlayers: number;
};
