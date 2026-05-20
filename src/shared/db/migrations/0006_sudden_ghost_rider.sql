CREATE TABLE `schedule` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`time` text NOT NULL,
	`goal` real NOT NULL,
	`type` text NOT NULL,
	`repeat_type` text NOT NULL,
	`repeat_days` text DEFAULT '[]',
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
