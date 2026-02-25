# Git Workflow — Survival Syndicate Server

## Основная ветка
- `main` — основная ветка разработки.
- Прямые пуши в `main` запрещены — только через PR.

## Ветки
Рекомендуемый формат:
- `feature/<area>/<short-desc>`
- `fix/<short-desc>`
- `docs/<short-desc>`
- `chore/<short-desc>`

Правила:
- lowercase
- разделитель слов: `-`

## Conventional Commits
Формат:

```
<type>(<scope>): <description>

[optional body]

Co-Authored-By: Oz <oz-agent@warp.dev>
```

Типы:
- `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`

Примеры:
- `feat(auth): add refresh token rotation`
- `fix(player): validate currency iso code`
- `docs(architecture): renumber docs index`

## Процесс работы
1. Создать ветку от `main`.
2. Делать атомарные коммиты.
3. Перед PR прогнать:
   - `npm run lint`
   - `npm test`
   - `npm run build`
4. Создать PR в `main`.
5. Мерж — по договорённости команды (squash или merge commit). Для крупных/рефакторинговых PR обычно удобнее merge commit.

## Правила для AI-агентов
- Всегда добавлять `Co-Authored-By` строку в коммиты, сделанные агентом.
- Не смешивать несвязанные изменения в одном PR.
