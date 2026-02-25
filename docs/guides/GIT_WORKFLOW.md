# Git Workflow: Yaana Client

## Модель ветвления (Gitflow)

```
main ─────────────────────────────────────────── (production)
  └── develop ────────────────────────────────── (integration)
        ├── feature/phase-1/project-setup ─────── (фичи)
        ├── feature/phase-2/domain-layer
        ├── bugfix/fix-note-saving
        └── release/v0.1.0 ───────────────────── (релизы)
```

## Основные ветки

- **`main`** — стабильная production-версия. Мержим только из `release/*` или `hotfix/*`.
- **`develop`** — интеграционная ветка. Все фичи мержатся сюда.

## Именование веток

| Тип | Формат | Пример |
|-----|--------|--------|
| Фича | `feature/phase-{N}/{short-desc}` | `feature/phase-2/domain-layer` |
| Баг | `bugfix/{short-desc}` | `bugfix/fix-note-saving` |
| Релиз | `release/v{X.Y.Z}` | `release/v0.1.0` |
| Хотфикс | `hotfix/{short-desc}` | `hotfix/crash-on-startup` |

### Правила именования
- Только lowercase
- Разделитель слов: `-` (kebab-case)
- Для фаз MVP обязательно указывать номер фазы

## Именование коммитов (Conventional Commits)

```
<type>(<scope>): <description>

[optional body]

[optional footer]
Co-Authored-By: Agent <agent@cursor.ai>
```

### Типы коммитов

- `feat` — новая функциональность
- `fix` — исправление бага
- `refactor` — рефакторинг (без изменения поведения)
- `test` — добавление/изменение тестов
- `docs` — документация
- `chore` — настройка, зависимости, CI
- `style` — форматирование (без изменения логики)

### Scopes

- `notes` — фича заметок
- `core` — core модуль
- `theme` — тема/стили
- `nav` — навигация
- `di` — dependency injection
- `db` — база данных

### Примеры

```
feat(notes): add Note entity with freezed
test(notes): add unit tests for GetAllNotes use case
fix(db): handle null title in NoteModel mapping
chore(core): configure GetIt dependency injection
```

## Процесс работы

### 1. Начало задачи

```powershell
# Убедиться, что develop актуален
git checkout develop
git pull origin develop

# Создать ветку задачи
git checkout -b feature/phase-{N}/{task-name}
```

### 2. Работа над задачей

```powershell
# Частые коммиты (атомарные, логически завершённые)
git add .
git commit -m "feat(notes): implement Note entity"

# Периодически подтягивать develop
git fetch origin develop
git rebase origin/develop
```

### 3. Завершение задачи

```powershell
# Перед пушем: проверки
flutter analyze
flutter test

# Пуш
git push origin feature/phase-{N}/{task-name}

# Создать Pull Request в develop
```

### 4. Code Review

- Ревьюер проверяет соответствие архитектуре (ARCHITECTURE.md)
- Проверяет покрытие тестами
- Проверяет соответствие CODE_QUALITY.md
- Approve → Squash Merge в develop

### 5. Релиз

```powershell
git checkout develop
git checkout -b release/v0.1.0
# Финальные правки, bump version
git checkout main
git merge release/v0.1.0
git tag v0.1.0
git checkout develop
git merge release/v0.1.0
```

## Правила

1. **Никогда не пушить напрямую в `main` или `develop`**
2. **Каждый PR должен пройти**: flutter analyze + flutter test + code review
3. **Squash merge** для фич (чистая история)
4. **Rebase** для поддержания линейной истории внутри ветки
5. **Один PR = одна задача** (не смешивать несвязанные изменения)
6. **Co-authored-by** в каждом коммите, сделанном AI-агентом
