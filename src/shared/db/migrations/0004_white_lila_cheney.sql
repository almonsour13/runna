PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`duration` integer NOT NULL,
	`distance` real NOT NULL,
	`calories` real NOT NULL,
	`avg_pace` real NOT NULL,
	`avg_speed` real NOT NULL,
	`goal` integer NOT NULL,
	`type` text NOT NULL,
	`status` text NOT NULL,
	`is_imported` integer DEFAULT false NOT NULL,
	`imported_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_activity`("id", "start_time", "end_time", "duration", "distance", "calories", "avg_pace", "avg_speed", "goal", "type", "status", "is_imported", "imported_at", "created_at", "updated_at") SELECT "id", "start_time", "end_time", "duration", "distance", "calories", "avg_pace", "avg_speed", "goal", "type", "status", "is_imported", "imported_at", "created_at", "updated_at" FROM `activity`;--> statement-breakpoint
DROP TABLE `activity`;--> statement-breakpoint
ALTER TABLE `__new_activity` RENAME TO `activity`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_coordinate` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` integer NOT NULL,
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
INSERT INTO `__new_coordinate`("id", "activity_id", "latitude", "longitude", "altitude", "accuracy", "speed", "heading", "timestamp") SELECT "id", "activity_id", "latitude", "longitude", "altitude", "accuracy", "speed", "heading", "timestamp" FROM `coordinate`;--> statement-breakpoint
DROP TABLE `coordinate`;--> statement-breakpoint
ALTER TABLE `__new_coordinate` RENAME TO `coordinate`;