ALTER TABLE "User" ALTER COLUMN "api_balance_cents" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "api_balance_cents" SET DEFAULT '100.0';