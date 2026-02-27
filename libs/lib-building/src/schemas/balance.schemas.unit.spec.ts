import {
  AddBalanceEntryRequestSchema,
  BuildingSubjects,
  CreateUserBalanceRequestSchema,
} from './balance.schemas';

describe('lib-building balance schemas', () => {
  it('validates CreateUserBalanceRequestSchema payload', () => {
    expect(
      CreateUserBalanceRequestSchema.parse({
        userId: '42',
        currencyIsoCodes: ['USD'],
      }),
    ).toEqual({
      userId: '42',
      currencyIsoCodes: ['USD'],
    });
    expect(() =>
      CreateUserBalanceRequestSchema.parse({
        userId: '42',
        currencyIsoCodes: [],
      }),
    ).toThrow();
  });

  it('validates AddBalanceEntryRequestSchema numeric amount string', () => {
    expect(
      AddBalanceEntryRequestSchema.parse({
        userId: '42',
        operationId: 'op-1',
        currencyType: 'fiat',
        amount: '1000',
        operationType: 'add',
        operationStatus: 'completed',
        reason: 'games_bet',
      }),
    ).toBeDefined();
    expect(() =>
      AddBalanceEntryRequestSchema.parse({
        userId: '42',
        operationId: 'op-1',
        currencyType: 'fiat',
        amount: '-1',
        operationType: 'add',
        operationStatus: 'completed',
        reason: 'games_bet',
      }),
    ).toThrow();
  });

  it('defines BuildingSubjects constants', () => {
    expect(BuildingSubjects.CREATE_USER_BALANCE).toBe(
      'balance.create-user-balance.v1',
    );
    expect(BuildingSubjects.GET_USER_BALANCE).toBe(
      'balance.get-user-balance.v1',
    );
  });
});
