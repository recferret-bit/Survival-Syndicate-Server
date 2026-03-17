export interface MatchHistoryProps {
  id: string;
  matchId: string;
  finishedAt: Date;
}

export type CreateMatchHistory = Omit<MatchHistoryProps, 'id'>;
