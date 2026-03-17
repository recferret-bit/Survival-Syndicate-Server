/**
 * E2E: реконнект (TASK-3.2)
 *
 * Сценарии:
 * 1) reconnect в пределах grace period -> server.reconnect.success
 * 2) reconnect после grace period -> server.reconnect.error { code: GRACE_EXPIRED }
 *
 * Требования: все MVP-сервисы запущены (npm run start:local) и Docker infra (npm run docker:infra).
 * URL: E2E_AUTH_BASE_URL, E2E_MATCHMAKING_BASE_URL; при необходимости E2E_WEBSOCKET_OVERRIDE_URL.
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

describe('E2E: реконнект (grace success / GRACE_EXPIRED)', () => {
  const timeoutMs = 60_000;

  async function createUserAndJoinMatch() {
    const auth = createAuthClient();
    const email = `e2e-reconnect-${Date.now()}@example.com`;
    const username = `user-reconnect-${Date.now()}`;
    const password = 'StrongPassword123';

    const registerRes = await auth.post('/auth/register', {
      email,
      username,
      password,
    });
    expect(registerRes.status).toBe(200);
    const accessToken = registerRes.data.tokens.accessToken as string;
    const userId = registerRes.data.user.id as string;

    const matchmaking = createMatchmakingClient(accessToken);
    const joinRes = await matchmaking.post('/matchmaking/join-solo', {});
    expect(joinRes.status).toBe(200);
    const { matchId, websocketUrl } = joinRes.data as {
      matchId: string;
      websocketUrl: string;
      playerIds: string[];
    };

    const wsUrl = WEBSOCKET_URL_OVERRIDE ?? websocketUrl;

    // Даём время оркестратору и gameplay обработать matchmaking.found_match
    await new Promise((r) => setTimeout(r, 800));

    return { accessToken, userId, matchId, wsUrl };
  }

  it(
    'reconnect within grace period -> server.reconnect.success',
    async () => {
      const { accessToken, userId, matchId, wsUrl } =
        await createUserAndJoinMatch();

      // 1. Первое подключение и authenticate
      await new Promise<void>((resolve, reject) => {
        const ws = new WebSocket(wsUrl);

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

          if (data.type === 'authenticate_success') {
            expect(data.matchId).toBe(matchId);
            expect(data.playerId).toBe(userId);
            // Инициируем дисконнект клиента
            cleanup();
            resolve();
          }
        });

        ws.on('error', (err) => {
          cleanup();
          reject(err);
        });

        ws.on('close', () => {
          // Ожидаем закрытие после authenticate_success
        });

        setTimeout(() => {
          cleanup();
          reject(
            new Error('Timeout during initial authenticate before reconnect'),
          );
        }, 15_000);
      });

      // 2. Реконнект в пределах grace period
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
                type: 'reconnect',
                token: accessToken,
              }),
            );
          });

          ws.on('message', (raw: Buffer | string) => {
            const data = JSON.parse(
              typeof raw === 'string' ? raw : raw.toString(),
            ) as Record<string, unknown>;
            received.push(data);

            if (data.type === 'reconnect_success') {
              expect(data.matchId).toBe(matchId);
              expect(data.playerId).toBe(userId);
              // Ожидаем, что сервер сразу начнёт слать state
              return;
            }

            if (data.type === 'state') {
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
            reject(
              new Error(
                `WebSocket closed before receiving reconnect_success/state. Received: ${JSON.stringify(
                  received,
                )}`,
              ),
            );
          });

          setTimeout(() => {
            if (received.some((r) => r.type === 'state')) return;
            cleanup();
            reject(
              new Error(
                `Timeout during reconnect within grace. Received: ${JSON.stringify(
                  received,
                )}`,
              ),
            );
          }, 25_000);
        }),
      ).resolves.toBeUndefined();
    },
    timeoutMs,
  );

  it(
    'reconnect after grace period -> server.reconnect.error { code: GRACE_EXPIRED }',
    async () => {
      const { accessToken, userId, matchId, wsUrl } =
        await createUserAndJoinMatch();

      // 1. Первое подключение и authenticate
      await new Promise<void>((resolve, reject) => {
        const ws = new WebSocket(wsUrl);

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

          if (data.type === 'authenticate_success') {
            expect(data.matchId).toBe(matchId);
            expect(data.playerId).toBe(userId);
            cleanup();
            resolve();
          }
        });

        ws.on('error', (err) => {
          cleanup();
          reject(err);
        });

        ws.on('close', () => {
          // ожидаем закрытие после authenticate_success
        });

        setTimeout(() => {
          cleanup();
          reject(
            new Error('Timeout during initial authenticate before reconnect'),
          );
        }, 15_000);
      });

      // 2. Ждём дольше grace period (для MVP используем ~65 секунд)
      await new Promise((r) => setTimeout(r, 65_000));

      // 3. Попытка реконнекта после grace period
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
                type: 'reconnect',
                token: accessToken,
              }),
            );
          });

          ws.on('message', (raw: Buffer | string) => {
            const data = JSON.parse(
              typeof raw === 'string' ? raw : raw.toString(),
            ) as Record<string, unknown>;
            received.push(data);

            if (data.type === 'reconnect_error') {
              expect(data.code).toBe('GRACE_EXPIRED');
              cleanup();
              resolve();
            }
          });

          ws.on('error', (err) => {
            cleanup();
            reject(err);
          });

          ws.on('close', () => {
            if (received.some((r) => r.type === 'reconnect_error')) return;
            cleanup();
            reject(
              new Error(
                `WebSocket closed before receiving reconnect_error. Received: ${JSON.stringify(
                  received,
                )}`,
              ),
            );
          });

          setTimeout(() => {
            if (received.some((r) => r.type === 'reconnect_error')) return;
            cleanup();
            reject(
              new Error(
                `Timeout during reconnect after grace. Received: ${JSON.stringify(
                  received,
                )}`,
              ),
            );
          }, 25_000);
        }),
      ).resolves.toBeUndefined();
    },
    timeoutMs + 70_000,
  );
});
