CREATE TYPE "public"."provider_type" AS ENUM('organisation', 'individual');--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "provider_type" "provider_type" DEFAULT 'organisation' NOT NULL;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "contact_phone" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "contact_title" text;