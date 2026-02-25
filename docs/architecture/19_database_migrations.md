# 23. Database Migrations — Prisma

## 1. Обзор

| Инструмент | Prisma ORM |
|------------|-----------|
| Databases | PostgreSQL Meta + PostgreSQL Catalog |
| Schema | `prisma/meta/schema.prisma`, `prisma/catalog/schema.prisma` |
| Client | `@prisma/client` (генерируется) |

### npm scripts

```json
{
  "prisma:generate": "generate client для обеих баз",
  "prisma:migrate:dev": "создать + применить миграцию (dev)",
  "prisma:migrate:deploy": "применить миграции (prod)",
  "prisma:migrate:all": "alias для migrate:dev",
  "prisma:studio": "GUI для просмотра данных",
  "prisma:seed": "заполнить тестовыми данными",
  "prisma:reset": "сбросить + migrate + seed"
}
```

---

## 2. Структура проекта

```
survival-syndicate-server/
├── prisma/
│   ├── meta/
│   │   ├── schema.prisma          # Схема Meta DB
│   │   └── migrations/
│   │       ├── 20260201000000_init/
│   │       │   └── migration.sql
│   │       └── migration_lock.toml
│   │
│   ├── catalog/
│   │   ├── schema.prisma          # Схема Catalog DB
│   │   └── migrations/
│   │       ├── 20260201000000_init/
│   │       │   └── migration.sql
│   │       └── migration_lock.toml
│   │
│   └── seed.ts                    # Seeding script
│
├── libs/
│   └── database/
│       └── src/
│           ├── index.ts
│           ├── prisma.module.ts
│           ├── meta/
│           │   ├── meta-prisma.service.ts
│           │   └── meta-prisma.module.ts
│           └── catalog/
│               ├── catalog-prisma.service.ts
│               └── catalog-prisma.module.ts
│
└── package.json
```

---

## 3. Schema Files

### prisma/meta/schema.prisma

```prisma
// prisma/meta/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../node_modules/.prisma/meta-client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_META_URL")
}

// ==========================================
// Accounts & Players
// ==========================================

model Account {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  lastLoginAt   DateTime? @map("last_login_at")
  
  characters    Character[]
  refreshTokens RefreshToken[]
  
  @@map("accounts")
}

model RefreshToken {
  id        String   @id @default(uuid())
  accountId String   @map("account_id")
  family    String
  jti       String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  
  account   Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  
  @@index([accountId])
  @@index([family])
  @@map("refresh_tokens")
}

model Character {
  id          String   @id @default(uuid())
  accountId   String   @map("account_id")
  name        String
  level       Int      @default(1)
  experience  Int      @default(0)
  cash        Int      @default(1000)
  energy      Int      @default(100)
  maxEnergy   Int      @default(100) @map("max_energy")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  account     Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  buildings   CharacterBuilding[]
  trophies    CharacterTrophy[]
  achievements CharacterAchievement[]
  combatPool  CharacterCombatPool[]
  
  @@index([accountId])
  @@map("characters")
}

// ==========================================
// Buildings
// ==========================================

model CharacterBuilding {
  id              String   @id @default(uuid())
  characterId     String   @map("character_id")
  buildingTypeId  String   @map("building_type_id")
  level           Int      @default(1)
  upgradeStartedAt DateTime? @map("upgrade_started_at")
  upgradeEndsAt   DateTime? @map("upgrade_ends_at")
  lastCollectedAt DateTime @default(now()) @map("last_collected_at")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  character       Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  
  @@unique([characterId, buildingTypeId])
  @@index([characterId])
  @@map("character_buildings")
}

model BuildingUnlock {
  id            String   @id @default(uuid())
  characterId   String   @map("character_id")
  contentType   String   @map("content_type")  // 'raid_mode', 'district', 'feature'
  contentId     String   @map("content_id")
  unlockedAt    DateTime @default(now()) @map("unlocked_at")
  
  @@unique([characterId, contentType, contentId])
  @@index([characterId])
  @@map("building_unlocks")
}

// ==========================================
// Combat Progression
// ==========================================

model CharacterTrophy {
  id          String   @id @default(uuid())
  characterId String   @map("character_id")
  trophyId    String   @map("trophy_id")
  quantity    Int      @default(0)
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  character   Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  
  @@unique([characterId, trophyId])
  @@index([characterId])
  @@map("character_trophies")
}

model CharacterAchievement {
  id            String    @id @default(uuid())
  characterId   String    @map("character_id")
  achievementId String    @map("achievement_id")
  progress      Int       @default(0)
  completedAt   DateTime? @map("completed_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  character     Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  
  @@unique([characterId, achievementId])
  @@index([characterId])
  @@map("character_achievements")
}

model CharacterCombatPool {
  id          String   @id @default(uuid())
  characterId String   @map("character_id")
  itemType    String   @map("item_type")  // 'weapon', 'active_skill', 'passive_skill'
  itemId      String   @map("item_id")
  unlockedAt  DateTime @default(now()) @map("unlocked_at")
  
  character   Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  
  @@unique([characterId, itemType, itemId])
  @@index([characterId])
  @@map("character_combat_pool")
}

// ==========================================
// Matches
// ==========================================

model Match {
  id          String    @id @default(uuid())
  mode        String
  status      String    @default("waiting")  // waiting, in_progress, completed, cancelled
  maxPlayers  Int       @default(1) @map("max_players")
  createdAt   DateTime  @default(now()) @map("created_at")
  startedAt   DateTime? @map("started_at")
  endedAt     DateTime? @map("ended_at")
  
  participants MatchParticipant[]
  
  @@index([status])
  @@map("matches")
}

model MatchParticipant {
  id          String    @id @default(uuid())
  matchId     String    @map("match_id")
  characterId String    @map("character_id")
  result      String?   // victory, defeat, abandoned
  stats       Json?
  joinedAt    DateTime  @default(now()) @map("joined_at")
  leftAt      DateTime? @map("left_at")
  
  match       Match     @relation(fields: [matchId], references: [id], onDelete: Cascade)
  
  @@unique([matchId, characterId])
  @@index([matchId])
  @@index([characterId])
  @@map("match_participants")
}
```

### prisma/catalog/schema.prisma

```prisma
// prisma/catalog/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../node_modules/.prisma/catalog-client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_CATALOG_URL")
}

// ==========================================
// Buildings Catalog
// ==========================================

model BuildingType {
  id                  String   @id
  name                String
  description         String?
  category            String   // 'production', 'defense', 'special'
  maxLevel            Int      @map("max_level")
  baseCost            Int      @map("base_cost")
  baseProductionRate  Int?     @map("base_production_rate")
  baseProductionType  String?  @map("base_production_type")  // 'cash', 'energy'
  unlockRequirements  Json?    @map("unlock_requirements")
  
  levels              BuildingLevel[]
  
  @@map("building_types")
}

model BuildingLevel {
  id              String   @id @default(uuid())
  buildingTypeId  String   @map("building_type_id")
  level           Int
  upgradeCost     Int      @map("upgrade_cost")
  upgradeTime     Int      @map("upgrade_time")  // seconds
  productionRate  Int?     @map("production_rate")
  bonuses         Json?
  unlocks         Json?    // { contentType, contentId }
  
  buildingType    BuildingType @relation(fields: [buildingTypeId], references: [id])
  
  @@unique([buildingTypeId, level])
  @@map("building_levels")
}

// ==========================================
// Weapons Catalog
// ==========================================

model Weapon {
  id          String   @id
  name        String
  description String?
  type        String   // 'melee', 'ranged'
  category    String   // 'pistol', 'smg', 'shotgun', 'rifle', 'melee'
  rarity      String   // 'common', 'uncommon', 'rare', 'epic', 'legendary'
  damage      Int
  fireRate    Float?   @map("fire_rate")
  magazineSize Int?    @map("magazine_size")
  reloadTime  Float?   @map("reload_time")
  range       Float?
  accuracy    Float?
  special     Json?    // special abilities
  
  @@map("weapons")
}

// ==========================================
// Skills Catalog
// ==========================================

model Skill {
  id          String   @id
  name        String
  description String?
  type        String   // 'active', 'passive'
  category    String   // 'mobility', 'combat', 'support', 'defense'
  rarity      String
  cooldown    Float?   // for active skills
  duration    Float?
  effect      Json
  
  @@map("skills")
}

// ==========================================
// Trophies Catalog
// ==========================================

model Trophy {
  id          String   @id
  name        String
  description String?
  category    String   // 'common', 'rare', 'epic'
  dropSource  String   @map("drop_source")  // enemy_type
  dropRate    Float    @map("drop_rate")
  
  unlockRequirements CombatUnlockRequirement[]
  
  @@map("trophies")
}

// ==========================================
// Achievements Catalog
// ==========================================

model Achievement {
  id            String   @id
  name          String
  description   String?
  category      String   // 'combat', 'stealth', 'social', 'special'
  conditionType String   @map("condition_type")
  condition     Json
  target        Int
  rewardType    String   @map("reward_type")  // 'weapon', 'skill', 'cosmetic'
  rewardId      String   @map("reward_id")
  
  @@map("achievements")
}

// ==========================================
// Combat Unlock Requirements
// ==========================================

model CombatUnlockRequirement {
  id          String   @id @default(uuid())
  itemType    String   @map("item_type")  // 'weapon', 'active_skill', 'passive_skill'
  itemId      String   @map("item_id")
  sourceType  String   @map("source_type")  // 'trophy', 'achievement'
  sourceId    String   @map("source_id")
  quantity    Int      @default(1)  // for trophies
  
  trophy      Trophy?  @relation(fields: [sourceId], references: [id])
  
  @@unique([itemType, itemId, sourceType, sourceId])
  @@index([itemType, itemId])
  @@map("combat_unlock_requirements")
}

// ==========================================
// Enemies Catalog
// ==========================================

model Enemy {
  id          String   @id
  name        String
  description String?
  type        String   // 'melee_guard', 'ranged_guard', 'patrol', 'heavy', 'sniper', 'coordinator', 'specops'
  health      Int
  damage      Int
  speed       Float
  detection   Float
  abilities   Json?
  lootTable   Json?    @map("loot_table")
  
  @@map("enemies")
}

// ==========================================
// Raid Modes Catalog
// ==========================================

model RaidMode {
  id              String   @id
  name            String
  description     String?
  difficulty      String   // 'easy', 'normal', 'hard', 'nightmare'
  minPlayers      Int      @default(1) @map("min_players")
  maxPlayers      Int      @default(1) @map("max_players")
  duration        Int      // estimated seconds
  rewards         Json
  unlockCondition Json?    @map("unlock_condition")
  
  @@map("raid_modes")
}
```

---

## 4. Prisma Services

### Meta Prisma Service

```typescript
// libs/database/src/meta/meta-prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '.prisma/meta-client';

@Injectable()
export class MetaPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MetaPrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Meta database connected');

    // Query logging in dev
    if (process.env.NODE_ENV !== 'production') {
      this.$on('query' as any, (e: any) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Meta database disconnected');
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
```

### Catalog Prisma Service

```typescript
// libs/database/src/catalog/catalog-prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '.prisma/catalog-client';

@Injectable()
export class CatalogPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CatalogPrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Catalog database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Catalog database disconnected');
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
```

### Database Module

```typescript
// libs/database/src/prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { MetaPrismaService } from './meta/meta-prisma.service';
import { CatalogPrismaService } from './catalog/catalog-prisma.service';

@Global()
@Module({
  providers: [MetaPrismaService, CatalogPrismaService],
  exports: [MetaPrismaService, CatalogPrismaService],
})
export class DatabaseModule {}
```

### Index export

```typescript
// libs/database/src/index.ts
export * from './prisma.module';
export * from './meta/meta-prisma.service';
export * from './catalog/catalog-prisma.service';

// Re-export Prisma types
export * from '.prisma/meta-client';
export { Prisma as CatalogPrisma } from '.prisma/catalog-client';
```

---

## 5. Package.json Scripts

```json
{
  "scripts": {
    "prisma:generate": "npm run prisma:generate:meta && npm run prisma:generate:catalog",
    "prisma:generate:meta": "prisma generate --schema=prisma/meta/schema.prisma",
    "prisma:generate:catalog": "prisma generate --schema=prisma/catalog/schema.prisma",
    
    "prisma:migrate:dev": "npm run prisma:migrate:dev:meta && npm run prisma:migrate:dev:catalog",
    "prisma:migrate:dev:meta": "prisma migrate dev --schema=prisma/meta/schema.prisma",
    "prisma:migrate:dev:catalog": "prisma migrate dev --schema=prisma/catalog/schema.prisma",
    
    "prisma:migrate:deploy": "npm run prisma:migrate:deploy:meta && npm run prisma:migrate:deploy:catalog",
    "prisma:migrate:deploy:meta": "prisma migrate deploy --schema=prisma/meta/schema.prisma",
    "prisma:migrate:deploy:catalog": "prisma migrate deploy --schema=prisma/catalog/schema.prisma",
    
    "prisma:migrate:all": "npm run prisma:migrate:dev",
    
    "prisma:migrate:status": "npm run prisma:migrate:status:meta && npm run prisma:migrate:status:catalog",
    "prisma:migrate:status:meta": "prisma migrate status --schema=prisma/meta/schema.prisma",
    "prisma:migrate:status:catalog": "prisma migrate status --schema=prisma/catalog/schema.prisma",
    
    "prisma:studio:meta": "prisma studio --schema=prisma/meta/schema.prisma --port 5555",
    "prisma:studio:catalog": "prisma studio --schema=prisma/catalog/schema.prisma --port 5556",
    
    "prisma:seed": "ts-node prisma/seed.ts",
    
    "prisma:reset": "npm run prisma:reset:meta && npm run prisma:reset:catalog && npm run prisma:seed",
    "prisma:reset:meta": "prisma migrate reset --schema=prisma/meta/schema.prisma --force",
    "prisma:reset:catalog": "prisma migrate reset --schema=prisma/catalog/schema.prisma --force",
    
    "prisma:format": "prisma format --schema=prisma/meta/schema.prisma && prisma format --schema=prisma/catalog/schema.prisma",
    
    "prisma:validate": "prisma validate --schema=prisma/meta/schema.prisma && prisma validate --schema=prisma/catalog/schema.prisma"
  }
}
```

---

## 6. Environment Variables

```bash
# .env.local

# Meta DB (player data, characters, progress)
DATABASE_META_URL="postgresql://survival:survival_secret@localhost:5432/survival_meta?schema=public"

# Catalog DB (game content, weapons, buildings)
DATABASE_CATALOG_URL="postgresql://survival:survival_secret@localhost:5433/survival_catalog?schema=public"
```

---

## 7. Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient as MetaClient } from '.prisma/meta-client';
import { PrismaClient as CatalogClient } from '.prisma/catalog-client';

const metaPrisma = new MetaClient();
const catalogPrisma = new CatalogClient();

async function seedCatalog() {
  console.log('Seeding catalog database...');

  // Building Types
  await catalogPrisma.buildingType.createMany({
    data: [
      {
        id: 'hideout',
        name: 'Логово',
        description: 'Главное здание банды',
        category: 'special',
        maxLevel: 10,
        baseCost: 0,
      },
      {
        id: 'warehouse',
        name: 'Склад',
        description: 'Хранилище награбленного',
        category: 'production',
        maxLevel: 10,
        baseCost: 1000,
        baseProductionRate: 100,
        baseProductionType: 'cash',
      },
      {
        id: 'training_ground',
        name: 'Тренировочный полигон',
        description: 'Тренировка бойцов',
        category: 'special',
        maxLevel: 5,
        baseCost: 2000,
      },
    ],
    skipDuplicates: true,
  });

  // Weapons
  await catalogPrisma.weapon.createMany({
    data: [
      {
        id: 'pistol_persuader',
        name: 'Убеждатель',
        description: 'Стартовый пистолет',
        type: 'ranged',
        category: 'pistol',
        rarity: 'common',
        damage: 15,
        fireRate: 2.0,
        magazineSize: 12,
        reloadTime: 1.5,
        range: 20,
        accuracy: 0.8,
      },
      {
        id: 'melee_stinger',
        name: 'Жало',
        description: 'Стартовый нож',
        type: 'melee',
        category: 'melee',
        rarity: 'common',
        damage: 25,
        range: 2,
      },
      {
        id: 'smg_chicago_typewriter',
        name: 'Чикагская пишущая машинка',
        description: 'Классический Томпсон',
        type: 'ranged',
        category: 'smg',
        rarity: 'rare',
        damage: 12,
        fireRate: 10.0,
        magazineSize: 50,
        reloadTime: 2.5,
        range: 15,
        accuracy: 0.6,
      },
    ],
    skipDuplicates: true,
  });

  // Skills
  await catalogPrisma.skill.createMany({
    data: [
      {
        id: 'skill_dash',
        name: 'Рывок',
        description: 'Быстрое перемещение',
        type: 'active',
        category: 'mobility',
        rarity: 'common',
        cooldown: 5.0,
        effect: { type: 'dash', distance: 5, invulnerable: true },
      },
      {
        id: 'skill_medkit',
        name: 'Аптечка',
        description: 'Восстановление здоровья',
        type: 'active',
        category: 'support',
        rarity: 'common',
        cooldown: 15.0,
        effect: { type: 'heal', amount: 50 },
      },
      {
        id: 'perk_tough',
        name: 'Живучий',
        description: '+20 HP',
        type: 'passive',
        category: 'defense',
        rarity: 'common',
        effect: { type: 'stat_bonus', stat: 'max_health', value: 20 },
      },
    ],
    skipDuplicates: true,
  });

  // Trophies
  await catalogPrisma.trophy.createMany({
    data: [
      {
        id: 'trophy_guard_badge',
        name: 'Жетон охранника',
        description: 'Трофей с охранника',
        category: 'common',
        dropSource: 'melee_guard',
        dropRate: 0.3,
      },
      {
        id: 'trophy_patrol_insignia',
        name: 'Нашивка патрульного',
        description: 'Трофей с патрульного',
        category: 'common',
        dropSource: 'patrol',
        dropRate: 0.25,
      },
      {
        id: 'trophy_specops_dog_tag',
        name: 'Жетон спецназа',
        description: 'Редкий трофей',
        category: 'epic',
        dropSource: 'specops',
        dropRate: 0.1,
      },
    ],
    skipDuplicates: true,
  });

  // Achievements
  await catalogPrisma.achievement.createMany({
    data: [
      {
        id: 'ach_knife_kills_50',
        name: 'Мастер клинка',
        description: 'Убить 50 врагов оружием ближнего боя',
        category: 'combat',
        conditionType: 'kills',
        condition: { weaponType: 'melee' },
        target: 50,
        rewardType: 'weapon',
        rewardId: 'special_flamethrower',
      },
      {
        id: 'ach_headshots_50',
        name: 'Снайпер',
        description: '50 убийств в голову',
        category: 'combat',
        conditionType: 'kills',
        condition: { headshot: true },
        target: 50,
        rewardType: 'weapon',
        rewardId: 'special_grenade_launcher',
      },
    ],
    skipDuplicates: true,
  });

  // Enemies
  await catalogPrisma.enemy.createMany({
    data: [
      {
        id: 'melee_guard',
        name: 'Охранник-новичок',
        description: 'Базовый враг ближнего боя',
        type: 'melee_guard',
        health: 50,
        damage: 10,
        speed: 3.0,
        detection: 5.0,
      },
      {
        id: 'ranged_guard',
        name: 'Стрелок',
        description: 'Охранник с пистолетом',
        type: 'ranged_guard',
        health: 40,
        damage: 15,
        speed: 2.5,
        detection: 8.0,
      },
      {
        id: 'specops',
        name: 'Спецназовец',
        description: 'Элитный противник',
        type: 'specops',
        health: 150,
        damage: 30,
        speed: 4.0,
        detection: 12.0,
        abilities: { flashbang: true, callBackup: true },
      },
    ],
    skipDuplicates: true,
  });

  console.log('Catalog seeded successfully');
}

async function seedMeta() {
  console.log('Seeding meta database...');

  // Test account
  const testAccount = await metaPrisma.account.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: '$2b$10$dummyhashfordevonly',
    },
  });

  // Test character
  const testCharacter = await metaPrisma.character.upsert({
    where: { id: 'test-character-1' },
    update: {},
    create: {
      id: 'test-character-1',
      accountId: testAccount.id,
      name: 'TestGangster',
      level: 5,
      experience: 2500,
      cash: 10000,
      energy: 100,
      maxEnergy: 100,
    },
  });

  // Starter buildings
  await metaPrisma.characterBuilding.upsert({
    where: {
      characterId_buildingTypeId: {
        characterId: testCharacter.id,
        buildingTypeId: 'hideout',
      },
    },
    update: {},
    create: {
      characterId: testCharacter.id,
      buildingTypeId: 'hideout',
      level: 1,
    },
  });

  // Starter combat pool
  const starterItems = [
    { itemType: 'weapon', itemId: 'pistol_persuader' },
    { itemType: 'weapon', itemId: 'melee_stinger' },
    { itemType: 'active_skill', itemId: 'skill_dash' },
    { itemType: 'active_skill', itemId: 'skill_medkit' },
  ];

  for (const item of starterItems) {
    await metaPrisma.characterCombatPool.upsert({
      where: {
        characterId_itemType_itemId: {
          characterId: testCharacter.id,
          itemType: item.itemType,
          itemId: item.itemId,
        },
      },
      update: {},
      create: {
        characterId: testCharacter.id,
        itemType: item.itemType,
        itemId: item.itemId,
      },
    });
  }

  console.log('Meta seeded successfully');
}

async function main() {
  try {
    await seedCatalog();
    await seedMeta();
    console.log('All databases seeded successfully!');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await metaPrisma.$disconnect();
    await catalogPrisma.$disconnect();
  }
}

main();
```

---

## 8. Migration Workflow

### Development

```bash
# 1. Изменили schema.prisma
# 2. Создаём миграцию
npm run prisma:migrate:dev:meta
# Вводим имя миграции: add_new_field

# 3. Генерируем клиент (автоматически после migrate dev)
npm run prisma:generate

# 4. Проверяем в Prisma Studio
npm run prisma:studio:meta
```

### Production / CI

```bash
# В CI/CD pipeline
npm run prisma:migrate:deploy
```

### Откат (если нужно)

```bash
# Prisma не поддерживает rollback напрямую
# Варианты:
# 1. Создать новую миграцию, отменяющую изменения
# 2. Использовать prisma migrate resolve для пометки проблемной миграции

prisma migrate resolve --rolled-back 20260211123456_broken_migration --schema=prisma/meta/schema.prisma
```

---

## 9. Использование в сервисах

```typescript
// apps/player-service/src/player/player.service.ts
import { Injectable } from '@nestjs/common';
import { MetaPrismaService, Character, Prisma } from '@app/database';
import { PlayerNotFoundException } from '@app/common';

@Injectable()
export class PlayerService {
  constructor(private readonly prisma: MetaPrismaService) {}

  async findById(id: string): Promise<Character> {
    const character = await this.prisma.character.findUnique({
      where: { id },
      include: {
        buildings: true,
        combatPool: true,
      },
    });

    if (!character) {
      throw new PlayerNotFoundException(id);
    }

    return character;
  }

  async create(accountId: string, name: string): Promise<Character> {
    return this.prisma.character.create({
      data: {
        accountId,
        name,
        // Создаём стартовые здания и пул
        buildings: {
          create: {
            buildingTypeId: 'hideout',
            level: 1,
          },
        },
        combatPool: {
          createMany: {
            data: [
              { itemType: 'weapon', itemId: 'pistol_persuader' },
              { itemType: 'weapon', itemId: 'melee_stinger' },
              { itemType: 'active_skill', itemId: 'skill_dash' },
              { itemType: 'active_skill', itemId: 'skill_medkit' },
            ],
          },
        },
      },
      include: {
        buildings: true,
        combatPool: true,
      },
    });
  }

  async updateResources(id: string, cash: number, energy: number): Promise<Character> {
    return this.prisma.character.update({
      where: { id },
      data: { cash, energy },
    });
  }
}
```

---

## 10. Health Check

```typescript
// libs/database/src/prisma.health.ts
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { MetaPrismaService } from './meta/meta-prisma.service';
import { CatalogPrismaService } from './catalog/catalog-prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(
    private readonly metaPrisma: MetaPrismaService,
    private readonly catalogPrisma: CatalogPrismaService,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const [metaHealthy, catalogHealthy] = await Promise.all([
      this.metaPrisma.isHealthy(),
      this.catalogPrisma.isHealthy(),
    ]);

    const isHealthy = metaHealthy && catalogHealthy;
    const result = this.getStatus(key, isHealthy, {
      meta: metaHealthy ? 'up' : 'down',
      catalog: catalogHealthy ? 'up' : 'down',
    });

    if (!isHealthy) {
      throw new HealthCheckError('Database check failed', result);
    }

    return result;
  }
}
```

---

## 11. Best Practices

### Checklist

- [x] Отдельные схемы для Meta и Catalog
- [x] Separate Prisma clients с разными output paths
- [x] Migration scripts для dev и deploy
- [x] Seed script с тестовыми данными
- [x] Health checks для обеих баз
- [x] Logging queries в dev режиме
- [x] Graceful shutdown (disconnect)

### Naming Conventions

| Prisma | PostgreSQL |
|--------|------------|
| `camelCase` fields | `snake_case` columns via `@map()` |
| `PascalCase` models | `snake_case` tables via `@@map()` |

### Миграции: правила

1. **Никогда** не редактируйте существующие миграции
2. **Всегда** проверяйте SQL перед deploy
3. Используйте `prisma:migrate:status` для проверки состояния
4. В prod используйте только `prisma:migrate:deploy`
