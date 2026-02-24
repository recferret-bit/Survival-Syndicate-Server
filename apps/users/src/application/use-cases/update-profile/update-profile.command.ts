import { UpdateProfileRequestDto } from './update-profile.dto';

export class UpdateProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly request: UpdateProfileRequestDto,
  ) {}
}
