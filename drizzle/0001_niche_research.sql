CREATE TABLE "niche_research" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"seed" varchar(255) NOT NULL,
	"niche_name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"monthly_search_volume" varchar(64) NOT NULL,
	"competition_level" varchar(32) NOT NULL,
	"competition_score" integer NOT NULL,
	"monetization_potential" varchar(32) NOT NULL,
	"buyer_intent" varchar(32) NOT NULL,
	"avg_spend" varchar(64),
	"golden_score" integer NOT NULL,
	"pain_points" jsonb DEFAULT '[]'::jsonb,
	"target_audience" text,
	"recommended_programs" jsonb DEFAULT '[]'::jsonb,
	"content_opportunities" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "niche_research_user_id_niche_name_unique" UNIQUE("user_id","niche_name")
);
--> statement-breakpoint
ALTER TABLE "niche_research" ADD CONSTRAINT "niche_research_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
