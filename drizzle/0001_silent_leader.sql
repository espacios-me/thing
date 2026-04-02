CREATE TABLE `analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`totalMemories` int DEFAULT 0,
	`sourceDistribution` json,
	`emotionalThemes` json,
	`interactionCount` int DEFAULT 0,
	`searchCount` int DEFAULT 0,
	`averageMemoryLength` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `browserSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `browserSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`service` varchar(64) NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`expiresAt` timestamp,
	`scopes` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncAt` timestamp,
	`syncStatus` varchar(64) DEFAULT 'idle',
	`syncError` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`source` varchar(64) NOT NULL,
	`sourceId` varchar(255),
	`embedding` text,
	`metadata` json,
	`tags` json,
	`emotionalTheme` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`relatedMemoryId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `syncLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`service` varchar(64) NOT NULL,
	`status` varchar(64) NOT NULL,
	`itemsProcessed` int DEFAULT 0,
	`itemsCreated` int DEFAULT 0,
	`itemsUpdated` int DEFAULT 0,
	`error` text,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	CONSTRAINT `syncLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `analytics` (`userId`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `analytics` (`date`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `browserSessions` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `integrations` (`userId`);--> statement-breakpoint
CREATE INDEX `service_idx` ON `integrations` (`service`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `memories` (`userId`);--> statement-breakpoint
CREATE INDEX `source_idx` ON `memories` (`source`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `memories` (`createdAt`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `notifications` (`createdAt`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `syncLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `service_idx` ON `syncLogs` (`service`);