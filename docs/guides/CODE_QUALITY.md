# Качество кода: Yaana Client

## Инструменты

### 1. Dart Analyzer (`dart analyze`)

Статический анализ кода. Находит ошибки типизации, unused imports, и другие проблемы.

```powershell
dart analyze lib/
dart analyze test/
```

**Правило:** 0 warnings, 0 errors. Код не мержится, если есть предупреждения.

### 2. Flutter Analyze (`flutter analyze`)

Расширенный анализ с учётом Flutter-специфики (deprecated widgets, platform issues).

```powershell
flutter analyze
```

### 3. Dart Linter

Настраивается через `analysis_options.yaml`. Используем `very_good_analysis` как базу.

```yaml
# analysis_options.yaml
include: package:very_good_analysis/analysis_options.yaml

analyzer:
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
    - "**/*.drift.dart"

linter:
  rules:
    # Дополнительные правила
    prefer_single_quotes: true
    always_declare_return_types: true
    annotate_overrides: true
    avoid_empty_else: true
    avoid_print: true
    avoid_relative_lib_imports: true
    prefer_const_constructors: true
    prefer_const_declarations: true
    prefer_final_locals: true
    unnecessary_lambdas: true
    lines_longer_than_80_chars: false  # Разрешаем до 120
```

### 4. Форматирование (`dart format`)

```powershell
dart format lib/ test/ --line-length=120
```

**Правило:** весь код отформатирован. Проверка в CI:

```powershell
dart format --set-exit-if-changed lib/ test/ --line-length=120
```

## Правила кода

### 1. Запрет на copy/paste (DRY)

- **Дублирование > 3 строк** — выносить в общую функцию/виджет
- Повторяющиеся стили — в `AppTheme` / `AppTypography`
- Повторяющиеся виджеты — в `core/widgets/`
- Повторяющаяся логика — в utility-функции или extension methods

### 2. Функции не больше 100 строк

- **Жёсткий лимит:** 100 строк на функцию/метод (включая комментарии)
- **Рекомендуемый лимит:** 30-50 строк
- Если функция длиннее — разбить на приватные методы с понятными именами
- **BLoC event handlers** — каждый handler ≤ 50 строк. Сложную логику выносить в Use Case

### 3. KISS (Keep It Simple, Stupid)

- Не используем паттерны ради паттернов
- Минимум абстракций: если класс используется только в одном месте и не предполагает замены — не нужен интерфейс (исключение: repository для тестируемости)
- Простые типы вместо обёрток, если нет валидации
- Avoid premature optimization

### 4. SOLID

- **S** — один класс = одна ответственность (Use Case, BLoC, Widget)
- **O** — расширяемость через наследование/composition, не модификацию
- **L** — подтипы заменяемы (NoteRepositoryImpl ↔ NoteRepository)
- **I** — маленькие интерфейсы (не God-interface)
- **D** — зависимость от абстракций (через GetIt DI)

### 5. Именование

```dart
// Классы — PascalCase
class NoteRepository {}
class GetAllNotes {}

// Файлы — snake_case
// note_repository.dart
// get_all_notes.dart

// Переменные и функции — camelCase
final noteTitle = 'Hello';
void getAllNotes() {}

// Константы — camelCase (Dart convention)
const maxTitleLength = 100;

// Приватные — с underscore
void _handleTap() {}
final _controller = TextEditingController();

// BLoC events — команды (глагол)
class LoadNotes extends NotesListEvent {}
class DeleteNote extends NotesListEvent {}

// BLoC states — состояния (существительное/прилагательное)
class NotesListLoading extends NotesListState {}
class NotesListLoaded extends NotesListState {}
```

### 6. Файлы

- **Один файл = один публичный класс** (исключение: тесно связанные типы)
- **Максимум 300 строк на файл** (если больше — разбить)
- **Barrel exports** (`features/notes/domain/domain.dart`) для удобного импорта
- Файл-имя совпадает с именем класса: `NoteRepository` → `note_repository.dart`

### 7. Комментарии

- **Не комментируем очевидное** (`// increment counter` перед `counter++`)
- **Документируем публичные API** (`///` doc comments для public classes/methods)
- **TODO обязательно с тикетом/описанием**: `// TODO(YAANA-123): add pagination`
- **Никаких закомментированных блоков кода** — удалять, git хранит историю

## Pre-commit проверка

Скрипт для проверки перед коммитом (запускать вручную или через git hooks):

```powershell
# scripts/presubmit.ps1
Write-Host "=== Running dart format check ==="
dart format --set-exit-if-changed lib/ test/ --line-length=120
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "=== Running flutter analyze ==="
flutter analyze
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "=== Running tests ==="
flutter test
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "=== All checks passed ==="
```

## Чек-лист для Code Review

- [ ] `flutter analyze` — 0 warnings
- [ ] `dart format` — код отформатирован
- [ ] Нет дублирования кода (> 3 строк)
- [ ] Все функции ≤ 100 строк
- [ ] Файлы ≤ 300 строк
- [ ] Именование соответствует конвенции
- [ ] Публичные API задокументированы
- [ ] Нет закомментированного кода
- [ ] Нет `print()` (используем `debugPrint` или logger)
- [ ] Все новые use cases / BLoC покрыты unit-тестами
- [ ] Все новые экраны/виджеты покрыты widget-тестами
- [ ] Зависимости идут через DI (не `new ConcreteClass()` напрямую)
- [ ] Ошибки обрабатываются через `Either<Failure, T>`
