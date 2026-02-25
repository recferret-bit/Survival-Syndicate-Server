# AI-агенты: общий гайд

## Архитектура

```
┌─────────────────────────────────────────────┐
│           WARP (Orchestrator)              │
│  Sonnet 4.6 • Автономный цикл              │
│  git, статусы, верификация, review R2    │
├──────────────────────┬──────────────────────┤
│  cursor agent (dev)    │  cursor agent (R1)  │
│  Composer • developer  │  Composer • reviewer │
│  .md → код + тесты    │  .md → ревью        │
└──────────────────────┴──────────────────────┘
```

## Роли

### Orchestrator (Warp)
- Читает `PLAN.md`, находит следующую PENDING фазу
- Проверяет preconditions в `orchestrator.md`
- Создаёт ветку, обновляет статусы
- Делегирует в Cursor CLI (разработка + ревью R1)
- Верифицирует (flutter analyze/test)
- Проводит review R2 самостоятельно
- Коммитит, мержит, закрывает фазу
- Гайд: `docs/agents/warp.md`

### Developer (Cursor CLI)
- Получает задачу через `developer.md`
- Пишет код и тесты по инструкции
- Следует `docs/guides/ARCHITECTURE.md`, `CODE_QUALITY.md`, `TESTING_PYRAMID.md`
- Запускает `flutter analyze && flutter test`
- Гайд: `docs/agents/cursor.md`

### Reviewer (Cursor CLI + Warp)
- **Round 1 (Cursor):** получает `reviewer.md`, проверяет код по чеклисту
- **Round 2 (Warp):** оркестратор проводит финальное ревью по тому же чеклисту

## Структура файлов

```
docs/mvp_tasks/
  PLAN.md                              # Статусы всех фаз
  phase_XX/
    orchestrator.md                    # Warp: workflow + статусы
    developer.md                       # Cursor: задача на разработку
    reviewer.md                        # Cursor+Warp: чеклист ревью
docs/agents/
  warp.md                              # Гайд оркестратора
  cursor.md                            # Гайд разработчика
  agents.md                            # Общий гайд (этот файл)
```

## Жизненный цикл фазы

```
1. PLAN.md → найти PENDING фазу
2. orchestrator.md → проверить preconditions
3. git checkout -b feature/phase-N/name
4. cursor agent → developer.md (разработка)
5. flutter analyze + test (верификация)
6. cursor agent → reviewer.md (ревью R1)
7. Warp → reviewer.md (ревью R2)
8. git commit + merge → develop
9. Обновить orchestrator.md + PLAN.md
10. → следующая фаза
```

## Обязательная документация

Перед началом любой работы агент обязан прочитать:
1. `docs/guides/ARCHITECTURE.md` — архитектура
2. `docs/guides/GIT_WORKFLOW.md` — git
3. `docs/guides/TESTING_PYRAMID.md` — тесты
4. `docs/guides/CODE_QUALITY.md` — качество
5. `docs/mvp_tasks/PLAN.md` — текущий план

## Windows Desktop: важные ограничения

- **`flutter test` ≠ проверка запуска приложения.** Unit/widget тесты используют `mocktail`
  и никогда не вызывают реальный Drift/SQLite. `sqlite3.dll` нужна только при
  `flutter run -d windows`.
- **`sqlite3_flutter_libs` строго `<0.6.0`.** Версия `0.6.0+eol` — stub-пакет без Windows DLL.
  Constraint в `pubspec.yaml`: `">=0.5.28 <0.6.0"` — не менять ни одному агенту.
- **Первая настройка на Windows-машине:**
  ```powershell
  .\scripts\bootstrap_sqlite_windows.ps1
  ```

## Правила для всех агентов

1. **Никогда не пропускать тесты** — каждый новый класс с логикой должен иметь тест
2. **Никогда не игнорировать ошибки анализатора** — чинить сразу
3. **Не менять код вне scope** — нашёл баг в другом месте → отдельный issue
4. **Атомарные коммиты** — один логический блок = один коммит
5. **Co-Authored-By** — в каждом коммите от AI-агента
6. **Не удалять/менять тесты** предыдущих фаз без согласования

## Формат статусов

Каждый `orchestrator.md` содержит YAML-блок:

```yaml
phase: PENDING          # PENDING → IN_PROGRESS → REVIEW → COMPLETE
branch: ""              # имя ветки
dev: NOT_STARTED        # NOT_STARTED → IN_PROGRESS → DONE
review_cursor: NOT_STARTED
review_warp: NOT_STARTED
merged: false
```

`PLAN.md` содержит сводный статус каждой фазы.
