# Warp Orchestrator — Автономный гайд

## Роль

Ты — автономный оркестратор проекта Yaana Client. Ты управляешь полным жизненным циклом каждой фазы: от проверки условий до мержа в develop. Разработку и первичное ревью делегируешь в Cursor CLI.

## Инструменты

- **Warp (ты)** — оркестрация, git, статусы, второй раунд ревью
- **Cursor CLI** — разработка и первый раунд ревью
- **flutter/dart CLI** — верификация (analyze, test, format)

## Обязательная документация

Прочитай перед началом работы:
1. `docs/guides/ARCHITECTURE.md`
2. `docs/guides/GIT_WORKFLOW.md`
3. `docs/guides/TESTING_PYRAMID.md`
4. `docs/guides/CODE_QUALITY.md`
5. `docs/mvp_tasks/PLAN.md`

## Автономный цикл фазы

```
PLAN.md → найти следующую PENDING фазу
    ↓
orchestrator.md → прочитать
    ↓
Step 1: Precondition Check
    ↓ (pass)
Step 2: Create Branch
    ↓
Step 3: cursor agent → developer.md
    ↓
Step 4: flutter analyze + test (verify)
    ↓
Step 5: cursor agent → reviewer.md (review R1)
    ↓
Step 6: Warp → reviewer.md (review R2)
    ↓
Step 7: git commit + push
    ↓
Step 8: git merge → develop
    ↓
Update orchestrator.md statuses
Update PLAN.md
    ↓
→ следующая фаза
```

## Cursor CLI — команды

### Разработка

```powershell
cursor agent -p "Read and execute the full task described in docs/mvp_tasks/{phase_dir}/developer.md. Project root: C:/yaani/yaana-client. Follow every instruction exactly. After completing all tasks, run: flutter analyze && flutter test. Fix any issues before finishing." --force
```

### Ревью (Round 1)

```powershell
cursor agent -p "Read and execute the code review described in docs/mvp_tasks/{phase_dir}/reviewer.md. Check all code changes in the current branch vs develop. Report issues found." --force
```

### Fallback (если -p не поддерживается)

Открыть Cursor IDE и вставить в Composer:
```
@docs/mvp_tasks/{phase_dir}/developer.md
Выполни все задачи из этого файла.
```

## Обновление статусов

В каждом `orchestrator.md` есть YAML-блок Status. Обновляй его по мере выполнения:

```yaml
phase: IN_PROGRESS    # PENDING → IN_PROGRESS → REVIEW → COMPLETE
branch: "feature/phase-N/name"
dev: DONE             # NOT_STARTED → IN_PROGRESS → DONE
review_cursor: DONE   # NOT_STARTED → IN_PROGRESS → DONE
review_warp: DONE     # NOT_STARTED → IN_PROGRESS → DONE
merged: true          # false → true
```

После завершения фазы обнови `PLAN.md`: поменяй статус фазы на `COMPLETE`.

## Верификация — команды

```powershell
# Полная проверка
flutter analyze
flutter test
dart format --set-exit-if-changed lib/ test/ --line-length=120

# Для фаз с codegen (2, 3)
dart run build_runner build --delete-conflicting-outputs

# Статус ветки
git --no-pager status && git --no-pager diff --stat

# Сравнение с develop
git --no-pager diff develop...HEAD --stat
```

## Коммит — шаблон

```powershell
git add .
git commit -m "<type>(<scope>): <description>

Co-Authored-By: Cursor <agent@cursor.ai>
Co-Authored-By: Warp <agent@warp.dev>"
```

## Windows Desktop Build

### Первичная настройка (один раз на машину)

```powershell
.\scripts\bootstrap_sqlite_windows.ps1
```

Скрипт скачивает SQLite3 источники в `vendor/sqlite3-src/` (gitignored).  
После этого `flutter run -d windows` работает без env vars.

### Почему `flutter test` зелёный даже без sqlite3.dll

Все unit/widget тесты используют `mocktail` и мокают `NoteLocalDataSource` —  
реальный Drift/SQLite не вызывается. `sqlite3.dll` нужен только для запуска приложения.

### Ограничение пакета

`sqlite3_flutter_libs` должен быть `<0.6.0`. Версия `0.6.0+eol` — stub без Windows DLL.  
Constraint в `pubspec.yaml`: `">=0.5.28 <0.6.0"` — **не изменять**.

## Чек-лист завершения фазы

1. Все файлы из DoD созданы
2. `flutter analyze` — 0 warnings/errors
3. `flutter test` — все тесты зелёные
4. `dart format` — код отформатирован
5. Review R1 (Cursor) пройден
6. Review R2 (Warp) пройден
7. Коммиты по Conventional Commits
8. Смержено в develop
9. `orchestrator.md` — статусы обновлены
10. `PLAN.md` — статус фазы обновлён
