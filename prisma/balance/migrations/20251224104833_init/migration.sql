-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('fiat', 'bonus', 'crypto');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('add', 'subtract');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('hold', 'refund', 'completed', 'failed', 'pending');

-- CreateEnum
CREATE TYPE "LedgerReason" AS ENUM ('payments_deposit', 'payments_withdrawal', 'payments_refund', 'admin_correction', 'games_bet', 'games_win', 'games_refund', 'bonus_wager', 'bonus_free_spin', 'bonus_claim');

-- CreateTable
CREATE TABLE "fiat_balance_ledger" (
    "id" UUID NOT NULL,
    "user_id" BIGINT NOT NULL,
    "operation_id" TEXT NOT NULL,
    "currency_type" "CurrencyType" NOT NULL DEFAULT 'fiat',
    "amount" BIGINT NOT NULL,
    "operation_type" "OperationType" NOT NULL,
    "operation_status" "OperationStatus" NOT NULL,
    "reason" "LedgerReason" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fiat_balance_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonus_balance_ledger" (
    "id" UUID NOT NULL,
    "user_id" BIGINT NOT NULL,
    "operation_id" TEXT NOT NULL,
    "currency_type" "CurrencyType" NOT NULL DEFAULT 'bonus',
    "amount" BIGINT NOT NULL,
    "operation_type" "OperationType" NOT NULL,
    "operation_status" "OperationStatus" NOT NULL,
    "reason" "LedgerReason" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bonus_balance_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_balance_ledger" (
    "id" UUID NOT NULL,
    "user_id" BIGINT NOT NULL,
    "operation_id" TEXT NOT NULL,
    "currency_type" "CurrencyType" NOT NULL DEFAULT 'crypto',
    "amount" BIGINT NOT NULL,
    "operation_type" "OperationType" NOT NULL,
    "operation_status" "OperationStatus" NOT NULL,
    "reason" "LedgerReason" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crypto_balance_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiat_balance_result" (
    "id" UUID NOT NULL,
    "user_id" BIGINT NOT NULL,
    "balance" BIGINT NOT NULL,
    "currency_iso_code" TEXT NOT NULL,
    "last_calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_ledger_id" UUID,

    CONSTRAINT "fiat_balance_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonus_balance_result" (
    "id" UUID NOT NULL,
    "user_id" BIGINT NOT NULL,
    "balance" BIGINT NOT NULL,
    "currency_iso_code" TEXT NOT NULL,
    "last_calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_ledger_id" UUID,

    CONSTRAINT "bonus_balance_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_balance_result" (
    "id" UUID NOT NULL,
    "user_id" BIGINT NOT NULL,
    "balance" BIGINT NOT NULL,
    "currency_iso_code" TEXT NOT NULL,
    "last_calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_ledger_id" UUID,

    CONSTRAINT "crypto_balance_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_balance" (
    "id" UUID NOT NULL,
    "user_id" BIGINT NOT NULL,
    "fiat_balance_id" UUID NOT NULL,
    "bonus_balance_id" UUID NOT NULL,
    "crypto_balance_id" UUID NOT NULL,

    CONSTRAINT "user_balance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fiat_balance_ledger_user_id_idx" ON "fiat_balance_ledger"("user_id");

-- CreateIndex
CREATE INDEX "fiat_balance_ledger_operation_id_idx" ON "fiat_balance_ledger"("operation_id");

-- CreateIndex
CREATE INDEX "fiat_balance_ledger_created_at_idx" ON "fiat_balance_ledger"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "fiat_balance_ledger_user_id_operation_id_key" ON "fiat_balance_ledger"("user_id", "operation_id");

-- CreateIndex
CREATE INDEX "bonus_balance_ledger_user_id_idx" ON "bonus_balance_ledger"("user_id");

-- CreateIndex
CREATE INDEX "bonus_balance_ledger_operation_id_idx" ON "bonus_balance_ledger"("operation_id");

-- CreateIndex
CREATE INDEX "bonus_balance_ledger_created_at_idx" ON "bonus_balance_ledger"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "bonus_balance_ledger_user_id_operation_id_key" ON "bonus_balance_ledger"("user_id", "operation_id");

-- CreateIndex
CREATE INDEX "crypto_balance_ledger_user_id_idx" ON "crypto_balance_ledger"("user_id");

-- CreateIndex
CREATE INDEX "crypto_balance_ledger_operation_id_idx" ON "crypto_balance_ledger"("operation_id");

-- CreateIndex
CREATE INDEX "crypto_balance_ledger_created_at_idx" ON "crypto_balance_ledger"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_balance_ledger_user_id_operation_id_key" ON "crypto_balance_ledger"("user_id", "operation_id");

-- CreateIndex
CREATE UNIQUE INDEX "fiat_balance_result_user_id_key" ON "fiat_balance_result"("user_id");

-- CreateIndex
CREATE INDEX "fiat_balance_result_user_id_idx" ON "fiat_balance_result"("user_id");

-- CreateIndex
CREATE INDEX "fiat_balance_result_currency_iso_code_idx" ON "fiat_balance_result"("currency_iso_code");

-- CreateIndex
CREATE UNIQUE INDEX "bonus_balance_result_user_id_key" ON "bonus_balance_result"("user_id");

-- CreateIndex
CREATE INDEX "bonus_balance_result_user_id_idx" ON "bonus_balance_result"("user_id");

-- CreateIndex
CREATE INDEX "bonus_balance_result_currency_iso_code_idx" ON "bonus_balance_result"("currency_iso_code");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_balance_result_user_id_key" ON "crypto_balance_result"("user_id");

-- CreateIndex
CREATE INDEX "crypto_balance_result_user_id_idx" ON "crypto_balance_result"("user_id");

-- CreateIndex
CREATE INDEX "crypto_balance_result_currency_iso_code_idx" ON "crypto_balance_result"("currency_iso_code");

-- CreateIndex
CREATE UNIQUE INDEX "user_balance_user_id_key" ON "user_balance"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_balance_fiat_balance_id_key" ON "user_balance"("fiat_balance_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_balance_bonus_balance_id_key" ON "user_balance"("bonus_balance_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_balance_crypto_balance_id_key" ON "user_balance"("crypto_balance_id");

-- CreateIndex
CREATE INDEX "user_balance_user_id_idx" ON "user_balance"("user_id");

-- AddForeignKey
ALTER TABLE "user_balance" ADD CONSTRAINT "user_balance_fiat_balance_id_fkey" FOREIGN KEY ("fiat_balance_id") REFERENCES "fiat_balance_result"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_balance" ADD CONSTRAINT "user_balance_bonus_balance_id_fkey" FOREIGN KEY ("bonus_balance_id") REFERENCES "bonus_balance_result"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_balance" ADD CONSTRAINT "user_balance_crypto_balance_id_fkey" FOREIGN KEY ("crypto_balance_id") REFERENCES "crypto_balance_result"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
