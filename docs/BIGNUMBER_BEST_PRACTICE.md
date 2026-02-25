# BigNumber Best Practice

Этот документ фиксирует единый подход к денежным значениям, балансу, очкам, а также всем значениям, где важна точность и/или потенциально большие числа.

## TL;DR
- В прикладном коде **запрещено** использовать `bigint`.
- В прикладном коде для точных значений используем **`BigNumber`** (из `bignumber.js`) и value objects.
- `bigint` разрешён **только**:
  - в инфраструктурном слое (DB, adapters)
  - в Prisma mapper’ах при маппинге `BIGINT`
- В HTTP/NATS DTO суммы и идентификаторы передаём **строками**.

## Где использовать BigNumber
Используйте `BigNumber` для:
- денег (баланс, покупки, начисления)
- очков/ресурсов, которые могут расти и требуют точности
- любых вычислений, где `number` может дать ошибку округления

Не используйте `number` для денежных вычислений (разрешено только для UI/отображения, после конвертации).

## Как хранить деньги
Стандарт: хранить суммы в **минимальных единицах** (например, cents) как целое значение.
- `USD 10.50` → `1050` (cents)

Для операций/конвертаций используйте утилиты из `@lib/shared/utils/amount.utils`:
- `decimalToBigNumber(decimalAmount, decimals)` — из "10.50" → BigNumber(1050)
- `bigNumberToDecimal(amount, decimals)` — из BigNumber(1050) → "10.50"

## Prisma и bigint
Если в Prisma schema используется `BigInt`/`@db.BigInt`, то конвертация должна происходить **в mapper’ах**:
- `bigNumberToBigInt(value: BigNumber): bigint`
- `bigIntToBigNumber(value: bigint): BigNumber`

Обе функции находятся в `@lib/shared/utils/amount.utils` и предназначены для инфраструктуры.

## DTO правила
- Идентификаторы, которые в БД являются `BIGINT`, в DTO передаём как **`string`**.
- Денежные суммы в DTO:
  - либо как `string` в minor units
  - либо как `string` decimal + отдельное поле `decimals`

Пример подхода (общая идея):
- `balance: "1050"` + `decimals: 2`

## Currency / Language
- Нельзя хардкодить валютные коды, языки и связанные enum/константы.
- Используйте реализации из `@lib/shared/currency` и `@lib/shared/language`.

## Запрещено
- Делать расчёты денег через `number` (кроме форматирования/отображения результата).
- Использовать `bigint` в domain/application/presentation.
- Хардкодить валюты/языки строками в приложениях.

## Миграция со старого кода
В `@lib/shared/utils/amount.utils` присутствуют deprecated функции, возвращающие `bigint` (`decimalToBigInt`, `stringToBigInt`, `bigIntToDecimal`).
- Не используйте их в новом коде.
- Если встречаете использование в прикладном коде — выносите конвертацию в инфраструктуру и переходите на BigNumber-утилиты.