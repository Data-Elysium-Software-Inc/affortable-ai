CREATE TABLE IF NOT EXISTS "Bkash" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"auth_token" varchar(255) NOT NULL,
	"status" varchar(255) NOT NULL,
	"transaction_id" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"user_mobile_number" integer NOT NULL
);
