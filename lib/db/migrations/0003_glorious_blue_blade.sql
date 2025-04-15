ALTER TABLE "User" ADD COLUMN "reset_password_otp" varchar(6);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "reset_password_otp_expires" timestamp;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_email_unique" UNIQUE("email");