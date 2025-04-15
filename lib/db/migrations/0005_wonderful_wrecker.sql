CREATE TABLE IF NOT EXISTS "TemporaryUser" (
	"email" varchar(64) PRIMARY KEY NOT NULL,
	"otp" varchar(6) NOT NULL,
	"otp_expires" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
