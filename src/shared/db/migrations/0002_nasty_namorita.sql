PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_activity` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_activity`("id", "start_time", "end_time", "duration", "distance", "calories", "avg_pace", "avg_speed", "goal", "type", "status", "created_at", "updated_at") SELECT "id", "start_time", "end_time", "duration", "distance", "calories", "avg_pace", "avg_speed", "goal", "type", "status", "created_at", "updated_at" FROM `activity`;--> statement-breakpoint
DROP TABLE `activity`;--> statement-breakpoint
ALTER TABLE `__new_activity` RENAME TO `activity`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `coordinate` ADD `timestamp` integer NOT NULL;