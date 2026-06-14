ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "suspended" boolean DEFAULT false NOT NULL;
