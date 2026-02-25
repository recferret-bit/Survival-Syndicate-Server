# Архитектурный гайд: Yaana Client

## Принципы

- **Clean Architecture** — разделение на слои с чёткими зависимостями (dependency rule: внутренние слои не знают о внешних)
- **DDD (Domain-Driven Design)** — бизнес-логика инкапсулирована в domain layer
- **Use Cases** — каждое бизнес-действие = отдельный класс
- **BLoC** — управление состоянием через events/states

## Слои

```
┌─────────────────────────────────────┐
│         Presentation Layer          │  ← BLoC, Pages, Widgets
├─────────────────────────────────────┤
│           Domain Layer              │  ← Entities, Use Cases, Repository interfaces
├─────────────────────────────────────┤
│            Data Layer               │  ← Models, DataSources, Repository implementations
└─────────────────────────────────────┘
```

### Domain Layer (ядро)

Не зависит ни от чего. Содержит:

- **Entities** — бизнес-объекты (Note). Используют `freezed` для иммутабельности.
- **Value Objects** — типобезопасные обёртки (NoteId).
- **Repository interfaces** — абстрактные контракты (`abstract class NoteRepository`).
- **Use Cases** — один класс = одно действие. Реализуют `UseCase<Type, Params>`.
- **Failures** — типизированные ошибки (`CacheFailure`, `ServerFailure`).

```dart
// Базовый интерфейс Use Case
abstract class UseCase<Type, Params> {
  Future<Either<Failure, Type>> call(Params params);
}

// Пример Use Case
class GetAllNotes implements UseCase<List<Note>, NoParams> {
  final NoteRepository repository;
  GetAllNotes(this.repository);

  @override
  Future<Either<Failure, List<Note>>> call(NoParams params) {
    return repository.getAllNotes();
  }
}
```

### Data Layer

Зависит только от Domain Layer. Содержит:

- **Models** — DTO с сериализацией. Содержат `toEntity()` / `fromEntity()`.
- **DataSources** — работа с конкретными источниками (Drift DB, API).
- **Repository implementations** — реализуют интерфейсы из Domain, оборачивают ошибки в `Either<Failure, T>`.

```dart
class NoteRepositoryImpl implements NoteRepository {
  final NoteLocalDataSource localDataSource;

  NoteRepositoryImpl({required this.localDataSource});

  @override
  Future<Either<Failure, List<Note>>> getAllNotes() async {
    try {
      final models = await localDataSource.getAllNotes();
      return Right(models.map((m) => m.toEntity()).toList());
    } on CacheException {
      return Left(CacheFailure());
    }
  }
}
```

### Presentation Layer

Зависит от Domain Layer (через Use Cases). Содержит:

- **BLoC** — принимает events, вызывает use cases, эмитит states.
- **Pages** — экраны (StatelessWidget, подписываются на BLoC через BlocBuilder/BlocListener).
- **Widgets** — переиспользуемые UI-компоненты.

```dart
class NotesListBloc extends Bloc<NotesListEvent, NotesListState> {
  final GetAllNotes getAllNotes;

  NotesListBloc({required this.getAllNotes}) : super(NotesListInitial()) {
    on<LoadNotes>(_onLoadNotes);
  }

  Future<void> _onLoadNotes(LoadNotes event, Emitter<NotesListState> emit) async {
    emit(NotesListLoading());
    final result = await getAllNotes(NoParams());
    result.fold(
      (failure) => emit(NotesListError(failure)),
      (notes) => emit(NotesListLoaded(notes)),
    );
  }
}
```

## Структура каталогов

```
lib/
  core/                         # Общий код
    error/
      failures.dart             # Failure, CacheFailure, ServerFailure
      exceptions.dart           # CacheException, ServerException
    usecases/
      usecase.dart              # UseCase<Type, Params>, NoParams
    di/
      injection.dart            # GetIt setup
    router/
      app_router.dart           # go_router конфигурация
    theme/
      app_colors.dart
      app_theme.dart
      app_typography.dart
    widgets/
      app_scaffold.dart
      app_card.dart
  features/
    notes/
      domain/
        entities/
          note.dart             # Note entity (freezed)
        repositories/
          note_repository.dart  # Abstract NoteRepository
        usecases/
          get_all_notes.dart
          get_note_by_id.dart
          create_note.dart
          update_note.dart
          delete_note.dart
      data/
        datasources/
          note_local_data_source.dart
        models/
          note_model.dart
        repositories/
          note_repository_impl.dart
      presentation/
        bloc/
          notes_list/
            notes_list_bloc.dart
            notes_list_event.dart
            notes_list_state.dart
          note_editor/
            note_editor_bloc.dart
            note_editor_event.dart
            note_editor_state.dart
        pages/
          notes_list_screen.dart
          note_editor_screen.dart
        widgets/
          note_card.dart
          empty_notes_widget.dart
  main.dart
```

## Правило зависимостей

```
Presentation → Domain ← Data
     ↓              ↓
   BLoC ──→ UseCase ←── Repository
                          ↓
                      DataSource
```

- **Presentation** зависит от **Domain** (use cases)
- **Data** зависит от **Domain** (repository interfaces)
- **Domain** ни от чего не зависит
- Все зависимости инжектируются через **GetIt**

## Соглашения

1. **Один файл = один класс** (за исключением тесно связанных типов, например events/states в BLoC)
2. **Immutable entities** — используем `freezed` для всех entities и states
3. **Either для ошибок** — `fpdart` `Either<Failure, T>` вместо exceptions на границе domain
4. **Нет бизнес-логики в UI** — вся логика в Use Cases и BLoC
5. **Нет прямых зависимостей на реализации** — только через абстракции (DI)
