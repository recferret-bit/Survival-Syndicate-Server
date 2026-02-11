# 46. Схема базы данных PostgreSQL

## Обзор

Данные распределены по трём инстансам PostgreSQL для балансировки нагрузки:

| Инстанс | Назначение | Нагрузка |
|---------|------------|----------|
| **Postgres_Users** | Аккаунты, персонажи, соцграф | Чтение > Запись |
| **Postgres_Meta** | Прогрессия, инвентарь, валюта | **Очень высокая** (R+W) |
| **Postgres_Catalog** | Справочники (оружие, скиллы) | Только чтение |

---

## 1. Postgres_Users (Аккаунты и социальные данные)

### 1.1. users
Основная таблица аккаунтов.

```sql
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    characters_count INT NOT NULL DEFAULT 0,
    characters_max  INT NOT NULL DEFAULT 3,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login      TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### 1.2. characters
Персонажи игрока. У одного игрока может быть несколько персонажей.

```sql
CREATE TABLE characters (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nickname        VARCHAR(32) NOT NULL UNIQUE,
    avatar_url      VARCHAR(512),
    level           INT NOT NULL DEFAULT 1,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_nickname ON characters(nickname);
```

### 1.3. friendships
Социальный граф (друзья).

```sql
CREATE TABLE friendships (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(16) NOT NULL DEFAULT 'pending', -- pending, accepted, blocked
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
```

### 1.4. bans
Баны игроков.

```sql
CREATE TABLE bans (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason          TEXT NOT NULL,
    expires_at      TIMESTAMP, -- NULL = перманентный
    issued_by       BIGINT REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bans_user_id ON bans(user_id);
CREATE INDEX idx_bans_expires_at ON bans(expires_at);
```

---

## 2. Postgres_Meta (Прогрессия игрока)

### 2.1. wallets
Валюта персонажа.

```sql
CREATE TABLE wallets (
    character_id    BIGINT PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
    soft_currency   BIGINT NOT NULL DEFAULT 0,
    hard_currency   BIGINT NOT NULL DEFAULT 0,
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 2.2. inventory
Инвентарь персонажа (расходники, материалы, и т.д.).

```sql
CREATE TABLE inventory (
    id              BIGSERIAL PRIMARY KEY,
    character_id    BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    item_type       VARCHAR(32) NOT NULL, -- consumable, material, key, etc.
    item_id         VARCHAR(64) NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    data_json       JSONB, -- доп. данные (состояние, модификаторы)
    
    UNIQUE(character_id, item_type, item_id)
);

CREATE INDEX idx_inventory_character_id ON inventory(character_id);
```

### 2.3. character_combat_pool
**Боевой пул персонажа** — разблокированное оружие и скиллы, которые могут выпасть в матче.

```sql
CREATE TABLE character_combat_pool (
    id              BIGSERIAL PRIMARY KEY,
    character_id    BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    item_type       VARCHAR(16) NOT NULL,     -- weapon, active_skill, passive_skill
    item_id         VARCHAR(64) NOT NULL,     -- FK на weapon_catalog или skill_catalog
    unlocked_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(character_id, item_type, item_id)
);

CREATE INDEX idx_combat_pool_character ON character_combat_pool(character_id);
CREATE INDEX idx_combat_pool_type ON character_combat_pool(item_type);
```

> **Роуглайк-механика:** Оружие и скиллы НЕ экипируются напрямую. Они добавляются в пул, из которого выпадают во время матча. Чем больше разблокировано — тем богаче пул выбора.

### 2.5. buildings
Здания в городе персонажа.

```sql
CREATE TABLE buildings (
    id              BIGSERIAL PRIMARY KEY,
    character_id    BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    building_id     VARCHAR(64) NOT NULL,
    level           INT NOT NULL DEFAULT 1,
    slot            INT NOT NULL,
    upgraded_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(character_id, building_id)
);

CREATE INDEX idx_buildings_character_id ON buildings(character_id);
```

### 2.6. player_stats
Статистика персонажа.

```sql
CREATE TABLE player_stats (
    character_id    BIGINT PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
    matches_played  INT NOT NULL DEFAULT 0,
    matches_won     INT NOT NULL DEFAULT 0,
    kills           INT NOT NULL DEFAULT 0,
    deaths          INT NOT NULL DEFAULT 0,
    damage_dealt    BIGINT NOT NULL DEFAULT 0,
    playtime_seconds BIGINT NOT NULL DEFAULT 0,
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 3. Postgres_Catalog (Справочники)

### 3.1. weapon_catalog
Справочник всего оружия в игре.

```sql
CREATE TABLE weapon_catalog (
    id              VARCHAR(64) PRIMARY KEY, -- "pistol_persuader"
    name            VARCHAR(128) NOT NULL,   -- "Убеждатель"
    name_en         VARCHAR(128) NOT NULL,   -- "The Persuader"
    type            VARCHAR(16) NOT NULL,    -- melee, ranged
    category        VARCHAR(32) NOT NULL,    -- melee, pistol, smg, shotgun, rifle
    damage          INT NOT NULL,
    fire_rate       DECIMAL(5,2) NOT NULL,   -- выстрелов/сек
    magazine_size   INT,                     -- NULL для melee
    reload_time     DECIMAL(4,2),            -- NULL для melee
    spread          DECIMAL(4,3),            -- разброс
    range           DECIMAL(5,1) NOT NULL,   -- метры
    noise           VARCHAR(16) NOT NULL,    -- silent, low, medium, loud
    rarity          VARCHAR(16) NOT NULL,    -- common, rare, epic
    crit_chance     DECIMAL(4,3) NOT NULL,   -- 0.10 = 10%
    crit_multiplier DECIMAL(4,2) NOT NULL,   -- 1.5 = x1.5
    max_level       INT NOT NULL DEFAULT 10,
    unlock_source   VARCHAR(128),            -- "armory_3"
    description     TEXT
);

CREATE INDEX idx_weapon_catalog_category ON weapon_catalog(category);
CREATE INDEX idx_weapon_catalog_rarity ON weapon_catalog(rarity);
```

### 3.2. skill_catalog
Справочник всех навыков (активные + пассивные).

```sql
CREATE TABLE skill_catalog (
    id              VARCHAR(64) PRIMARY KEY,  -- "skill_gas_grenade"
    name            VARCHAR(128) NOT NULL,    -- "Газовая граната"
    type            VARCHAR(16) NOT NULL,     -- active, passive
    category        VARCHAR(32) NOT NULL,     -- crowd_control, support, damage, mobility, combat, defense, economy, team, style
    effect          TEXT NOT NULL,            -- описание эффекта
    radius          DECIMAL(5,1),             -- метры (nullable)
    duration        DECIMAL(5,1),             -- секунды (nullable)
    cooldown        DECIMAL(5,1),             -- секунды (nullable для пассивок)
    damage          INT,                      -- урон (nullable)
    modifier_value  DECIMAL(5,3),             -- +0.15 = +15% (nullable)
    max_level       INT NOT NULL DEFAULT 5,
    unlock_source   VARCHAR(128),             -- "laboratory_3"
    synergy         VARCHAR(64),              -- связанный перк (nullable)
    description     TEXT
);

CREATE INDEX idx_skill_catalog_type ON skill_catalog(type);
CREATE INDEX idx_skill_catalog_category ON skill_catalog(category);
```

---

## 4. Postgres_Misc (Лидерборды, история, гильдии)

### 4.1. leaderboards
Таблицы лидеров.

```sql
CREATE TABLE leaderboards (
    id              BIGSERIAL PRIMARY KEY,
    character_id    BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    board_type      VARCHAR(32) NOT NULL,    -- kills, wins, score, etc.
    score           BIGINT NOT NULL DEFAULT 0,
    rank            INT,
    season          INT NOT NULL DEFAULT 1,
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(character_id, board_type, season)
);

CREATE INDEX idx_leaderboards_board_type_score ON leaderboards(board_type, score DESC);
CREATE INDEX idx_leaderboards_season ON leaderboards(season);
```

### 4.2. match_history
История матчей (только метаданные).

```sql
CREATE TABLE match_history (
    id              BIGSERIAL PRIMARY KEY,
    match_uuid      UUID NOT NULL UNIQUE,
    mode            VARCHAR(32) NOT NULL,    -- pve_heist, pvp_arena, etc.
    result          VARCHAR(16) NOT NULL,    -- victory, defeat, abandoned
    duration_sec    INT NOT NULL,
    player_count    INT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_match_history_created_at ON match_history(created_at DESC);
```

### 4.3. match_participants
Участники матчей.

```sql
CREATE TABLE match_participants (
    id              BIGSERIAL PRIMARY KEY,
    match_id        BIGINT NOT NULL REFERENCES match_history(id) ON DELETE CASCADE,
    character_id    BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    kills           INT NOT NULL DEFAULT 0,
    deaths          INT NOT NULL DEFAULT 0,
    damage_dealt    INT NOT NULL DEFAULT 0,
    score           INT NOT NULL DEFAULT 0,
    
    UNIQUE(match_id, character_id)
);

CREATE INDEX idx_match_participants_character_id ON match_participants(character_id);
```

### 4.4. guilds
Гильдии.

```sql
CREATE TABLE guilds (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(64) NOT NULL UNIQUE,
    tag             VARCHAR(8) NOT NULL UNIQUE,
    owner_id        BIGINT NOT NULL REFERENCES users(id),
    description     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guilds_name ON guilds(name);
```

### 4.5. guild_members
Члены гильдий.

```sql
CREATE TABLE guild_members (
    id              BIGSERIAL PRIMARY KEY,
    guild_id        BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(16) NOT NULL DEFAULT 'member', -- owner, officer, member
    joined_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(guild_id, user_id)
);

CREATE INDEX idx_guild_members_user_id ON guild_members(user_id);
```

---

## 5. Postgres_Catalog (продолжение) — Метапрогрессия

### 5.1. building_catalog
Справочник всех зданий в игре.

```sql
CREATE TABLE building_catalog (
    id              VARCHAR(64) PRIMARY KEY,  -- "armory", "laboratory", "dojo"
    name            VARCHAR(128) NOT NULL,    -- "Оружейка «Арсенал»"
    name_en         VARCHAR(128) NOT NULL,    -- "Armory 'Arsenal'"
    category        VARCHAR(32) NOT NULL,     -- key, income, mission, boost, content, infrastructure, defense
    max_level       INT NOT NULL,
    description     TEXT
);
```

### 5.2. building_levels
Параметры каждого уровня здания.

```sql
CREATE TABLE building_levels (
    id              BIGSERIAL PRIMARY KEY,
    building_id     VARCHAR(64) NOT NULL REFERENCES building_catalog(id),
    level           INT NOT NULL,
    cost_soft       INT NOT NULL,             -- стоимость в soft currency
    build_time_min  INT NOT NULL,             -- время строительства в минутах
    effect_json     JSONB NOT NULL,           -- эффект уровня {"passive_income": 80, "hp_bonus": 0.05}
    
    UNIQUE(building_id, level)
);

CREATE INDEX idx_building_levels_building_id ON building_levels(building_id);
```

### 5.3. building_unlocks
**Социальная прогрессия.** Здания открывают режимы и механики, НЕ оружие/скиллы.

```sql
CREATE TABLE building_unlocks (
    id              BIGSERIAL PRIMARY KEY,
    building_id     VARCHAR(64) NOT NULL REFERENCES building_catalog(id),
    building_level  INT NOT NULL,
    unlock_type     VARCHAR(32) NOT NULL,     -- game_mode, district, feature
    unlock_id       VARCHAR(64) NOT NULL,     -- "heist_mall", "district_3", "raid_syndicate", "mode_mole"
    
    UNIQUE(building_id, building_level, unlock_id)
);

CREATE INDEX idx_building_unlocks_building ON building_unlocks(building_id, building_level);
```

### 5.4. trophy_catalog
**Справочник трофеев** — ресурсы с врагов для боевой прогрессии.

```sql
CREATE TABLE trophy_catalog (
    id              VARCHAR(64) PRIMARY KEY,  -- "trophy_guard_badge", "trophy_elite_chip"
    name            VARCHAR(128) NOT NULL,    -- "Жетон охранника"
    category        VARCHAR(32) NOT NULL,     -- common, rare, epic, legendary
    drop_source     VARCHAR(128) NOT NULL,    -- "melee_guard", "elite_sniper", "boss_coordinator"
    drop_chance     DECIMAL(5,4) NOT NULL,    -- 0.15 = 15%
    description     TEXT
);
```

### 5.5. character_trophies
**Собранные трофеи персонажа.**

```sql
CREATE TABLE character_trophies (
    id              BIGSERIAL PRIMARY KEY,
    character_id    BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    trophy_id       VARCHAR(64) NOT NULL REFERENCES trophy_catalog(id),
    quantity        INT NOT NULL DEFAULT 0,
    
    UNIQUE(character_id, trophy_id)
);

CREATE INDEX idx_character_trophies_character ON character_trophies(character_id);
```

### 5.6. achievement_catalog
**Справочник достижений.**

```sql
CREATE TABLE achievement_catalog (
    id              VARCHAR(64) PRIMARY KEY,  -- "ach_knife_kills_50", "ach_heist_no_damage"
    name            VARCHAR(128) NOT NULL,    -- "Мастер клинка"
    category        VARCHAR(32) NOT NULL,     -- combat, stealth, survival, social
    condition_type  VARCHAR(32) NOT NULL,     -- kills, damage, heists, time, special
    condition_json  JSONB NOT NULL,           -- {"weapon_type": "melee", "count": 50}
    description     TEXT
);
```

### 5.7. character_achievements
**Выполненные достижения персонажа.**

```sql
CREATE TABLE character_achievements (
    id              BIGSERIAL PRIMARY KEY,
    character_id    BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    achievement_id  VARCHAR(64) NOT NULL REFERENCES achievement_catalog(id),
    progress        INT NOT NULL DEFAULT 0,   -- текущий прогресс
    completed_at    TIMESTAMP,                -- NULL = не выполнено
    
    UNIQUE(character_id, achievement_id)
);

CREATE INDEX idx_character_achievements_character ON character_achievements(character_id);
```

### 5.8. combat_unlock_requirements
**Боевая прогрессия.** Условия добавления оружия/скиллов в ПУЛ выпадений.

```sql
CREATE TABLE combat_unlock_requirements (
    id              BIGSERIAL PRIMARY KEY,
    item_type       VARCHAR(16) NOT NULL,     -- weapon, skill
    item_id         VARCHAR(64) NOT NULL,     -- FK на weapon_catalog или skill_catalog
    unlock_type     VARCHAR(16) NOT NULL,     -- trophy, achievement
    unlock_id       VARCHAR(64) NOT NULL,     -- trophy_id или achievement_id
    quantity        INT NOT NULL DEFAULT 1,   -- сколько трофеев нужно (для achievement = 1)
    
    UNIQUE(item_type, item_id)
);

CREATE INDEX idx_combat_unlock_item ON combat_unlock_requirements(item_type, item_id);
CREATE INDEX idx_combat_unlock_source ON combat_unlock_requirements(unlock_type, unlock_id);
```

---

## 6. Начальные данные (Seed)

### 6.1. building_catalog (из GDD)

```sql
INSERT INTO building_catalog (id, name, name_en, category, max_level, description) VALUES
-- Ключевые
('headquarters', 'Штаб «Корона»', 'HQ "Crown"', 'key', 8, 'Слоты персонажей и лимит зданий'),
('hideout', 'Притон «Подполье»', 'Hideout "Underground"', 'key', 6, 'Разблокировка персонажей'),
('power_plant', 'Электростанция «Разряд»', 'Power Plant "Discharge"', 'key', 6, 'Энергия'),
-- Доход
('bar', 'Бар «Три Туза»', 'Bar "Three Aces"', 'income', 6, 'Пассивный доход'),
('casino', 'Казино «Фортуна»', 'Casino "Fortune"', 'income', 7, 'Бонус к доходу'),
('nightclub', 'Ночной клуб «Неон»', 'Nightclub "Neon"', 'income', 6, 'Высокий пассивный доход'),
-- Миссии
('bookmaker', 'Букмекерская «Удача»', 'Bookmaker "Luck"', 'mission', 6, 'Ставочные миссии'),
('dispatch', 'Диспетчерская «Связной»', 'Dispatch "Liaison"', 'mission', 6, 'AFK-миссии'),
('garage', 'Автомастерская «Гараж»', 'Garage', 'mission', 6, 'Ускорение миссий'),
-- Усиления
('gym', 'Качалка «Титан»', 'Gym "Titan"', 'boost', 6, 'Бонус HP'),
('shooting_range', 'Тир «Точка»', 'Shooting Range "Dot"', 'boost', 6, 'Точность и криты'),
('arena', 'Арена «Бойня»', 'Arena "Slaughter"', 'boost', 6, 'Скорость'),
-- Контент (разблокировка)
('armory', 'Оружейка «Арсенал»', 'Armory "Arsenal"', 'content', 8, 'Открывает оружие'),
('laboratory', 'Лаборатория «Синтез»', 'Laboratory "Synthesis"', 'content', 6, 'Открывает активные скиллы'),
('dojo', 'Додзё «Тень»', 'Dojo "Shadow"', 'content', 6, 'Открывает пассивные скиллы'),
-- Инфраструктура
('contact_network', 'Контактная сеть «Паутина»', 'Contact Network "Web"', 'infrastructure', 5, 'Инсайдеры'),
('surveillance', 'Центр наблюдения «Око»', 'Surveillance "Eye"', 'infrastructure', 6, 'Сложность районов'),
-- Защита
('security', 'Охранный блок «Бастион»', 'Security "Bastion"', 'defense', 6, 'Охранники'),
('vault', 'Обменник «Сейф»', 'Vault "Safe"', 'defense', 6, 'Защита валюты'),
('pawnshop', 'Ломбард «Золотая рука»', 'Pawnshop "Golden Hand"', 'defense', 5, 'Удача');
```

### 6.2. building_unlocks — Социальная прогрессия (режимы и механики)

```sql
INSERT INTO building_unlocks (building_id, building_level, unlock_type, unlock_id) VALUES
-- Штаб: основные режимы
('headquarters', 3, 'game_mode', 'raid_syndicate'),        -- Рейды на синдикаты
('headquarters', 5, 'feature', 'command_center'),          -- Командный центр
('headquarters', 6, 'feature', 'analytics'),               -- Аналитика
('headquarters', 7, 'game_mode', 'new_districts'),         -- Новые районы
-- Центр наблюдения: районы ТЦ
('surveillance', 1, 'district', 'district_1_easy'),        -- Район 1 (Обычный)
('surveillance', 2, 'district', 'district_2_medium'),      -- Район 2 (Сложный)
('surveillance', 3, 'district', 'district_3_hard'),        -- Район 3 (Опасный)
('surveillance', 4, 'district', 'district_4_elite'),       -- Район 4 (Элитный)
('surveillance', 5, 'district', 'district_5_legendary'),   -- Район 5 (Легендарный)
('surveillance', 6, 'district', 'district_6_hardcore'),    -- Район 6 (Хардкор)
-- Охранный блок: вторжения
('security', 3, 'game_mode', 'base_defense'),              -- Защита базы
('security', 5, 'game_mode', 'raid_invasion'),             -- Вторжения на чужие базы
-- Контактная сеть: режим "Крот"
('contact_network', 4, 'game_mode', 'mode_mole'),          -- Режим "Крот" (за полицию)
('contact_network', 5, 'feature', 'full_intel');           -- Полная информация о картах
```

### 6.3. trophy_catalog — Трофеи с врагов

```sql
INSERT INTO trophy_catalog (id, name, category, drop_source, drop_chance, description) VALUES
-- Обычные (с рядовых)
('trophy_guard_badge', 'Жетон охранника', 'common', 'melee_guard', 0.25, 'Стандартный жетон охраны ТЦ'),
('trophy_radio_chip', 'Чип рации', 'common', 'ranged_guard', 0.20, 'Микросхема полицейской рации'),
('trophy_baton_grip', 'Рукоять дубинки', 'common', 'melee_guard', 0.15, 'Изношенная резиновая рукоять'),
-- Редкие (с патрульных и тяжёлых)
('trophy_patrol_insignia', 'Знак патруля', 'rare', 'patrol', 0.12, 'Нашивка элитного патруля'),
('trophy_armor_fragment', 'Фрагмент брони', 'rare', 'heavy', 0.10, 'Осколок тактической брони'),
('trophy_tactical_lens', 'Тактическая линза', 'rare', 'sniper', 0.08, 'Оптика снайперского прицела'),
-- Эпические (со спецназа)
('trophy_specops_dog_tag', 'Жетон спецназа', 'epic', 'specops', 0.05, 'Личный жетон бойца спецподразделения'),
('trophy_elite_comm', 'Элитный коммуникатор', 'epic', 'coordinator', 0.04, 'Зашифрованное устройство связи'),
-- Легендарные (с боссов)
('trophy_boss_medal', 'Медаль командира', 'legendary', 'boss', 0.02, 'Награда за особые заслуги');
```

### 6.4. achievement_catalog — Достижения

```sql
INSERT INTO achievement_catalog (id, name, category, condition_type, condition_json, description) VALUES
-- Боевые
('ach_knife_kills_50', 'Мастер клинка', 'combat', 'kills', '{"weapon_type": "melee", "count": 50}', 'Убить 50 врагов оружием ближнего боя'),
('ach_pistol_kills_100', 'Стрелок', 'combat', 'kills', '{"weapon_category": "pistol", "count": 100}', 'Убить 100 врагов из пистолета'),
('ach_headshots_50', 'Снайпер', 'combat', 'kills', '{"headshot": true, "count": 50}', '50 убийств в голову'),
('ach_shotgun_close_25', 'В упор', 'combat', 'kills', '{"weapon_category": "shotgun", "distance": "close", "count": 25}', '25 убийств из дробовика в упор'),
-- Выживание
('ach_no_damage_heist', 'Неприкасаемый', 'survival', 'heists', '{"no_damage": true, "count": 1}', 'Завершить ограбление без урона'),
('ach_survive_low_hp', 'На волоске', 'survival', 'special', '{"hp_below": 10, "survive": true, "count": 10}', '10 раз выжить с HP ниже 10'),
-- Стелс
('ach_stealth_heist_5', 'Призрак', 'stealth', 'heists', '{"stealth": true, "count": 5}', '5 ограблений без тревоги'),
('ach_silent_kills_30', 'Тихий убийца', 'stealth', 'kills', '{"silent": true, "count": 30}', '30 тихих убийств'),
-- Социальные
('ach_coop_heists_20', 'Командный игрок', 'social', 'heists', '{"coop": true, "count": 20}', '20 кооп-ограблений'),
('ach_revive_allies_15', 'Спасатель', 'social', 'special', '{"revive": true, "count": 15}', 'Поднять союзников 15 раз');
```

### 6.5. combat_unlock_requirements — Боевая прогрессия (оружие и скиллы)

```sql
INSERT INTO combat_unlock_requirements (item_type, item_id, unlock_type, unlock_id, quantity) VALUES
-- === ОРУЖИЕ ===
-- Стартовое (бесплатно в пуле)
-- pistol_persuader, melee_stinger — даются сразу

-- Через трофеи
('weapon', 'melee_kneecapper', 'trophy', 'trophy_baton_grip', 5),           -- Бита: 5 рукоятей дубинки
('weapon', 'melee_conversation_starter', 'trophy', 'trophy_guard_badge', 10), -- Кастет: 10 жетонов
('weapon', 'melee_silent_partner', 'trophy', 'trophy_armor_fragment', 3),   -- Лом: 3 фрагмента брони
('weapon', 'smg_chicago_typewriter', 'trophy', 'trophy_radio_chip', 15),    -- Томпсон: 15 чипов рации
('weapon', 'shotgun_street_sweeper', 'trophy', 'trophy_patrol_insignia', 5), -- Помповый: 5 знаков патруля
('weapon', 'pistol_diplomat', 'trophy', 'trophy_tactical_lens', 3),         -- Маузер: 3 линзы
('weapon', 'smg_plumber', 'trophy', 'trophy_armor_fragment', 8),            -- STEN: 8 фрагментов
('weapon', 'rifle_widowmaker', 'trophy', 'trophy_tactical_lens', 5),        -- Мосинка: 5 линз
('weapon', 'pistol_scalpel', 'trophy', 'trophy_specops_dog_tag', 2),        -- Люгер: 2 жетона спецназа
('weapon', 'smg_zipper', 'trophy', 'trophy_specops_dog_tag', 3),            -- MP40: 3 жетона спецназа
('weapon', 'shotgun_argument_ender', 'trophy', 'trophy_elite_comm', 2),     -- Обрез: 2 коммуникатора
('weapon', 'rifle_messenger', 'trophy', 'trophy_elite_comm', 4),            -- M1 Garand: 4 коммуникатора

-- Через достижения
('weapon', 'special_flamethrower', 'achievement', 'ach_knife_kills_50', 1), -- Огнемёт: за "Мастер клинка"
('weapon', 'special_grenade_launcher', 'achievement', 'ach_headshots_50', 1), -- Гранатомёт: за "Снайпер"

-- === АКТИВНЫЕ СКИЛЛЫ ===
-- Стартовые: skill_dash, skill_medkit — даются сразу

('skill', 'skill_smoke', 'trophy', 'trophy_guard_badge', 3),               -- Дым: 3 жетона
('skill', 'skill_flashbang', 'trophy', 'trophy_radio_chip', 8),            -- Флешка: 8 чипов
('skill', 'skill_molotov', 'trophy', 'trophy_baton_grip', 10),             -- Молотов: 10 рукоятей
('skill', 'skill_gas_grenade', 'trophy', 'trophy_patrol_insignia', 4),     -- Газ: 4 знака патруля
('skill', 'skill_sticky_bomb', 'trophy', 'trophy_armor_fragment', 6),      -- Липучка: 6 фрагментов
('skill', 'skill_turret', 'trophy', 'trophy_tactical_lens', 4),            -- Турель: 4 линзы
('skill', 'skill_cryo', 'trophy', 'trophy_specops_dog_tag', 3),            -- Крио: 3 жетона спецназа
('skill', 'skill_adrenaline', 'trophy', 'trophy_patrol_insignia', 6),      -- Адреналин: 6 знаков
('skill', 'skill_shield', 'trophy', 'trophy_armor_fragment', 10),          -- Щит: 10 фрагментов
('skill', 'skill_grapple', 'trophy', 'trophy_elite_comm', 3),              -- Крюк: 3 коммуникатора
('skill', 'skill_berserk', 'achievement', 'ach_survive_low_hp', 1),        -- Берсерк: за "На волоске"
('skill', 'skill_bullet_time', 'achievement', 'ach_headshots_50', 1),      -- Bullet time: за "Снайпер"

-- === ПАССИВНЫЕ СКИЛЛЫ ===
('skill', 'perk_pistol_master', 'trophy', 'trophy_guard_badge', 5),
('skill', 'perk_smg_master', 'trophy', 'trophy_radio_chip', 10),
('skill', 'perk_shotgun_master', 'trophy', 'trophy_patrol_insignia', 3),
('skill', 'perk_melee_master', 'trophy', 'trophy_baton_grip', 8),
('skill', 'perk_sharpshooter', 'trophy', 'trophy_tactical_lens', 2),
('skill', 'perk_bleeder', 'achievement', 'ach_knife_kills_50', 1),
('skill', 'perk_sniper', 'achievement', 'ach_headshots_50', 1),
('skill', 'perk_tough', 'trophy', 'trophy_armor_fragment', 5),
('skill', 'perk_regeneration', 'trophy', 'trophy_guard_badge', 15),
('skill', 'perk_second_wind', 'achievement', 'ach_survive_low_hp', 1),
('skill', 'perk_shadow', 'achievement', 'ach_stealth_heist_5', 1),
('skill', 'perk_aggressor', 'trophy', 'trophy_specops_dog_tag', 4),
('skill', 'perk_greed', 'trophy', 'trophy_guard_badge', 8),
('skill', 'perk_squad_leader', 'achievement', 'ach_coop_heists_20', 1),
('skill', 'perk_rescuer', 'achievement', 'ach_revive_allies_15', 1);
```

---

---

## 7. Соглашения

1. **Именование:** snake_case для таблиц и полей
2. **ID:** BIGSERIAL для автоинкремента, BIGINT для FK
3. **Timestamp:** Всегда UTC, тип TIMESTAMP (без timezone)
4. **Валюта:** BIGINT (избегаем проблем с точностью)
5. **JSON:** JSONB для гибких данных (inventory.data_json)
6. **Soft delete:** Не используем — данные удаляются каскадно
7. **Индексы:** На все FK и часто используемые фильтры
