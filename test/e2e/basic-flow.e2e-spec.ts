/**
 * E2E: базовый флоу (TASK-3.1)
 *
 * Проверяет полный сценарий: register → JWT → matchmaking (join-solo) → WS connect →
 * authenticate → echo (input → state) → disconnect.
 *
 * Требования: все MVP-сервисы запущены (npm run start:local) и Docker infra (npm run docker:infra).
 * URL: E2E_AUTH_BASE_URL, E2E_MATCHMAKING_BASE_URL; при необходимости E2E_WEBSOCKET_OVERRIDE_URL
 * (например ws://localhost:3006/ws), если zone heartbeat отдаёт другой URL.
 */

import axios, { type AxiosInstance } from 'axios';
import WebSocket from 'ws';

const AUTH_BASE_URL =
  process.env.E2E_AUTH_BASE_URL ?? 'http://localhost:3001/api/v1';
const MATCHMAKING_BASE_URL =
  process.env.E2E_MATCHMAKING_BASE_URL ?? 'http://localhost:3003/api/v1';
/** Override WS URL when zone heartbeat reports a different port (e.g. ws://localhost:3006/ws). */
const WEBSOCKET_URL_OVERRIDE = process.env.E2E_WEBSOCKET_OVERRIDE_URL;

function createAuthClient(): AxiosInstance {
  return axios.create({
    baseURL: AUTH_BASE_URL,
    timeout: 10_000,
    validateStatus: () => true,
  });
}

function createMatchmakingClient(token: string): AxiosInstance {
  return axios.create({
    baseURL: MATCHMAKING_BASE_URL,
    timeout: 10_000,
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  });
}

describe('E2E: базовый флоу (register → JWT → matchmaking → WS → echo → disconnect)', () => {
  const timeoutMs = 25_000;

  it(
    'register → JWT → join-solo → WebSocket authenticate → input/state echo → disconnect',
    async () => {
      const auth = createAuthClient();
      const email = `e2e-${Date.now()}@example.com`;
      const username = `user-${Date.now()}`;
      const password = 'StrongPassword123';

      // 1. Регистрация пользователя (POST /auth/register)
      const registerRes = await auth.post('/auth/register', {
        email,
        username,
        password,
      });
      expect(registerRes.status).toBe(200);
      expect(registerRes.data).toHaveProperty('tokens');
      expect(registerRes.data.tokens).toHaveProperty('accessToken');
      expect(registerRes.data).toHaveProperty('user');
      expect(registerRes.data.user).toHaveProperty('id');

      const accessToken = registerRes.data.tokens.accessToken as string;
      const userId = registerRes.data.user.id as string;

      // 2. JWT получен (уже в accessToken)

      // 3. Solo join (POST /matchmaking/join-solo)
      const matchmaking = createMatchmakingClient(accessToken);
      const joinRes = await matchmaking.post('/matchmaking/join-solo', {});
      expect(joinRes.status).toBe(200);
      expect(joinRes.data).toHaveProperty('matchId');
      expect(joinRes.data).toHaveProperty('websocketUrl');
      expect(joinRes.data).toHaveProperty('playerIds');

      const { matchId, websocketUrl } = joinRes.data as {
        matchId: string;
        websocketUrl: string;
        playerIds: string[];
      };
      expect(matchId).toBeTruthy();
      expect(websocketUrl).toBeTruthy();

      const wsUrl = WEBSOCKET_URL_OVERRIDE ?? websocketUrl;

      // Даём время оркестратору и gameplay обработать matchmaking.found_match
      await new Promise((r) => setTimeout(r, 800));

      // 4. WebSocket подключение + authenticate
      await expect(
        new Promise<void>((resolve, reject) => {
          const ws = new WebSocket(wsUrl);
          const received: Record<string, unknown>[] = [];

          const cleanup = () => {
            try {
              ws.removeAllListeners();
              if (ws.readyState === WebSocket.OPEN) ws.close();
            } catch {
              /* ignore */
            }
          };

          ws.on('open', () => {
            ws.send(
              JSON.stringify({
                type: 'authenticate',
                token: accessToken,
                matchId,
              }),
            );
          });

          ws.on('message', (raw: Buffer | string) => {
            const data = JSON.parse(
              typeof raw === 'string' ? raw : raw.toString(),
            ) as Record<string, unknown>;
            received.push(data);

            if (data.type === 'authenticate_success') {
              expect(data.matchId).toBe(matchId);
              expect(data.playerId).toBe(userId);
              // 5. Эхо: отправка input → получение state
              ws.send(
                JSON.stringify({
                  type: 'input',
                  sequenceNumber: 1,
                  clientTimestamp: Date.now(),
                  movement: { x: 0, y: 1 },
                }),
              );
              return;
            }

            if (data.type === 'state') {
              expect(typeof data.serverTick).toBe('number');
              expect(typeof data.serverTimestamp).toBe('number');
              expect(data.lastProcessedInput).toBe(1);
              // 6. Disconnect
              cleanup();
              resolve();
            }
          });

          ws.on('error', (err) => {
            cleanup();
            reject(err);
          });

          ws.on('close', () => {
            if (received.some((r) => r.type === 'state')) return;
            cleanup();
            reject(new Error('WebSocket closed before receiving state'));
          });

          setTimeout(() => {
            if (received.some((r) => r.type === 'state')) return;
            cleanup();
            reject(
              new Error(
                `Timeout. Received messages: ${JSON.stringify(received)}`,
              ),
            );
          }, 15_000);
        }),
      ).resolves.toBeUndefined();
    },
    timeoutMs,
  );
});
