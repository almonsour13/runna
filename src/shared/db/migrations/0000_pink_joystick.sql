CREATE TABLE `activity` (
	`id` text PRIMARY KEY NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`duration` integer DEFAULT 0 NOT NULL,
	`distance` real DEFAULT 0 NOT NULL,
	`calories` real DEFAULT 0 NOT NULL,
	`avg_pace` real DEFAULT 0 NOT NULL,
	`avg_speed` real DEFAULT 0 NOT NULL,
	`steps` integer DEFAULT 0 NOT NULL,
	`goal` integer DEFAULT 0 NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'inProgress' NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `coordinate` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`altitude` real,
	`accuracy` real,
	`speed` real,
	`heading` real,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `schedule` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`time` text NOT NULL,
	`goal` real NOT NULL,
	`type` text NOT NULL,
	`repeat_days` text DEFAULT '[]',
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
