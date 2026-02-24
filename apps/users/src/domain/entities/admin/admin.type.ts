import BigNumber from 'bignumber.js';

export enum AdminStatus {
  active = 'active',
  inactive = 'inactive',
}

export interface AdminProps {
  id: BigNumber;
  email: string;
  apiKey: string;
  status: AdminStatus;
  createdAt: Date;
  updatedAt: Date;
}
