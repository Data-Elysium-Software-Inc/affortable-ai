CREATE TABLE IF NOT EXISTS "Coupon" (
	"code" varchar(255) PRIMARY KEY NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"max_limit" integer NOT NULL,
	"times_used" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CouponRedemption" (
	"user_id" uuid NOT NULL,
	"code" varchar(255) NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "CouponRedemption_user_id_code_pk" PRIMARY KEY("user_id","code")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_code_Coupon_code_fk" FOREIGN KEY ("code") REFERENCES "public"."Coupon"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
