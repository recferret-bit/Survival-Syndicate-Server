import { UserRegisteredEvent } from '@lib/lib-users';

export class CreateProfileCommand {
  constructor(public readonly event: UserRegisteredEvent) {}
}
