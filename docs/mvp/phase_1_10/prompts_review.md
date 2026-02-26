# Промпт: РЕВЬЮ — TASK-2.6: WebSocket Service — connect

> Этот промпт предназначен для AI-агента (Warp/Cursor). Цель — проверить результат, прогнать строгие проверки, создать PR.

---

## Контекст задачи

**ID:** TASK-2.6
**Название:** WebSocket Service — connect
**Ветка:** `feature/websocket/connect-flow`
**Scope:** `apps/websocket-service/`

### Definition of Done (DoD)
- WS Gateway принимает соединения, валидирует JWT
- client.authenticate -> проверка через Orchestrator -> success/failure
- При подключении: публикация player.connection.status { connected }
- При отключении: рассылка player_disconnected, публикация { disconnected }
- Unit-тесты: AuthenticateHandler, ConnectionManager, WsGateway (mock WS)
- Integration-тесты: WS connect + authenticate pipeline (с mock NATS)
- `npm run lint && npm test && npm run build` проходит

---

## Инструкции для агента

### Шаг 1: Верификация DoD
Пройди по каждому пункту DoD и убедись, что он выполнен. Если нет — верни на доработку с комментарием.

### Шаг 2: Строгие проверки
```bash
npm run format
npm run lint
npm test
npm run test:cov
npm run build
```
**Все команды должны завершиться с кодом 0.**

Дополнительно (если задача затрагивает интеграции):
```bash
npm run docker:infra
npm run test:e2e
```

### Шаг 3: Чек-лист ревью

**Архитектура:**
- [ ] Clean Architecture соблюдена (Domain не зависит от NestJS/Prisma)
- [ ] Ports — abstract classes (не interfaces)
- [ ] Handlers тонкие (< 50 строк)
- [ ] Нет логики в контроллерах (только делегирование)

**Контракты и DTO:**
- [ ] DTO валидируются через Zod (`createZodDto`)
- [ ] Swagger аннотации на всех HTTP endpoints
- [ ] NATS subjects не хардкодятся (используются `libs/lib-*`)
- [ ] Zod schemas для NATS request/response

**Данные и безопасность:**
- [ ] `bigint` не используется в прикладном коде
- [ ] Currency/Language не захардкожены
- [ ] Логи не содержат секретов/токенов/персональных данных
- [ ] Ошибки — RFC 7807 (ProblemDetails)

**Тесты:**
- [ ] Unit-тесты покрывают: AuthenticateHandler, ConnectionManager, WsGateway
- [ ] Integration-тесты: WS connect + authenticate flow (mock)
- [ ] Именование: `*.unit.spec.ts`, `*.integration.spec.ts`
- [ ] Тесты детерминированные и быстрые

**Git:**
- [ ] Conventional Commits
- [ ] `Co-Authored-By: Oz <oz-agent@warp.dev>`
- [ ] Нет несвязанных изменений

### Шаг 4: Обновление статуса
1. В `docs/mvp/phase_1_10/task.md` замени статус на `IN REVIEW`.
2. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 10 на `👁️ IN REVIEW`.

### Шаг 5: Создание PR
```bash
git push origin feature/websocket/connect-flow
gh pr create --base main --head feature/websocket/connect-flow \
  --title "TASK-2.6: WebSocket Service — connect" \
  --body "## WebSocket Service — connect

### Чек-лист
- [ ] lint пройден
- [ ] тесты пройдены
- [ ] build успешен
- [ ] DoD выполнен

**Задача:** docs/mvp/phase_1_10/task.md

Co-Authored-By: Oz <oz-agent@warp.dev>"
```

### Шаг 6: После мержа
1. В `docs/mvp/phase_1_10/task.md` замени статус на `DONE`.
2. В `docs/mvp/mvp_phase_1.md` обнови статус задачи 10 на `✅ DONE`.
3. Добавь запись в лог прогресса task.md.
