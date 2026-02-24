# Casino Core Libraries

This directory contains shared libraries for the casino-core monorepo, migrated from the legacy burmalda2 architecture.

## Migration from gRPC/Protobuf to NATS.io

The microservice libraries have been migrated from gRPC/Protobuf to NATS.io pub/sub with TypeScript interfaces and Zod validation.

### Migrated Libraries

#### ✅ Core Infrastructure
- **lib-nats**: Shared NATS connection management, base publisher/subscriber classes

#### ✅ Service Libraries
- **lib-affise**: Affise integration (2 methods)
  - `affise.firstDeposit` - Notify about first deposit
  - `affise.runExportData` - Trigger data export

- **lib-dengage**: Dengage marketing automation (2 methods)
  - `dengage.passwordRecovery` - Send password recovery email
  - `dengage.syncContacts` - Synchronize contacts

- **lib-exchange-rate**: Currency exchange rates (2 methods)
  - `exchangeRate.rates.get` - Get exchange rates
  - `exchangeRate.rates.set` - Update exchange rates

- **lib-bonus**: Bonus management (11 methods)
  - `bonus.deposit.create` - Create deposit bonus
  - `bonus.wager.decrement` - Decrement wager
  - `bonus.deposit.deactivate` - Deactivate bonus deposit
  - `bonus.freespin.bet` - Freespin bet
  - `bonus.freespin.win` - Freespin win
  - `bonus.freespin.deactivate` - Deactivate freespin
  - `bonus.bonuses.checkActive` - Check active bonuses
  - `bonus.bonus.select` - Select bonus
  - `bonus.bonus.receive` - Receive bonus
  - `bonus.bonuses.get` - Get bonuses
  - `bonus.selectedBonus.delete` - Delete selected bonus

#### ⚠️ Skipped Libraries
- **users-lib**: Uses Kafka events (not migrated, kept separate)
- **payments-lib**: Uses Kafka events (not migrated, kept separate)
- **transactions-lib**: Empty service (no methods defined)
- **games-lib**: Very large service (25+ methods) - TODO: migrate when needed

## Architecture

### Before (gRPC/Proto)
```
app-libs/
├── affise-lib/
│   ├── libs/proto-lib/src/proto/     # .proto files
│   ├── libs/proto-lib/src/types/     # Generated TypeScript
│   └── libs/common-lib/src/microservice/grpc/  # gRPC services
```

### After (NATS/TypeScript)
```
libs/
├── lib-nats/                          # Shared NATS infrastructure
│   └── src/
│       └── core/
│           ├── nats-connection.service.ts
│           ├── base-nats-publisher.ts
│           └── base-nats-subscriber.ts
└── lib-{service}/
    └── src/
        ├── contracts/                 # TypeScript interfaces
        ├── schemas/                   # Zod validation schemas
        ├── publishers/                # NATS publishers (client)
        ├── subscribers/               # NATS subscribers (server)
        └── {service}.module.ts
```

## Usage

### Publisher (Client-Side)

```typescript
import { LibAffiseModule, AffisePublisher } from '@lib/lib-affise';

@Module({
  imports: [LibAffiseModule],
})
export class MyModule {}

@Injectable()
export class MyService {
  constructor(private readonly affisePublisher: AffisePublisher) {}

  async notifyFirstDeposit() {
    await this.affisePublisher.firstDeposit({
      clickId: 'abc123',
      userId: 42,
      depositAmount: 10000,
      depositIsoCode: 'USD',
    });
  }
}
```

### Subscriber (Server-Side)

The subscribers are automatically initialized when the module is imported. Business logic handlers can be customized in the subscriber class:

```typescript
// In lib-affise/src/subscribers/affise.subscriber.ts
private async handleFirstDeposit(data: FirstDepositRequest): Promise<EmptyResponse> {
  // Implement actual business logic here
  // Call external Affise API, update database, etc.
  return { success: true };
}
```

## Benefits

### ✅ Advantages of NATS.io + TypeScript/Zod

- **No code generation** - Native TypeScript interfaces
- **Runtime validation** - Zod schemas validate at runtime
- **Simple patterns** - Request/reply and pub/sub
- **Easy debugging** - JSON payloads, not binary
- **Loose coupling** - Services discover via subjects
- **Better observability** - NATS monitoring tools
- **Auto-reconnection** - Built-in failover
- **Simpler deployment** - No proto files to distribute
- **Multiple patterns** - Request/reply, pub/sub, queue groups

### ❌ Limitations of gRPC/Proto (Removed)

- Required proto compiler and code generation
- Complex tooling (grpc-js, proto-gen-ts)
- Binary protocol harder to debug
- Tight coupling between client and server
- HTTP/2 required

## Configuration

Add to your `.env` file:

```bash
NATS_SERVERS=nats://localhost:4222,nats://nats-2:4222,nats://nats-3:4222
NATS_USER=
NATS_PASSWORD=
NATS_TOKEN=
```

## NATS Subject Naming Convention

Pattern: `{service}.{entity}.{action}` or `{service}.{action}`

Examples:
- `affise.firstDeposit`
- `bonus.deposit.create`
- `bonus.wager.decrement`
- `exchangeRate.rates.get`

## Queue Groups

All subscribers use queue groups for load balancing:
- `affise-workers`
- `dengage-workers`
- `exchange-rate-workers`
- `bonus-workers`

Multiple instances of the same service will share the load automatically.

## Development

### Adding a New Library

1. Create directory structure:
```bash
mkdir -p libs/lib-{service}/src/{contracts,schemas,publishers,subscribers}
```

2. Create TypeScript contracts from proto
3. Create Zod validation schemas
4. Implement publisher (client)
5. Implement subscriber (server)
6. Create module and index
7. Add to `nest-cli.json` and `tsconfig.json`

### Testing

```bash
# Build all libraries
npm run build

# Start a specific app
npm run start:payments

# Build and start with watch
npm run start:users:debug
```

## Migration Notes

- Original proto files are preserved in burmalda2 for reference
- Both systems can run in parallel during transition
- Consider using NATS JetStream for message persistence if needed
- All handlers have TODO comments for business logic implementation
- Type safety is enforced at compile-time and runtime

## Future Work

- [ ] Migrate lib-games (25+ methods) when needed
- [ ] Add OpenTelemetry tracing for distributed operations
- [ ] Implement NATS JetStream for critical operations
- [ ] Add comprehensive unit tests for publishers/subscribers
- [ ] Create integration tests with actual NATS server
- [ ] Add metrics collection for NATS operations
