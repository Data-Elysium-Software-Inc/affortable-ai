CREATE TABLE IF NOT EXISTS "UserInterestLog" (
	"user_id" uuid NOT NULL,
	"model_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "UserInterestLog_user_id_model_id_created_at_pk" PRIMARY KEY("user_id","model_id","created_at")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserInterestLog" ADD CONSTRAINT "UserInterestLog_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
