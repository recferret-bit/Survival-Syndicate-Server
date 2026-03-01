import BigNumber from 'bignumber.js';
import { Entity } from '@lib/shared';
import { BalanceLedgerEntryProps } from './balance-ledger-entry.type';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';
import { OperationType } from '@app/auth-service/domain/value-objects/operation-type';
import { OperationStatus } from '@app/auth-service/domain/value-objects/operation-status';
import { LedgerReason } from '@app/auth-service/domain/value-objects/ledger-reason';
import { BalanceAmount } from '@app/auth-service/domain/value-objects/balance-amount';

export class BalanceLedgerEntry extends Entity<BalanceLedgerEntryProps> {
  constructor(props: BalanceLedgerEntryProps) {
    super(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): BigNumber {
    return this.props.userId;
  }

  get operationId(): string {
    return this.props.operationId;
  }

  get currencyType(): CurrencyType {
    return this.props.currencyType;
  }

  get amount(): BalanceAmount {
    return this.props.amount;
  }

  get operationType(): OperationType {
    return this.props.operationType;
  }

  get operationStatus(): OperationStatus {
    return this.props.operationStatus;
  }

  get reason(): LedgerReason {
    return this.props.reason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  isCompleted(): boolean {
    return this.props.operationStatus === OperationStatus.COMPLETED;
  }

  isPending(): boolean {
    return this.props.operationStatus === OperationStatus.PENDING;
  }

  isHold(): boolean {
    return this.props.operationStatus === OperationStatus.HOLD;
  }

  isFailed(): boolean {
    return this.props.operationStatus === OperationStatus.FAILED;
  }

  isAddOperation(): boolean {
    return this.props.operationType === OperationType.ADD;
  }

  isSubtractOperation(): boolean {
    return this.props.operationType === OperationType.SUBTRACT;
  }
}
