/**
 * E2E: защита слота (TASK-3.3)
 *
 * Сценарии:
 * 1) Игрок C пытается реконнектнуться в слот игрока A -> server.reconnect.error { code: SLOT_NOT_AVAILABLE }
 * 2) Игрок A реконнектится с правильным JWT -> server.reconnect.success
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

describe('E2E: защита слота (SLOT_NOT_AVAILABLE / reconnect success)', () => {
  const timeoutMs = 60_000;

  async function registerUser(prefix: string) {
    const auth = createAuthClient();
    const email = `${prefix}-${Date.now()}@example.com`;
    const username = `${prefix}-user-${Date.now()}`;
    const password = 'StrongPassword123';

    const registerRes = await auth.post('/auth/register', {
      email,
      username,
      password,
    });
    expect(registerRes.status).toBe(200);
    const accessToken = registerRes.data.tokens.accessToken as string;
    const userId = registerRes.data.user.id as string;
    return { accessToken, userId };
  }

  async function setupTwoPlayerMatch() {
    // Регистрируем трёх игроков: A, B, C
    const [playerA, playerB, playerC] = await Promise.all([
      registerUser('e2e-slot-A'),
      registerUser('e2e-slot-B'),
      registerUser('e2e-slot-C'),
    ]);

    // Создаём лобби от лица игрока A
    const matchmakingA = createMatchmakingClient(playerA.accessToken);
    const createLobbyRes = await matchmakingA.post('/matchmaking/lobbies/create', {
      maxPlayers: 2,
    });
    expect(createLobbyRes.status).toBe(200);
    const { lobbyId } = createLobbyRes.data as {
      lobbyId: string;
      playerIds: string[];
      status: string;
    };
    expect(lobbyId).toBeTruthy();

    // Игрок B вступает в лобби
    const matchmakingB = createMatchmakingClient(playerB.accessToken);
    const joinLobbyRes = await matchmakingB.post(
      `/matchmaking/lobbies/${lobbyId}/join`,
      {},
    );
    expect(joinLobbyRes.status).toBe(200);

    // Игрок A стартует матч
    const startRes = await matchmakingA.post(
      `/matchmaking/lobbies/${lobbyId}/start`,
      {},
    );
    expect(startRes.status).toBe(200);
    const { matchId, websocketUrl, playerIds } = startRes.data as {
      lobbyId: string;
      playerIds: string[];
      status: string;
      matchId: string;
      zoneId: string;
      websocketUrl: string;
    };

    expect(playerIds).toContain(playerA.userId);
    expect(playerIds).toContain(playerB.userId);
    expect(matchId).toBeTruthy();
    expect(websocketUrl).toBeTruthy();

    const wsUrl = WEBSOCKET_URL_OVERRIDE ?? websocketUrl;

    // Даём время оркестратору и gameplay обработать matchmaking.found_match
    await new Promise((r) => setTimeout(r, 800));

    return { playerA, playerB, playerC, matchId, wsUrl };
  }

  it(
    'player C reconnects with foreign JWT -> server.reconnect.error { code: SLOT_NOT_AVAILABLE }',
    async () => {
      const { playerA, playerC, matchId, wsUrl } = await setupTwoPlayerMatch();

      // 1. Игрок A подключается и authenticate, затем отключается
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
              token: playerA.accessToken,
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
            expect(data.playerId).toBe(playerA.userId);
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
            new Error(
              'Timeout during initial authenticate for player A before slot protection test',
            ),
          );
        }, 15_000);
      });

      // 2. Игрок C пытается реконнектнуться в слот A своим JWT
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
                token: playerC.accessToken,
              }),
            );
          });

          ws.on('message', (raw: Buffer | string) => {
            const data = JSON.parse(
              typeof raw === 'string' ? raw : raw.toString(),
            ) as Record<string, unknown>;
            received.push(data);

            if (data.type === 'reconnect_error') {
              expect(data.code).toBe('SLOT_NOT_AVAILABLE');
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
                `Timeout during foreign reconnect attempt. Received: ${JSON.stringify(
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
    'player A reconnects with correct JWT -> server.reconnect.success',
    async () => {
      const { playerA, matchId, wsUrl } = await setupTwoPlayerMatch();

      // 1. Игрок A подключается и authenticate, затем отключается
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
              token: playerA.accessToken,
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
            expect(data.playerId).toBe(playerA.userId);
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
            new Error(
              'Timeout during initial authenticate for player A before reconnect success test',
            ),
          );
        }, 15_000);
      });

      // 2. Игрок A реконнектится в пределах grace period
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
                token: playerA.accessToken,
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
              expect(data.playerId).toBe(playerA.userId);
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
                `Timeout during successful reconnect. Received: ${JSON.stringify(
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
});

