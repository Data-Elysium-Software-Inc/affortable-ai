ALTER TABLE "User" ADD COLUMN "referral_coupon" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_referral_coupon_unique" UNIQUE("referral_coupon");