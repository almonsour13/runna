PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_coordinate` (
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
INSERT INTO `__new_coordinate`("id", "activity_id", "latitude", "longitude", "altitude", "accuracy", "speed", "heading", "timestamp") SELECT "id", "activity_id", "latitude", "longitude", "altitude", "accuracy", "speed", "heading", "timestamp" FROM `coordinate`;--> statement-breakpoint
DROP TABLE `coordinate`;--> statement-breakpoint
ALTER TABLE `__new_coordinate` RENAME TO `coordinate`;--> statement-breakpoint
PRAGMA foreign_keys=ON;