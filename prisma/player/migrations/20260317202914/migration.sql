-- CreateTable
CREATE TABLE "players" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "username" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_user_id_key" ON "players"("user_id");
