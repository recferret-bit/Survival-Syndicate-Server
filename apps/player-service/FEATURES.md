# Users - Features

**Port:** 3000

## HTTP Endpoints

- `POST /register` - Register user
- `POST /login` - Login
- `GET /profile` - Get profile
- `PATCH /profile` - Update profile
- `POST /profile/attach-email` - Attach email
- `POST /profile/attach-phone` - Attach phone
- `GET /currencies` - Get currencies
- `GET /languages` - Get languages

## NATS Handlers

- `users.update-banned-users-cache.v1` - Update banned users cache
- `users.sync-active-users-cache.v1` - Sync active users cache
- `users.get-user-by-id.v1` - Get user by ID
- `users.validate-admin-api-key.v1` - Validate admin API key

## Key Capabilities

- User registration and login (JWT)
- Profile and contact management (email, phone)
- Admin API key validation
- Banned/active user cache updates (called by cron)
