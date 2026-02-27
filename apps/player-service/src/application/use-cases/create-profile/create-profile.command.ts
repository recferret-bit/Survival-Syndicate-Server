import { UserRegisteredEvent } from '@lib/lib-player';

export class CreateProfileCommand {
  constructor(public readonly event: UserRegisteredEvent) {}
}
