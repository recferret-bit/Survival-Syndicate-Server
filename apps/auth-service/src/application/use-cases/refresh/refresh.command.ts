import { RefreshRequestDto } from './refresh.dto';

export class RefreshCommand {
  constructor(public readonly request: RefreshRequestDto) {}
}
