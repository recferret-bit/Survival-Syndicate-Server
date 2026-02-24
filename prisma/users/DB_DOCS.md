# Users Database Schema

## Overview

The Users database stores core identity and account data for the casino platform. It owns user registration, authentication credentials, ban status, and tracking/attribution metadata. This database is exclusively accessed by the `users` service.

User records include email/phone identifiers, password hash, optional bearer token for sessions, and profile fields (name, country, language, currency, birthday). Ban state is tracked with reason, comment, and timestamp. The Tracking table stores marketing attribution (UTM params, click IDs, IPs) in a 1:1 relationship with User. The Admin table manages API keys and status for administrative access, independent of user accounts.

## Table Relations (ASCII)

```
    ┌─────────────┐                    ┌─────────────┐
    │    User     │ 1 ───────────── 1  │  Tracking   │
    │             │                    │             │
    │ id (PK)     │                    │ userId (FK) │
    └─────────────┘                    └─────────────┘

    ┌─────────────┐
    │    Admin    │  (standalone)
    │ id (PK)     │
    └─────────────┘
```

## Enums

### BanReason

| Value              | Description                 |
|:-------------------|:----------------------------|
| fraud              | Fraudulent activity         |
| terms_violation    | Terms of service violation  |
| suspicious_activity| Suspicious behavior         |
| manual             | Manual ban by admin         |
| other              | Other reason                |

### AdminStatus

| Value    | Description      |
|:---------|:-----------------|
| active   | Admin can access |
| inactive | Admin disabled   |

## Tables

### user

Core user account entity. Stores identity, credentials, profile, and ban state.

| Column             | Type      | Constraints       | Description                  |
|:-------------------|:----------|:------------------|:-----------------------------|
| id                 | BigInt    | PK, autoincrement | User identifier              |
| email              | String    | unique, nullable  | User email                   |
| phone              | String    | unique, nullable  | User phone                   |
| password_hash      | String    | required          | Hashed password              |
| bearer_token_hash  | String    | nullable          | Current session token hash   |
| name               | String    | nullable          | Display name                 |
| is_test            | Boolean   | default: false    | Test account flag            |
| banned             | Boolean   | default: false    | Ban status                   |
| ban_reason         | BanReason | nullable          | Reason if banned             |
| ban_comment        | String    | nullable          | Admin comment                |
| ban_time           | DateTime  | nullable          | When banned                  |
| country            | String    | nullable          | Country code                 |
| language_iso_code  | String    | required          | Language (e.g. en, bn)       |
| currency_iso_code  | String    | required          | Default currency             |
| birthday           | DateTime  | nullable          | Date of birth                |
| created_at         | DateTime  | default: now()    | Creation timestamp           |
| updated_at         | DateTime  | updatedAt         | Last update timestamp        |

**Indexes:** (implicit on PK)
**Unique constraints:** email, phone

---

### tracking

Marketing attribution and tracking data. One record per user.

| Column        | Type   | Constraints           | Description               |
|:--------------|:-------|:----------------------|:--------------------------|
| id            | Int    | PK, autoincrement     | Record identifier         |
| user_id       | BigInt | FK → user.id, unique  | User reference            |
| first_ip      | String | required              | First known IP            |
| last_ip       | String | required              | Last known IP             |
| ga_client_id  | String | nullable              | Google Analytics client ID|
| ya_client_id  | String | nullable              | Yandex client ID          |
| click_id      | String | nullable              | Click identifier          |
| utm_medium    | String | nullable              | UTM medium                |
| utm_source    | String | nullable              | UTM source                |
| utm_campaign  | String | nullable              | UTM campaign              |
| pid           | String | nullable              | Partner ID                |
| sub1          | String | nullable              | Sub parameter 1           |
| sub2          | String | nullable              | Sub parameter 2           |
| sub3          | String | nullable              | Sub parameter 3           |

**Indexes:** (implicit on PK, unique user_id)
**Unique constraints:** user_id
**Relations:** user_id → user.id (CASCADE on delete)

---

### admin

Administrative accounts for API access. Independent of user accounts.

| Column   | Type        | Constraints       | Description           |
|:---------|:------------|:------------------|:----------------------|
| id       | BigInt      | PK, autoincrement | Admin identifier      |
| email    | String      | unique            | Admin email           |
| api_key  | String      | unique            | API key for auth      |
| status   | AdminStatus | default: active   | Active/inactive       |
| created_at| DateTime   | default: now()    | Creation timestamp    |
| updated_at| DateTime   | updatedAt         | Last update timestamp |

**Indexes:** (implicit on PK)
**Unique constraints:** email, api_key
