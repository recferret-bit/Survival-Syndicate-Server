import { CreateUserBalanceRequestDto } from './create-user-balance.dto';

export class CreateUserBalanceCommand {
  constructor(public readonly request: CreateUserBalanceRequestDto) {}
}
