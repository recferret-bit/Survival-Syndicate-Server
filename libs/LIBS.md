# Shared Libraries

## libs/shared

Common utilities and infrastructure used across all apps.

- **Auth** - JWT, guards, UserSession
- **Currency** - Currency enum, getCurrencySymbol, getCurrencyVelueByStringCode, decimals
- **Language** - Language class, Languages, getLanguageByCode
- **NATS** - Client, stream config, registerNonDurablePattern
- **Redis** - Cache, locking
- **Health** - Health check endpoints
- **Metrics** - Prometheus metrics
- **Pagination** - Pagination utilities
- **Guards** - AuthJwtGuard, AdminApiKeyGuard, TestProviderGuard
- **BigNumber utils** - bigIntToBigNumber, bigNumberToBigInt, stringToBigNumber, bigNumberToDecimal
- **Env** - EnvService, env schema (Zod)

## libs/lib-balance

Balance service NATS contracts.

- **BalancePublisher** - createUserBalance, addBalanceEntry, getUserBalance
- **BalanceSubjects** - CREATE_USER_BALANCE, ADD_BALANCE_ENTRY, GET_USER_BALANCE
- **Schemas** - Request/response Zod schemas

## libs/lib-users

Users service NATS contracts.

- **UsersPublisher** - getUserIdByApiKey, getBannedUsers, getActiveUsers, validateAdminApiKey
- **UsersSubjects** - GET_USER_BY_ID, UPDATE_BANNED_USERS_CACHE, SYNC_ACTIVE_USERS_CACHE, VALIDATE_ADMIN_API_KEY
- **Schemas** - Request/response Zod schemas

## libs/lib-payments

Payments service NATS contracts.

- **PaymentsPublisher** - processApprovedTransactions, updatePollingTransactions, getUserStats
- **PaymentsSubjects** - PROCESS_APPROVED_TRANSACTIONS, UPDATE_POLLING_TRANSACTIONS, USER_STATS_GET
- **Schemas** - Request/response Zod schemas

## libs/lib-games

Games service NATS contracts.

- **GamesPublisher** - expireInactiveSessions, getUserStats, resetWagerCycle
- **GamesSubjects** - SESSIONS_EXPIRE_INACTIVE, USER_STATS_GET, WAGER_CYCLE_RESET
- **Schemas** - Request/response Zod schemas

## libs/lib-bonus

Bonus service NATS contracts.

- **BonusPublisher** - Publish bonus events
- **BonusSubjects** - CHECK_EXPIRED, deposit/bet event subscriptions
- **BonusType** - Bonus type enum
- **Schemas** - Request/response Zod schemas

## libs/lib-currency-rate

Currency rate NATS contracts.

- **CurrencyRatePublisher** - getRates
- **CurrencyRateSubjects** - GET
- **Schemas** - Request/response Zod schemas

## libs/lib-affise

Affise integration (affiliate tracking).

- **AffisePublisher** - FIRST_DEPOSIT, RUN_EXPORT_DATA
- **AffiseSubjects** - Event subjects

## libs/lib-dengage

Dengage integration (marketing/CRM).

- **DengagePublisher** - PASSWORD_RECOVERY, RUN_SYNC_CONTACTS
- **DengageSubjects** - Event subjects

## libs/lib-exchange-rate

Exchange rate contracts (internal exchange rate handling).

- **ExchangeRatePublisher** - GET_EXCHANGE_RATES, RUN_SET_EXCHANGE_RATES
- **ExchangeRateSubjects** - Event subjects
