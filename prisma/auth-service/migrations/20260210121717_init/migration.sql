-- CreateEnum
CREATE TYPE "BanReason" AS ENUM ('fraud', 'terms_violation', 'suspicious_activity', 'manual', 'other');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "user" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "bearer_token_hash" TEXT,
    "name" TEXT,
    "is_test" BOOLEAN NOT NULL DEFAULT false,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "ban_reason" "BanReason",
    "ban_comment" TEXT,
    "ban_time" TIMESTAMP(3),
    "country" TEXT,
    "language_iso_code" TEXT NOT NULL,
    "currency_iso_code" TEXT NOT NULL,
    "birthday" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking" (
    "id" SERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "first_ip" TEXT NOT NULL,
    "last_ip" TEXT NOT NULL,
    "ga_client_id" TEXT,
    "ya_client_id" TEXT,
    "click_id" TEXT,
    "utm_medium" TEXT,
    "utm_source" TEXT,
    "utm_campaign" TEXT,
    "pid" TEXT,
    "sub1" TEXT,
    "sub2" TEXT,
    "sub3" TEXT,

    CONSTRAINT "tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "status" "AdminStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "tracking_user_id_key" ON "tracking"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_api_key_key" ON "admin"("api_key");

-- AddForeignKey
ALTER TABLE "tracking" ADD CONSTRAINT "tracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
