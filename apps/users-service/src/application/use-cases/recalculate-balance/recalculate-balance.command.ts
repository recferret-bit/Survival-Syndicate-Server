import { RecalculateBalanceRequestDto } from './recalculate-balance.dto';

export class RecalculateBalanceCommand {
  constructor(public readonly request: RecalculateBalanceRequestDto) {}
}
