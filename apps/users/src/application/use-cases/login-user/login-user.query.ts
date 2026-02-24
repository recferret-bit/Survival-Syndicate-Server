import { LoginUserRequestDto } from './login-user.dto';

export class LoginUserQuery {
  constructor(public readonly request: LoginUserRequestDto & { ip: string }) {}
}
