-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "upgraded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upgrades" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "from_level" INTEGER NOT NULL,
    "to_level" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upgrades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buildings_character_id_building_id_key" ON "buildings"("character_id", "building_id");
