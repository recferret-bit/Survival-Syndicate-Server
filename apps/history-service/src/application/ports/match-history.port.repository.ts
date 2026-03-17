import { MatchHistory } from '@app/history-service/domain/entities/match-history/match-history';
import { CreateMatchHistory } from '@app/history-service/domain/entities/match-history/match-history.type';

export abstract class MatchHistoryPortRepository {
  abstract create(data: CreateMatchHistory): Promise<MatchHistory>;
  abstract findById(id: string): Promise<MatchHistory | null>;
  abstract findByMatchId(matchId: string): Promise<MatchHistory | null>;
}
