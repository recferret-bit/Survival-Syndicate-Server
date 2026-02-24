import { IncreaseFiatBalanceRequestDto } from './increase-fiat-balance.dto';

export class IncreaseFiatBalanceCommand {
  constructor(
    public readonly request: IncreaseFiatBalanceRequestDto,
    public readonly adminId?: string,
  ) {}
}
