import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  getMemoriesByUser,
  getMemoriesBySource,
  createMemory,
  deleteMemory,
  getIntegrationsByUser,
  getIntegrationByService,
  upsertIntegration,
  getNotificationsByUser,
  createNotification,
  getAnalyticsByUser,
  createAnalytics,
  getSyncLogsByUser,
  createSyncLog,
} from "./db";

// ─────────────────────────────────────────────────────────────────────
// VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────────────────────
const memoryInputSchema = z.object({
  content: z.string().min(1),
  source: z.string().min(1),
  sourceId: z.string().optional(),
  metadata: z.any().optional(),
  tags: z.any().optional(),
  emotionalTheme: z.string().optional(),
});

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

// ─────────────────────────────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─────────────────────────────────────────────────────────────────────
  // MEMORIES ROUTER
  // ─────────────────────────────────────────────────────────────────────
  memories: router({
    list: publicProcedure
      .input(paginationSchema)
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return [];
        return getMemoriesByUser(ctx.user.id, input.limit, input.offset);
      }),

    bySource: publicProcedure
      .input(
        z.object({
          source: z.string(),
          limit: z.number().int().min(1).max(100).default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return [];
        return getMemoriesBySource(ctx.user.id, input.source, input.limit);
      }),

    create: publicProcedure
      .input(memoryInputSchema)
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createMemory({
          userId: ctx.user.id,
          content: input.content,
          source: input.source,
          sourceId: input.sourceId,
          metadata: input.metadata as any,
          tags: input.tags as any,
          emotionalTheme: input.emotionalTheme,
        });
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return deleteMemory(input.id, ctx.user.id);
      }),
  }),

  // ─────────────────────────────────────────────────────────────────────
  // INTEGRATIONS ROUTER
  // ─────────────────────────────────────────────────────────────────────
  integrations: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return getIntegrationsByUser(ctx.user.id);
    }),

    getByService: publicProcedure
      .input(z.object({ service: z.string() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return null;
        return getIntegrationByService(ctx.user.id, input.service);
      }),

    upsert: publicProcedure
      .input(
        z.object({
          service: z.string(),
          accessToken: z.string().optional(),
          refreshToken: z.string().optional(),
          expiresAt: z.date().optional(),
          scopes: z.any().optional(),
          isActive: z.boolean().optional(),
          metadata: z.any().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return upsertIntegration({
          userId: ctx.user.id,
          service: input.service,
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          expiresAt: input.expiresAt,
          scopes: input.scopes as any,
          isActive: input.isActive,
          metadata: input.metadata as any,
        });
      }),
  }),

  // ─────────────────────────────────────────────────────────────────────
  // NOTIFICATIONS ROUTER
  // ─────────────────────────────────────────────────────────────────────
  notifications: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).default(20) }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return [];
        return getNotificationsByUser(ctx.user.id, input.limit);
      }),

    create: publicProcedure
      .input(
        z.object({
          type: z.string(),
          title: z.string(),
          content: z.string().optional(),
          relatedMemoryId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createNotification({
          userId: ctx.user.id,
          type: input.type,
          title: input.title,
          content: input.content,
          relatedMemoryId: input.relatedMemoryId,
        });
      }),
  }),

  // ─────────────────────────────────────────────────────────────────────
  // ANALYTICS ROUTER
  // ─────────────────────────────────────────────────────────────────────
  analytics: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return getAnalyticsByUser(ctx.user.id);
    }),

    create: publicProcedure
      .input(
        z.object({
          date: z.date(),
          totalMemories: z.number().int().optional(),
          sourceDistribution: z.any().optional(),
          emotionalThemes: z.any().optional(),
          interactionCount: z.number().int().optional(),
          searchCount: z.number().int().optional(),
          averageMemoryLength: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createAnalytics({
          userId: ctx.user.id,
          date: input.date,
          totalMemories: input.totalMemories || 0,
          sourceDistribution: input.sourceDistribution as any,
          emotionalThemes: input.emotionalThemes as any,
          interactionCount: input.interactionCount || 0,
          searchCount: input.searchCount || 0,
          averageMemoryLength: input.averageMemoryLength ? String(input.averageMemoryLength) : undefined,
        });
      }),
  }),

  // ─────────────────────────────────────────────────────────────────────
  // SYNC LOGS ROUTER
  // ─────────────────────────────────────────────────────────────────────
  syncLogs: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return [];
        return getSyncLogsByUser(ctx.user.id, input.limit);
      }),

    create: publicProcedure
      .input(
        z.object({
          service: z.string(),
          status: z.string(),
          itemsProcessed: z.number().int().optional(),
          itemsCreated: z.number().int().optional(),
          itemsUpdated: z.number().int().optional(),
          error: z.string().optional(),
          startedAt: z.date(),
          completedAt: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createSyncLog({
          userId: ctx.user.id,
          service: input.service,
          status: input.status,
          itemsProcessed: input.itemsProcessed || 0,
          itemsCreated: input.itemsCreated || 0,
          itemsUpdated: input.itemsUpdated || 0,
          error: input.error,
          startedAt: input.startedAt,
          completedAt: input.completedAt,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
