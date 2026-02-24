import { z } from 'zod';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';
import { OperationType } from '@app/balance/domain/value-objects/operation-type';
import { OperationStatus } from '@app/balance/domain/value-objects/operation-status';
import { LedgerReason } from '@app/balance/domain/value-objects/ledger-reason';

export const AddBalanceEntryRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  operationId: z.string().min(1),
  currencyType: z.nativeEnum(CurrencyType),
  amount: z.string().regex(/^\d+$/, 'Amount must be a positive integer string'),
  operationType: z.nativeEnum(OperationType),
  operationStatus: z.nativeEnum(OperationStatus),
  reason: z.nativeEnum(LedgerReason),
});

export type AddBalanceEntryRequestDto = z.infer<
  typeof AddBalanceEntryRequestSchema
>;

export interface AddBalanceEntryResponseDto {
  success: boolean;
  ledgerEntryId: string;
}
