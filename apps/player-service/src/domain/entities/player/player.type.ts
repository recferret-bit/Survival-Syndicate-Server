import BigNumber from 'bignumber.js';

export interface PlayerProps {
  id: BigNumber;
  userId: BigNumber;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreatePlayer = Omit<PlayerProps, 'id' | 'createdAt' | 'updatedAt'>;
