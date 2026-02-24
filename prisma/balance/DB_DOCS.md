# Balance Database Schema

## Overview

The Balance database implements an event-sourced ledger for user balances across three currency types: fiat, bonus, and crypto. It uses insert-only ledger tables for each currency type, with separate result tables holding the computed balance per user per currency. The UserBalance table aggregates all three currency balances per user.

Ledger entries record operations (add/subtract) with status (hold, refund, completed, failed, pending) and reason codes (payments_deposit, games_bet, bonus_activation, etc.). Balances are derived by replaying ledger entries; the result tables cache the current balance and last processed ledger ID for performance. All amounts are stored as BigInt in the smallest currency unit.

## Table Relations (ASCII)

```
                         ┌─────────────────────────────┐
                         │        UserBalance          │
                         │                             │
                         │  fiatBalanceId  ────────────┼──→ FiatBalanceResult
                         │  bonusBalanceId ────────────┼──→ BonusBalanceResult
                         │  cryptoBalanceId────────────┼──→ CryptoBalanceResult
                         └─────────────────────────────┘

    ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
    │   FiatBalanceLedger    │  │   BonusBalanceLedger   │  │  CryptoBalanceLedger   │
    │   (insert-only)        │  │   (insert-only)        │  │  (insert-only)         │
    └────────────────────────┘  └────────────────────────┘  └────────────────────────┘

    ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
    │   FiatBalanceResult    │  │   BonusBalanceResult   │  │  CryptoBalanceResult   │
    │   (computed balance)   │  │   (computed balance)   │  │  (computed balance)    │
    └────────────────────────┘  └────────────────────────┘  └────────────────────────┘
```

## Enums

### CurrencyType

| Value   | Description   |
|:--------|:---------------|
| fiat    | Real money     |
| bonus   | Bonus money    |
| crypto  | Cryptocurrency |

### OperationType

| Value    | Description        |
|:---------|:-------------------|
| add      | Credit to balance  |
| subtract | Debit from balance |

### OperationStatus

| Value     | Description         |
|:----------|:--------------------|
| hold      | Held/pending        |
| refund    | Refunded            |
| completed | Finalized           |
| failed    | Failed              |
| pending   | Awaiting completion |

### LedgerReason

| Value                | Description            |
|:---------------------|:-----------------------|
| payments_deposit     | Deposit via payments   |
| payments_withdrawal  | Withdrawal via payments|
| payments_refund      | Payment refund         |
| admin_correction     | Admin adjustment       |
| games_bet            | Game bet               |
| games_win            | Game win               |
| games_refund         | Game refund            |
| bonus_activation     | Bonus activated        |
| bonus_wager          | Bonus wagering         |
| bonus_free_spin      | Free spin              |
| bonus_claim          | Bonus claimed          |
| bonus_deactivation   | Bonus deactivated      |

## Tables

### fiat_balance_ledger

Insert-only ledger for fiat currency operations.

| Column           | Type         | Constraints              | Description              |
|:-----------------|:-------------|:-------------------------|:-------------------------|
| id               | UUID         | PK, default: uuid()      | Record identifier        |
| user_id          | BigInt       | required                 | User reference           |
| operation_id     | String       | required                 | Idempotency key          |
| currency_type    | CurrencyType | default: fiat            | Currency type            |
| amount           | BigInt       | required                 | Amount in smallest unit  |
| operation_type   | OperationType| required                 | add or subtract          |
| operation_status | OperationStatus | required              | Status                   |
| reason           | LedgerReason | required                 | Operation reason         |
| created_at       | DateTime     | default: now()           | Creation timestamp       |

**Indexes:** user_id, operation_id, created_at
**Unique constraints:** (user_id, operation_id)

---

### bonus_balance_ledger

Insert-only ledger for bonus currency operations.

| Column           | Type            | Constraints              | Description              |
|:-----------------|:----------------|:-------------------------|:-------------------------|
| id               | UUID            | PK, default: uuid()      | Record identifier        |
| user_id          | BigInt          | required                 | User reference           |
| operation_id     | String          | required                 | Idempotency key          |
| currency_type    | CurrencyType    | default: bonus           | Currency type            |
| amount           | BigInt          | required                 | Amount in smallest unit  |
| operation_type   | OperationType   | required                 | add or subtract          |
| operation_status | OperationStatus | required                 | Status                   |
| reason           | LedgerReason    | required                 | Operation reason         |
| created_at       | DateTime        | default: now()           | Creation timestamp       |

**Indexes:** user_id, operation_id, created_at
**Unique constraints:** (user_id, operation_id)

---

### crypto_balance_ledger

Insert-only ledger for crypto currency operations.

| Column           | Type            | Constraints              | Description              |
|:-----------------|:----------------|:-------------------------|:-------------------------|
| id               | UUID            | PK, default: uuid()      | Record identifier        |
| user_id          | BigInt          | required                 | User reference           |
| operation_id     | String          | required                 | Idempotency key          |
| currency_type    | CurrencyType    | default: crypto          | Currency type            |
| amount           | BigInt          | required                 | Amount in smallest unit  |
| operation_type   | OperationType   | required                 | add or subtract          |
| operation_status | OperationStatus | required                 | Status                   |
| reason           | LedgerReason    | required                 | Operation reason         |
| created_at       | DateTime        | default: now()           | Creation timestamp       |

**Indexes:** user_id, operation_id, created_at
**Unique constraints:** (user_id, operation_id)

---

### fiat_balance_result

Computed fiat balance per user. One row per user.

| Column             | Type     | Constraints        | Description                 |
|:-------------------|:---------|:-------------------|:----------------------------|
| id                 | UUID     | PK, default: uuid()| Record identifier           |
| user_id            | BigInt   | unique             | User reference              |
| balance            | BigInt   | required           | Current balance             |
| currency_iso_code  | String   | required           | Currency (e.g. bdt, usd)    |
| last_calculated_at | DateTime | default: now()     | Last calculation time       |
| last_ledger_id     | UUID     | nullable           | Last processed ledger entry |

**Indexes:** user_id, currency_iso_code
**Unique constraints:** user_id

---

### bonus_balance_result

Computed bonus balance per user. One row per user.

| Column             | Type     | Constraints        | Description                 |
|:-------------------|:---------|:-------------------|:----------------------------|
| id                 | UUID     | PK, default: uuid()| Record identifier           |
| user_id            | BigInt   | unique             | User reference              |
| balance            | BigInt   | required           | Current balance             |
| currency_iso_code  | String   | required           | Currency (e.g. bdt, usd)    |
| last_calculated_at | DateTime | default: now()     | Last calculation time       |
| last_ledger_id     | UUID     | nullable           | Last processed ledger entry |

**Indexes:** user_id, currency_iso_code
**Unique constraints:** user_id

---

### crypto_balance_result

Computed crypto balance per user. One row per user.

| Column             | Type     | Constraints        | Description                 |
|:-------------------|:---------|:-------------------|:----------------------------|
| id                 | UUID     | PK, default: uuid()| Record identifier           |
| user_id            | BigInt   | unique             | User reference              |
| balance            | BigInt   | required           | Current balance             |
| currency_iso_code  | String   | required           | Currency (e.g. bdt, usd)    |
| last_calculated_at | DateTime | default: now()     | Last calculation time       |
| last_ledger_id     | UUID     | nullable           | Last processed ledger entry |

**Indexes:** user_id, currency_iso_code
**Unique constraints:** user_id

---

### user_balance

Aggregates fiat, bonus, and crypto balance references per user.

| Column            | Type   | Constraints        | Description                 |
|:------------------|:------|:-------------------|:-----------------------------|
| id                | UUID   | PK, default: uuid()| Record identifier           |
| user_id           | BigInt | unique             | User reference              |
| fiat_balance_id   | UUID   | unique, FK         | → fiat_balance_result.id    |
| bonus_balance_id  | UUID   | unique, FK         | → bonus_balance_result.id   |
| crypto_balance_id | UUID   | unique, FK         | → crypto_balance_result.id  |

**Indexes:** user_id
**Unique constraints:** user_id, fiat_balance_id, bonus_balance_id, crypto_balance_id
