PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_activity` (
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
	`is_imported` integer DEFAULT false NOT NULL,
	`imported_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_activity`("id", "start_time", "end_time", "duration", "distance", "calories", "avg_pace", "avg_speed", "steps", "goal", "type", "status", "is_imported", "imported_at", "created_at", "updated_at") SELECT "id", "start_time", "end_time", "duration", "distance", "calories", "avg_pace", "avg_speed", "steps", "goal", "type", "status", "is_imported", "imported_at", "created_at", "updated_at" FROM `activity`;--> statement-breakpoint
DROP TABLE `activity`;--> statement-breakpoint
ALTER TABLE `__new_activity` RENAME TO `activity`;--> statement-breakpoint
PRAGMA foreign_keys=ON;