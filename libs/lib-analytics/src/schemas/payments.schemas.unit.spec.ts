import { CurrencyCode } from '@lib/shared/currency';
import {
  AnalyticsSubjects,
  DepositCompletedRequestSchema,
  GetUserStatsRequestSchema,
} from './payments.schemas';

describe('lib-analytics payments schemas', () => {
  it('validates DepositCompletedRequestSchema', () => {
    expect(
      DepositCompletedRequestSchema.parse({
        userId: '5',
        amount: '2500',
        currency: CurrencyCode.USD,
        transactionId: 'tx-55',
      }),
    ).toBeDefined();
    expect(() =>
      DepositCompletedRequestSchema.parse({
        userId: '5',
        amount: 'invalid',
        currency: CurrencyCode.USD,
        transactionId: 'tx-55',
      }),
    ).toThrow();
  });

  it('validates GetUserStatsRequestSchema', () => {
    expect(GetUserStatsRequestSchema.parse({ userId: '5' })).toEqual({
      userId: '5',
    });
    expect(() => GetUserStatsRequestSchema.parse({ userId: 'abc' })).toThrow();
  });

  it('defines AnalyticsSubjects constants', () => {
    expect(AnalyticsSubjects.DEPOSIT_COMPLETED).toBe(
      'payments.deposit.completed.v1',
    );
    expect(AnalyticsSubjects.GET_USER_STATS).toBe('payments.user-stats.get.v1');
  });
});
