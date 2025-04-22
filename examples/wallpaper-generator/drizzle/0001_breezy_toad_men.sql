DROP INDEX IF EXISTS `replicateJobId`;--> statement-breakpoint
ALTER TABLE `generations` ADD `result` text;--> statement-breakpoint
ALTER TABLE `generations` DROP COLUMN `status`;