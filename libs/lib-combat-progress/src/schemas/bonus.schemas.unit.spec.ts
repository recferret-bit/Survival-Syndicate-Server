import { CurrencyCode } from '@lib/shared/currency';
import { BonusType } from '../types/bonus.types';
import {
  CombatProgressSubjects,
  CreateDepositBonusRequestSchema,
  UserIdRequestSchema,
} from './bonus.schemas';

describe('lib-combat-progress bonus schemas', () => {
  it('validates CreateDepositBonusRequestSchema', () => {
    expect(
      CreateDepositBonusRequestSchema.parse({
        userId: '7',
        depositAmount: '1000',
        currency: CurrencyCode.EUR,
        type: BonusType.DEPOSIT,
        transactionId: 'tx-1',
      }),
    ).toBeDefined();
    expect(() =>
      CreateDepositBonusRequestSchema.parse({
        userId: '7',
        depositAmount: 'bad',
        currency: CurrencyCode.EUR,
        type: BonusType.DEPOSIT,
        transactionId: 'tx-1',
      }),
    ).toThrow();
  });

  it('validates UserIdRequestSchema', () => {
    expect(UserIdRequestSchema.parse({ userId: '7' })).toEqual({ userId: '7' });
    expect(() => UserIdRequestSchema.parse({ userId: 'u7' })).toThrow();
  });

  it('defines CombatProgressSubjects constants', () => {
    expect(CombatProgressSubjects.CREATE_DEPOSIT_BONUS).toBe(
      'bonus.deposit.create',
    );
    expect(CombatProgressSubjects.GET_BONUSES).toBe('bonus.bonuses.get');
  });
});
