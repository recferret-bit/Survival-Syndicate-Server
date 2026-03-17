/**
 * Bull queue names. Used for registration and injection.
 */
export const QUEUE_PASSIVE_INCOME = 'passive-income';
export const QUEUE_JOB_RESET = 'job-reset';
export const QUEUE_SHOP_ROTATION = 'shop-rotation';
export const QUEUE_LEADERBOARD = 'leaderboard';

export const SCHEDULER_QUEUE_NAMES = [
  QUEUE_PASSIVE_INCOME,
  QUEUE_JOB_RESET,
  QUEUE_SHOP_ROTATION,
  QUEUE_LEADERBOARD,
] as const;
