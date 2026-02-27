import { CreateLobbyRequestDto } from './create-lobby.dto';

export class CreateLobbyCommand {
  constructor(
    public readonly playerId: string,
    public readonly request: CreateLobbyRequestDto,
  ) {}
}
