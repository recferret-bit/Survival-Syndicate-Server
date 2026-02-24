export enum AnalyticsEventName {
  signUp = 'sign_up',
  login = 'login',
  depositSuccess = 'purchase',
  depositFailed = 'deposit_failed',
  withdrawalSuccess = 'refund',
  withdrawalFailed = 'withdrawal_failed',
  bonusActivated = 'bonus_activated',
  bonusRejected = 'bonus_rejected',
  bonusExpired = 'bonus_expired',
  bonusWagered = 'bonus_wagered',
}

export enum AnalyticsDepositType {
  first = 'first',
  recurring = 'recurring',
}

export enum AnalyticsBonusType {
  fs = 'FS',
  deposit = 'Deposit',
  promocode = 'Promocode',
}

export interface AnalyticsDto {
  gaClientId?: string;
  yaClientId?: string;
  userId: number;
  event:
    | SingUpAnalyticsEvent
    | LoginAnalyticsEvent
    | DepositSuccessAnalyticsEvent
    | DepositFailedAnalyticsEvent
    | WithdrawalSuccessAnalyticsEvent
    | WithdrawalFailedAnalyticsEvent
    | BonusActivatedAnalyticsEvent
    | BonusExpiredAnalyticsEvent
    | BonusRejectedAnalyticsEvent
    | BonusWageredAnalyticsEvent;
}

interface SingUpAnalyticsEvent {
  name: AnalyticsEventName.signUp;
  params: { method: string };
}

interface LoginAnalyticsEvent extends Omit<SingUpAnalyticsEvent, 'name'> {
  name: AnalyticsEventName.login;
}

interface DepositSuccessAnalyticsEvent {
  name: AnalyticsEventName.depositSuccess;
  params: {
    value: number;
    currency: string;
    transaction_id: string;
    payment_system: string;
    method: string;
    method_id: string;
    deposit_type: AnalyticsDepositType;
    bonus_used: boolean;
    bonus_name?: string;
    bonus_id?: string;
  };
}

interface DepositFailedAnalyticsEvent
  extends Omit<DepositSuccessAnalyticsEvent, 'name'> {
  name: AnalyticsEventName.depositFailed;
}

interface WithdrawalSuccessAnalyticsEvent {
  name: AnalyticsEventName.withdrawalSuccess;
  params: {
    value: number;
    currency: string;
    transaction_id: string;
    payment_system: string;
    method: string;
    method_id: string;
  };
}

interface WithdrawalFailedAnalyticsEvent
  extends Omit<WithdrawalSuccessAnalyticsEvent, 'name'> {
  name: AnalyticsEventName.withdrawalFailed;
}

interface BonusActivatedAnalyticsEvent {
  name: AnalyticsEventName.bonusActivated;
  params: {
    bonus_id: string;
    bonus_type: AnalyticsBonusType;
    bonus_name: string;
  };
}

interface BonusRejectedAnalyticsEvent
  extends Omit<BonusActivatedAnalyticsEvent, 'name'> {
  name: AnalyticsEventName.bonusRejected;
}

interface BonusExpiredAnalyticsEvent
  extends Omit<BonusActivatedAnalyticsEvent, 'name'> {
  name: AnalyticsEventName.bonusExpired;
}

interface BonusWageredAnalyticsEvent
  extends Omit<BonusActivatedAnalyticsEvent, 'name'> {
  name: AnalyticsEventName.bonusWagered;
}
