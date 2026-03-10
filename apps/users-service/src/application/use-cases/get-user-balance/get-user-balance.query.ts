import { GetUserBalanceRequestDto } from './get-user-balance.dto';

export class GetUserBalanceQuery {
  constructor(public readonly request: GetUserBalanceRequestDto) {}
}
