# TASK-1.1: Monorepo-структура проекта

## Статус: `NOT STARTED`

**Epic:** Epic 1: Базовая инфраструктура
**Ветка:** `feature/infra/monorepo-structure`
**Зависимости:** Нет

---

## Описание
Создать NestJS monorepo со структурой `apps/` и `libs/`.
Настроить `nest-cli.json`, корневой `tsconfig.json` с path aliases, корневой `package.json` со скриптами.

## Scope (затрагиваемые файлы/каталоги)
`apps/, libs/, nest-cli.json, tsconfig.json, package.json`

## Ключевые документы архитектуры
docs/architecture/16_project_structure.md

---

## Definition of Ready (DoR)
- Установлен Node.js 20+, npm, NestJS CLI
- Склонирован репозиторий, ветка `main` актуальна

## Definition of Done (DoD)
- `nest-cli.json` настроен в monorepo mode с projects для всех сервисов
- `tsconfig.json` содержит path aliases (`@app/*`, `@lib/*`, `@prisma/*`)
- `package.json` содержит базовые скрипты (build, start, lint, test)
- `npm install` завершается без ошибок
- `npm run build` завершается без ошибок (пустые модули)

---

## Тесты

**Unit-тесты (`*.unit.spec.ts`):**
Нет (инфраструктурная задача)

**Integration-тесты (`*.integration.spec.ts`):**
Нет

---

## Лог прогресса

| Дата | Событие | Агент |
|------|---------|-------|
| — | Задача создана | System |
