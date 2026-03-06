CREATE TABLE `goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`target` integer NOT NULL,
	`unit` text NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`deadline` text,
	`notes` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `habits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`completed_days` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
