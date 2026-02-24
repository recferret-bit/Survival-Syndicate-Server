import { RegisterUserRequestDto } from './register-user.dto';

export class RegisterUserCommand {
  constructor(
    public readonly request: RegisterUserRequestDto & { ip: string },
  ) {}
}
