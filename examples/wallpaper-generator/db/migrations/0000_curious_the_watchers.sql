CREATE TABLE `generations` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`prompt` text NOT NULL,
	`status` text,
	`timestamp` text,
	`updated_at` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `replicateJobId` ON `generations` (`status`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`replicateKey` text,
	`timestamp` text,
	`updated_at` text
);
