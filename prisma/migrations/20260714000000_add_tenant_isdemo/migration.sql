-- Kolom demo di Tenant (untuk sistem demo reset-harian).
ALTER TABLE "Tenant" ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false;

-- Tandai tenant demo bawaan (dari seed) sebagai tenant demo bersama.
UPDATE "Tenant" SET "isDemo" = true WHERE "slug" = 'billiard-jaya';
