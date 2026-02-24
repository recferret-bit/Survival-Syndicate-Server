import BigNumber from 'bignumber.js';

export interface TrackingProps {
  id: number;
  userId: BigNumber;
  firstIp: string;
  lastIp: string;
  gaClientId?: string;
  yaClientId?: string;
  clickId?: string;
  utmMedium?: string;
  utmSource?: string;
  utmCampaign?: string;
  pid?: string;
  sub1?: string;
  sub2?: string;
  sub3?: string;
}

export type CreateTracking = Omit<TrackingProps, 'id'>;
