import { RegisterRequestDto } from './register.dto';

export class RegisterCommand {
  constructor(public readonly request: RegisterRequestDto) {}
}
