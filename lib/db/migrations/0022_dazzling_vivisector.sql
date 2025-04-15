ALTER TABLE "CouponRedemption" DROP CONSTRAINT "CouponRedemption_code_Coupon_code_fk";
--> statement-breakpoint
ALTER TABLE "CouponRedemption" ALTER COLUMN "code" SET DEFAULT '';