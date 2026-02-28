import { Injectable } from '@nestjs/common';

type SlotState = {
  connected: boolean;
  graceExpired: boolean;
};

export type ReconnectStatus =
  | 'success'
  | 'SLOT_NOT_AVAILABLE'
  | 'GRACE_EXPIRED'
  | 'MATCH_NOT_FOUND';

@Injectable()
export class SlotManagerService {
  private readonly slots = new Map<string, Map<string, SlotState>>();

  initializeMatchSlots(matchId: string, playerIds: string[]): void {
    const matchSlots = new Map<string, SlotState>();
    for (const playerId of playerIds) {
      matchSlots.set(playerId, { connected: true, graceExpired: false });
    }
    this.slots.set(matchId, matchSlots);
  }

  hasMatch(matchId: string): boolean {
    return this.slots.has(matchId);
  }

  markDisconnected(matchId: string, playerId: string): void {
    const slot = this.slots.get(matchId)?.get(playerId);
    if (!slot) {
      return;
    }
    slot.connected = false;
  }

  markConnected(matchId: string, playerId: string): void {
    const slot = this.slots.get(matchId)?.get(playerId);
    if (!slot) {
      return;
    }
    slot.connected = true;
    slot.graceExpired = false;
  }

  markGraceExpired(matchId: string, playerId: string): void {
    const slot = this.slots.get(matchId)?.get(playerId);
    if (!slot) {
      return;
    }
    slot.graceExpired = true;
  }

  evaluateReconnect(matchId: string, playerId: string): ReconnectStatus {
    const matchSlots = this.slots.get(matchId);
    if (!matchSlots) {
      return 'MATCH_NOT_FOUND';
    }
    const slot = matchSlots.get(playerId);
    if (!slot) {
      return 'SLOT_NOT_AVAILABLE';
    }
    if (slot.graceExpired) {
      return 'GRACE_EXPIRED';
    }
    return 'success';
  }
}
