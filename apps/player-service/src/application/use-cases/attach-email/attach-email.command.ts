import { AttachEmailRequestDto } from './attach-email.dto';

export class AttachEmailCommand {
  constructor(
    public readonly userId: string,
    public readonly request: AttachEmailRequestDto,
  ) {}
}
