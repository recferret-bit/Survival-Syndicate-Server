-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "password_hash" TEXT NOT NULL,
    "bearer_token_hash" TEXT,
    "currency_iso_code" TEXT NOT NULL,
    "language_iso_code" TEXT NOT NULL,
    "country" TEXT,
    "is_test" BOOLEAN NOT NULL DEFAULT false,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
