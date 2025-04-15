CREATE TABLE IF NOT EXISTS "referral" (
	"code" varchar(255) PRIMARY KEY NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"max_limit" integer NOT NULL,
	"times_used" integer DEFAULT 0 NOT NULL
);
