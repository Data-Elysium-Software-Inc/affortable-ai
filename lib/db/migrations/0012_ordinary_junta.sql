ALTER TABLE "User" ADD COLUMN "is_registration_complete" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "registration_type" varchar DEFAULT 'email' NOT NULL;