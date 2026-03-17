export interface ReplayProps {
  id: string;
  matchId: string;
  data: Record<string, unknown>;
  createdAt: Date;
}

export type CreateReplay = Omit<ReplayProps, 'id' | 'createdAt'> & {
  createdAt?: Date;
};
