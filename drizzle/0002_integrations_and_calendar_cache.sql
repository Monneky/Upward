CREATE TABLE `calendar_events_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`integration_id` integer NOT NULL,
	`event_id` text NOT NULL,
	`title` text NOT NULL,
	`start_at` text NOT NULL,
	`end_at` text NOT NULL,
	`synced_at` text NOT NULL,
	FOREIGN KEY (`integration_id`) REFERENCES `integrations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`encrypted_tokens` text NOT NULL,
	`last_sync_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
