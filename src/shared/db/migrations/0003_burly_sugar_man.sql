ALTER TABLE `activity` ADD `is_imported` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `activity` ADD `imported_at` integer;