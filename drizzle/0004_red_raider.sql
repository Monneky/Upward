CREATE TABLE `routines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`emoji` text DEFAULT '🎯' NOT NULL,
	`days_of_week` text DEFAULT '[]' NOT NULL,
	`time` text,
	`description` text DEFAULT '' NOT NULL,
	`color` text DEFAULT '#6366f1' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
