import { AddBalanceEntryRequestDto } from './add-balance-entry.dto';

export class AddBalanceEntryCommand {
  constructor(public readonly request: AddBalanceEntryRequestDto) {}
}
