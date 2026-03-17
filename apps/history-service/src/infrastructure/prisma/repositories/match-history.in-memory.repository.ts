import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MatchHistoryPortRepository } from '@app/history-service/application/ports/match-history.port.repository';
import { CreateMatchHistory } from '@app/history-service/domain/entities/match-history/match-history.type';
import { MatchHistory } from '@app/history-service/domain/entities/match-history/match-history';

@Injectable()
export class MatchHistoryInMemoryRepository extends MatchHistoryPortRepository {
  private readonly histories = new Map<string, MatchHistory>();

  async create(data: CreateMatchHistory): Promise<MatchHistory> {
    const entity = new MatchHistory({
      id: randomUUID(),
      matchId: data.matchId,
      finishedAt: data.finishedAt,
    });
    this.histories.set(entity.id, entity);
    return entity;
  }

  async findById(id: string): Promise<MatchHistory | null> {
    return this.histories.get(id) ?? null;
  }

  async findByMatchId(matchId: string): Promise<MatchHistory | null> {
    return (
      Array.from(this.histories.values()).find((h) => h.matchId === matchId) ??
      null
    );
  }
}
