ALTER TABLE "Chat" ADD COLUMN "total_cost" numeric(10, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "Message" ADD COLUMN "cost" numeric(10, 2) DEFAULT '0.05' NOT NULL;--> statement-breakpoint
ALTER TABLE "Message" ADD COLUMN "model_used" varchar(100) DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "Message" ADD COLUMN "input_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "Message" ADD COLUMN "output_tokens" integer DEFAULT 0 NOT NULL;