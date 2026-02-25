# Пирамида тестирования: Yaana Client

## Общая структура

```
        ╱╲
       ╱E2E╲           ← Мало, дорого, медленно (полный CRUD через реальный сервер)
      ╱──────╲
     ╱ Widget  ╲        ← Средне (каждый экран, каждый UI-элемент)
    ╱────────────╲
   ╱    Unit      ╲     ← Много, дёшево, быстро (use cases, BLoC, mappers)
  ╱────────────────╲
```

## Принципы

1. **100% покрытие ключевой бизнес-логики** — Use Cases, BLoC, Repository, Mappers
2. **Не тестируем тривиальные вещи** — getters/setters, сгенерированный код (freezed, drift), boilerplate
3. **Каждый тест проверяет одно поведение** — один assert на сценарий (допустимо несколько при проверке состояния)
4. **Тесты — документация** — имя теста описывает поведение, а не реализацию

## Unit-тесты

**Расположение:** `test/unit/`

### Что тестируем

- **Use Cases** — каждый use case: happy path + error path
- **BLoC** — каждый event → ожидаемая последовательность states
- **Repository implementations** — маппинг, обработка ошибок (Either)
- **Mappers** — toEntity/fromEntity корректность

### Что НЕ тестируем

- Сгенерированный код (freezed `copyWith`, `==`, `hashCode`)
- Простые data-классы без логики
- Прямые делегации без трансформации

### Паттерн

```dart
// test/unit/features/notes/domain/usecases/get_all_notes_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:fpdart/fpdart.dart';

class MockNoteRepository extends Mock implements NoteRepository {}

void main() {
  late GetAllNotes useCase;
  late MockNoteRepository mockRepository;

  setUp(() {
    mockRepository = MockNoteRepository();
    useCase = GetAllNotes(mockRepository);
  });

  group('GetAllNotes', () {
    test('should return list of notes from repository', () async {
      // Arrange
      final notes = [Note.test()];
      when(() => mockRepository.getAllNotes())
          .thenAnswer((_) async => Right(notes));

      // Act
      final result = await useCase(NoParams());

      // Assert
      expect(result, Right(notes));
      verify(() => mockRepository.getAllNotes()).called(1);
    });

    test('should return CacheFailure when repository fails', () async {
      // Arrange
      when(() => mockRepository.getAllNotes())
          .thenAnswer((_) async => Left(CacheFailure()));

      // Act
      final result = await useCase(NoParams());

      // Assert
      expect(result, Left(CacheFailure()));
    });
  });
}
```

### BLoC-тесты (с bloc_test)

```dart
// test/unit/features/notes/presentation/bloc/notes_list_bloc_test.dart
import 'package:bloc_test/bloc_test.dart';

void main() {
  late NotesListBloc bloc;
  late MockGetAllNotes mockGetAllNotes;

  setUp(() {
    mockGetAllNotes = MockGetAllNotes();
    bloc = NotesListBloc(getAllNotes: mockGetAllNotes);
  });

  blocTest<NotesListBloc, NotesListState>(
    'emits [Loading, Loaded] when LoadNotes succeeds',
    build: () {
      when(() => mockGetAllNotes(any()))
          .thenAnswer((_) async => Right([Note.test()]));
      return bloc;
    },
    act: (bloc) => bloc.add(LoadNotes()),
    expect: () => [
      NotesListLoading(),
      NotesListLoaded([Note.test()]),
    ],
  );

  blocTest<NotesListBloc, NotesListState>(
    'emits [Loading, Error] when LoadNotes fails',
    build: () {
      when(() => mockGetAllNotes(any()))
          .thenAnswer((_) async => Left(CacheFailure()));
      return bloc;
    },
    act: (bloc) => bloc.add(LoadNotes()),
    expect: () => [
      NotesListLoading(),
      NotesListError(CacheFailure()),
    ],
  );
}
```

## Widget-тесты (Integration)

**Расположение:** `test/widget/`

### Что тестируем

- **Каждый экран** — рендеринг, взаимодействие с UI-элементами
- **Каждый переиспользуемый виджет** — отображение данных, обработка нажатий
- **Навигация** — переходы между экранами
- **Состояния** — loading, loaded, error, empty

### Паттерн

```dart
// test/widget/features/notes/presentation/pages/notes_list_screen_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockNotesListBloc extends MockBloc<NotesListEvent, NotesListState>
    implements NotesListBloc {}

void main() {
  late MockNotesListBloc mockBloc;

  setUp(() {
    mockBloc = MockNotesListBloc();
  });

  group('NotesListScreen', () {
    testWidgets('shows loading indicator when state is Loading', (tester) async {
      when(() => mockBloc.state).thenReturn(NotesListLoading());

      await tester.pumpWidget(
        MaterialApp(
          home: BlocProvider<NotesListBloc>.value(
            value: mockBloc,
            child: const NotesListScreen(),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('shows list of NoteCards when state is Loaded', (tester) async {
      final notes = [Note.test(title: 'Test Note')];
      when(() => mockBloc.state).thenReturn(NotesListLoaded(notes));

      await tester.pumpWidget(/* ... */);

      expect(find.byType(NoteCard), findsOneWidget);
      expect(find.text('Test Note'), findsOneWidget);
    });

    testWidgets('shows EmptyNotesWidget when no notes', (tester) async {
      when(() => mockBloc.state).thenReturn(NotesListLoaded([]));

      await tester.pumpWidget(/* ... */);

      expect(find.byType(EmptyNotesWidget), findsOneWidget);
    });

    testWidgets('navigates to editor on FAB tap', (tester) async {
      when(() => mockBloc.state).thenReturn(NotesListLoaded([]));

      await tester.pumpWidget(/* ... with GoRouter mock ... */);
      await tester.tap(find.byType(FloatingActionButton));
      await tester.pumpAndSettle();

      // Verify navigation
    });

    testWidgets('navigates to editor on NoteCard tap', (tester) async {
      // ...
    });
  });
}
```

### Чек-лист для каждого экрана

Для каждого экрана обязательно:

- [ ] Рендерится без ошибок
- [ ] Все UI-элементы присутствуют (AppBar, body, FAB, etc.)
- [ ] Loading state отображает индикатор
- [ ] Error state отображает сообщение
- [ ] Empty state отображает placeholder
- [ ] Loaded state отображает данные
- [ ] Все кнопки кликабельны и вызывают правильные действия
- [ ] Навигация работает (переход на другой экран)
- [ ] Обратная навигация работает

## E2E-тесты

**Расположение:** `integration_test/`

### Что тестируем

- Полный CRUD-флоу заметок (создание → просмотр → редактирование → удаление)
- Навигация по всему приложению
- Persistence (данные сохраняются между перезапусками экранов)

### Паттерн

```dart
// integration_test/notes_crud_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('full CRUD flow for notes', (tester) async {
    await tester.pumpWidget(const YaanaApp());
    await tester.pumpAndSettle();

    // 1. Verify empty state
    expect(find.byType(EmptyNotesWidget), findsOneWidget);

    // 2. Create note
    await tester.tap(find.byType(FloatingActionButton));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), 'My First Note');
    await tester.pumpAndSettle();

    // 3. Go back to list
    await tester.tap(find.byIcon(Icons.arrow_back));
    await tester.pumpAndSettle();

    // 4. Verify note in list
    expect(find.text('My First Note'), findsOneWidget);

    // 5. Edit note
    await tester.tap(find.text('My First Note'));
    await tester.pumpAndSettle();
    // ... edit ...

    // 6. Delete note
    await tester.tap(find.byIcon(Icons.more_vert));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Удалить заметку'));
    await tester.pumpAndSettle();

    // 7. Verify empty state again
    expect(find.byType(EmptyNotesWidget), findsOneWidget);
  });
}
```

## Команды

```powershell
# Запуск всех unit и widget тестов
flutter test

# Запуск с покрытием
flutter test --coverage

# Запуск конкретной группы
flutter test test/unit/
flutter test test/widget/

# E2E тесты (на конкретной платформе)
flutter test integration_test/ -d windows
flutter test integration_test/ -d chrome

# Просмотр покрытия (lcov)
# Установить: choco install lcov
genhtml coverage/lcov.info -o coverage/html
```

## Структура тестовых файлов

Тестовые файлы зеркалят структуру `lib/`:

```
test/
  unit/
    core/
      error/
        failures_test.dart
    features/
      notes/
        domain/
          usecases/
            get_all_notes_test.dart
            get_note_by_id_test.dart
            create_note_test.dart
            update_note_test.dart
            delete_note_test.dart
        data/
          models/
            note_model_test.dart
          repositories/
            note_repository_impl_test.dart
        presentation/
          bloc/
            notes_list_bloc_test.dart
            note_editor_bloc_test.dart
  widget/
    core/
      widgets/
        app_scaffold_test.dart
        app_card_test.dart
    features/
      notes/
        presentation/
          pages/
            notes_list_screen_test.dart
            note_editor_screen_test.dart
          widgets/
            note_card_test.dart
            empty_notes_widget_test.dart
integration_test/
  notes_crud_test.dart
```

## Целевые метрики

- **Unit-тесты:** 100% покрытие use cases, BLoC, repository impl, mappers
- **Widget-тесты:** каждый экран + каждый переиспользуемый виджет
- **E2E:** основные пользовательские сценарии (CRUD)
- **Общее покрытие (lcov):** ≥ 80% lines (за вычетом сгенерированного кода)
