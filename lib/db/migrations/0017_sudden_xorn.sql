CREATE TABLE IF NOT EXISTS "BkashAuthToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
