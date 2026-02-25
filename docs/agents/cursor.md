# Cursor Agent: Гайд разработчика

## Роль

Ты — AI-разработчик проекта Yaana Client (Flutter). Ты пишешь код и тесты, следуя промптам и архитектурным гайдам.

## Перед началом КАЖДОЙ задачи

Обязательно прочитай (через @-mention):

1. `@docs/guides/ARCHITECTURE.md` — знать архитектуру
2. `@docs/guides/CODE_QUALITY.md` — знать правила кода
3. `@docs/guides/TESTING_PYRAMID.md` — знать требования к тестам
4. `@docs/mvp_tasks/phase_{N}/prompt_dev.md` — текущая задача

## Алгоритм работы

### 1. Сверка с задачей

Прочитай `prompt_dev.md` текущей фазы. Убедись, что понимаешь:
- Какие файлы нужно создать/изменить
- Какие тесты написать
- Что является Definition of Done

### 2. Проверь ветку

```powershell
git --no-pager branch --show-current
```

Убедись, что работаешь в правильной ветке `feature/phase-{N}/{task-name}`.
Если нет — сообщи оркестратору.

### 3. Пиши код

Следуй порядку из промпта. Общие правила:

- **Сначала domain, потом data, потом presentation** (если задача затрагивает несколько слоёв)
- **Каждый класс — отдельный файл** (snake_case)
- **Используй freezed** для entities и BLoC states
- **Используй Either<Failure, T>** для error handling в repository
- **Не создавай файлы вне scope задачи**

### 4. Пиши тесты

Для каждого нового класса с логикой:

- **Use Case** → unit-тест (happy + error path)
- **BLoC** → bloc_test (каждый event → states)
- **Repository impl** → unit-тест (маппинг + error handling)
- **Виджет** → widget-тест (рендеринг, взаимодействие)
- **Экран** → widget-тест (все состояния: loading, loaded, error, empty)

### 5. Самопроверка

Перед тем как сообщить о завершении:

```powershell
# Форматирование
dart format lib/ test/ --line-length=120

# Анализ
flutter analyze

# Тесты
flutter test
```

**Все три команды должны пройти без ошибок.**

### 6. Коммит

```powershell
git add .
git commit -m "<type>(<scope>): <description>

Co-Authored-By: Cursor <agent@cursor.ai>"
```

Следуй Conventional Commits из `GIT_WORKFLOW.md`.

### 7. Сверка с DoD

Перечитай `prompt_dev.md` → секция "Definition of Done". Убедись, что все пункты выполнены.

## Шаблоны кода

### Entity (freezed)

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'note.freezed.dart';

@freezed
class Note with _$Note {
  const factory Note({
    required String id,
    required String title,
    required String content,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Note;
}
```

### Use Case

```dart
import 'package:fpdart/fpdart.dart';

class GetAllNotes implements UseCase<List<Note>, NoParams> {
  final NoteRepository repository;
  const GetAllNotes(this.repository);

  @override
  Future<Either<Failure, List<Note>>> call(NoParams params) {
    return repository.getAllNotes();
  }
}
```

### BLoC

```dart
class NotesListBloc extends Bloc<NotesListEvent, NotesListState> {
  final GetAllNotes getAllNotes;

  NotesListBloc({required this.getAllNotes}) : super(const NotesListInitial()) {
    on<LoadNotes>(_onLoadNotes);
  }

  Future<void> _onLoadNotes(
    LoadNotes event,
    Emitter<NotesListState> emit,
  ) async {
    emit(const NotesListLoading());
    final result = await getAllNotes(NoParams());
    result.fold(
      (failure) => emit(NotesListError(failure: failure)),
      (notes) => emit(NotesListLoaded(notes: notes)),
    );
  }
}
```

### Widget test

```dart
testWidgets('NoteCard displays title and date', (tester) async {
  final note = Note(
    id: '1',
    title: 'Test',
    content: 'Content',
    createdAt: DateTime(2025, 1, 1),
    updatedAt: DateTime(2025, 1, 1),
  );

  await tester.pumpWidget(
    MaterialApp(home: Scaffold(body: NoteCard(note: note))),
  );

  expect(find.text('Test'), findsOneWidget);
});
```

## Запрещено

- ❌ `print()` — используй `debugPrint` или logger
- ❌ Функции > 100 строк
- ❌ Copy/paste > 3 строк — выноси в общий метод
- ❌ Прямое создание зависимостей (`new ConcreteClass()`) — используй DI
- ❌ Хардкод цветов/стилей — используй `AppTheme`
- ❌ Менять код/тесты из других фаз без согласования
- ❌ Коммит без `flutter analyze` и `flutter test`
- ❌ Обновлять `sqlite3_flutter_libs` до `>=0.6.0` — версия `0.6.0+eol` stub без Windows DLL.  
  Constraint `">=0.5.28 <0.6.0"` в `pubspec.yaml` — не трогать.
