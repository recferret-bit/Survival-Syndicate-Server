import { AttachPhoneRequestDto } from './attach-phone.dto';

export class AttachPhoneCommand {
  constructor(
    public readonly userId: string,
    public readonly request: AttachPhoneRequestDto,
  ) {}
}
