import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal, boolean, index, foreignKey } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─────────────────────────────────────────────
// MEMORIES TABLE
// ─────────────────────────────────────────────
export const memories = mysqlTable(
  "memories",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    content: text("content").notNull(),
    source: varchar("source", { length: 64 }).notNull(), // 'upload', 'gmail', 'drive', 'github', 'facebook', 'instagram', 'whatsapp', 'botspace', 'browser'
    sourceId: varchar("sourceId", { length: 255 }), // External ID from the source
    embedding: text("embedding"), // Serialized vector embedding for semantic search
    metadata: json("metadata"), // Flexible metadata (author, url, platform, etc.)
    tags: json("tags"), // Array of tags for categorization
    emotionalTheme: varchar("emotionalTheme", { length: 64 }), // wonder, joy, fear, love, etc.
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
    sourceIdx: index("source_idx").on(table.source),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

export type Memory = typeof memories.$inferSelect;
export type InsertMemory = typeof memories.$inferInsert;

// ─────────────────────────────────────────────
// INTEGRATIONS TABLE
// ─────────────────────────────────────────────
export const integrations = mysqlTable(
  "integrations",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    service: varchar("service", { length: 64 }).notNull(), // 'google', 'github', 'outlook', 'facebook', 'instagram', 'whatsapp', 'botspace'
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    expiresAt: timestamp("expiresAt"),
    scopes: json("scopes"), // Array of granted scopes
    isActive: boolean("isActive").default(true).notNull(),
    lastSyncAt: timestamp("lastSyncAt"),
    syncStatus: varchar("syncStatus", { length: 64 }).default("idle"), // 'idle', 'syncing', 'error'
    syncError: text("syncError"),
    metadata: json("metadata"), // Service-specific metadata
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
    serviceIdx: index("service_idx").on(table.service),
  })
);

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

// ─────────────────────────────────────────────
// NOTIFICATIONS TABLE
// ─────────────────────────────────────────────
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    type: varchar("type", { length: 64 }).notNull(), // 'new_memory', 'sync_complete', 'insight', 'error'
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content"),
    relatedMemoryId: int("relatedMemoryId"),
    isRead: boolean("isRead").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ─────────────────────────────────────────────
// ANALYTICS TABLE
// ─────────────────────────────────────────────
export const analytics = mysqlTable(
  "analytics",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    date: timestamp("date").notNull(),
    totalMemories: int("totalMemories").default(0),
    sourceDistribution: json("sourceDistribution"), // { 'gmail': 5, 'drive': 3, ... }
    emotionalThemes: json("emotionalThemes"), // { 'wonder': 10, 'joy': 5, ... }
    interactionCount: int("interactionCount").default(0),
    searchCount: int("searchCount").default(0),
    averageMemoryLength: decimal("averageMemoryLength", { precision: 10, scale: 2 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
    dateIdx: index("date_idx").on(table.date),
  })
);

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = typeof analytics.$inferInsert;

// ─────────────────────────────────────────────
// BROWSER SESSIONS TABLE
// ─────────────────────────────────────────────
export const browserSessions = mysqlTable(
  "browserSessions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    sessionData: json("sessionData"), // Browser history, tabs, bookmarks
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
  })
);

export type BrowserSession = typeof browserSessions.$inferSelect;
export type InsertBrowserSession = typeof browserSessions.$inferInsert;

// ─────────────────────────────────────────────
// SYNC LOG TABLE (for tracking sync operations)
// ─────────────────────────────────────────────
export const syncLogs = mysqlTable(
  "syncLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    service: varchar("service", { length: 64 }).notNull(),
    status: varchar("status", { length: 64 }).notNull(), // 'success', 'error', 'partial'
    itemsProcessed: int("itemsProcessed").default(0),
    itemsCreated: int("itemsCreated").default(0),
    itemsUpdated: int("itemsUpdated").default(0),
    error: text("error"),
    startedAt: timestamp("startedAt").notNull(),
    completedAt: timestamp("completedAt"),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
    serviceIdx: index("service_idx").on(table.service),
  })
);

export type SyncLog = typeof syncLogs.$inferSelect;
export type InsertSyncLog = typeof syncLogs.$inferInsert;