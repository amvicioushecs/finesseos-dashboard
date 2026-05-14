CREATE TABLE "action_feed" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"brand_name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"destination" text NOT NULL,
	"platform" varchar(64) NOT NULL,
	"category" varchar(128) NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"clicks" varchar(32) DEFAULT '0' NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"tracking_id" varchar(16),
	"earnings" varchar(32) DEFAULT '$0' NOT NULL,
	"commission" varchar(128) DEFAULT 'TBD' NOT NULL,
	"compliance_disclosure" text,
	"compliance_rules" jsonb DEFAULT '[]'::jsonb,
	"compliance_status" text DEFAULT 'passed' NOT NULL,
	"compliance_ftc_notes" text,
	"keyword_research" jsonb DEFAULT '[]'::jsonb,
	"marketing_angle" text,
	"personas" jsonb DEFAULT '[]'::jsonb,
	"content_suggestions" jsonb DEFAULT '[]'::jsonb,
	"target_platforms" jsonb DEFAULT '[]'::jsonb,
	"strategy_notes" text,
	"brand_logo_url" text,
	"brand_icon_url" text,
	"brand_primary_color" varchar(16),
	"brand_colors" jsonb DEFAULT '[]'::jsonb,
	"brand_description" text,
	"brand_industry" varchar(128),
	"brand_domain" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_nodes_tracking_id_unique" UNIQUE("tracking_id")
);
--> statement-breakpoint
CREATE TABLE "node_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"filename" varchar(512) NOT NULL,
	"original_name" varchar(512) NOT NULL,
	"mime_type" varchar(128) NOT NULL,
	"file_size" integer NOT NULL,
	"s3_key" varchar(1024) NOT NULL,
	"url" text NOT NULL,
	"asset_type" text DEFAULT 'other' NOT NULL,
	"label" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(64) NOT NULL,
	"value" text NOT NULL,
	"unit" varchar(16),
	"category" varchar(32) DEFAULT 'general',
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_metrics_user_id_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
CREATE TABLE "user_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"integration_id" varchar(64) NOT NULL,
	"status" text DEFAULT 'disconnected' NOT NULL,
	"api_key" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"last_sync_at" timestamp,
	"metrics" jsonb DEFAULT '[]'::jsonb,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"open_id" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"login_method" varchar(64),
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_signed_in" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_open_id_unique" UNIQUE("open_id")
);
--> statement-breakpoint
ALTER TABLE "action_feed" ADD CONSTRAINT "action_feed_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_nodes" ADD CONSTRAINT "affiliate_nodes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_assets" ADD CONSTRAINT "node_assets_node_id_affiliate_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."affiliate_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_assets" ADD CONSTRAINT "node_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_metrics" ADD CONSTRAINT "system_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_integrations" ADD CONSTRAINT "user_integrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;