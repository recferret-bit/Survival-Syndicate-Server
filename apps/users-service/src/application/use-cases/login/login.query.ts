import { LoginRequestDto } from './login.dto';

export class LoginQuery {
  constructor(public readonly request: LoginRequestDto) {}
}
