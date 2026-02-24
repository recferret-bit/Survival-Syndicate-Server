import { UserBalance } from '@app/balance/domain/entities/user-balance/user-balance';
import { UserBalanceProps } from '@app/balance/domain/entities/user-balance/user-balance.type';
import { BalanceResult } from '@app/balance/domain/entities/balance-result/balance-result';
import { BalanceResultProps } from '@app/balance/domain/entities/balance-result/balance-result.type';
import { BalanceLedgerEntry } from '@app/balance/domain/entities/balance-ledger-entry/balance-ledger-entry';
import { BalanceLedgerEntryProps } from '@app/balance/domain/entities/balance-ledger-entry/balance-ledger-entry.type';
import { BalanceAmount } from '@app/balance/domain/value-objects/balance-amount';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';
import { OperationType } from '@app/balance/domain/value-objects/operation-type';
import { OperationStatus } from '@app/balance/domain/value-objects/operation-status';
import { LedgerReason } from '@app/balance/domain/value-objects/ledger-reason';
import BigNumber from 'bignumber.js';
import type { CreateUserBalanceRequestDto } from '@app/balance/application/use-cases/create-user-balance/create-user-balance.dto';
import type { GetUserBalanceResponseDto } from '@app/balance/application/use-cases/get-user-balance/get-user-balance.dto';
import { CurrencyCode } from '@lib/shared/currency';

export class BalanceFixtures {
  static createBalanceResultProps(
    overrides?: Partial<BalanceResultProps>,
  ): BalanceResultProps {
    return {
      id: 'balance-result-1',
      userId: new BigNumber(1),
      balance: BalanceAmount.fromUnit(0),
      currencyIsoCode: 'USD',
      lastCalculatedAt: new Date(),
      ...overrides,
    };
  }

  static createBalanceResult(
    overrides?: Partial<BalanceResultProps>,
  ): BalanceResult {
    return new BalanceResult(this.createBalanceResultProps(overrides));
  }

  static createUserBalanceProps(
    overrides?: Partial<UserBalanceProps>,
  ): UserBalanceProps {
    const fiatBalance = this.createBalanceResult({
      currencyIsoCode: 'USD',
    });
    const bonusBalance = this.createBalanceResult({
      currencyIsoCode: 'USD',
    });
    const cryptoBalance = this.createBalanceResult({
      currencyIsoCode: 'USD',
    });

    return {
      id: 'user-balance-1',
      userId: new BigNumber(1),
      fiatBalance,
      bonusBalance,
      cryptoBalance,
      ...overrides,
    };
  }

  static createUserBalance(overrides?: Partial<UserBalanceProps>): UserBalance {
    return new UserBalance(this.createUserBalanceProps(overrides));
  }

  static createCreateUserBalanceRequest(
    overrides?: Partial<CreateUserBalanceRequestDto>,
  ): CreateUserBalanceRequestDto {
    return {
      userId: '1',
      currencyIsoCodes: [CurrencyCode.USD],
      ...overrides,
    };
  }

  static createGetUserBalanceResponseDto(
    overrides?: Partial<GetUserBalanceResponseDto>,
  ): GetUserBalanceResponseDto {
    return {
      balances: [
        {
          currencyIsoCode: CurrencyCode.USD,
          balance: '0',
          balanceDecimals: 0,
          currencyType: CurrencyType.FIAT,
        },
        {
          currencyIsoCode: CurrencyCode.USD,
          balance: '0',
          balanceDecimals: 0,
          currencyType: CurrencyType.BONUS,
        },
      ],
      ...overrides,
    };
  }

  static createUserBalanceWithAmount(
    userId: BigNumber,
    amount: number,
    currency: CurrencyCode = CurrencyCode.USD,
  ): UserBalance {
    const userIdBN = userId;
    const fiatBalance = this.createBalanceResult({
      userId: userIdBN,
      balance: BalanceAmount.fromUnit(amount),
      currencyIsoCode: currency,
    });
    const bonusBalance = this.createBalanceResult({
      userId: userIdBN,
      balance: BalanceAmount.fromUnit(0),
      currencyIsoCode: currency,
    });
    const cryptoBalance = this.createBalanceResult({
      userId: userIdBN,
      balance: BalanceAmount.fromUnit(0),
      currencyIsoCode: currency,
    });

    return this.createUserBalance({
      userId: userIdBN,
      fiatBalance,
      bonusBalance,
      cryptoBalance,
    });
  }

  static createBalanceLedgerEntryProps(
    overrides?: Partial<BalanceLedgerEntryProps>,
  ): BalanceLedgerEntryProps {
    return {
      id: 'ledger-entry-1',
      userId: new BigNumber(1),
      operationId: 'op-123',
      currencyType: CurrencyType.FIAT,
      amount: BalanceAmount.fromUnit(1000),
      operationType: OperationType.ADD,
      operationStatus: OperationStatus.COMPLETED,
      reason: LedgerReason.PAYMENTS_DEPOSIT,
      createdAt: new Date(),
      ...overrides,
    };
  }

  static createBalanceLedgerEntry(
    overrides?: Partial<BalanceLedgerEntryProps>,
  ): BalanceLedgerEntry {
    return new BalanceLedgerEntry(
      this.createBalanceLedgerEntryProps(overrides),
    );
  }
}
