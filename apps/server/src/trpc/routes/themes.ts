import { createRateLimiterMiddleware, privateProcedure, router } from '../trpc';
import { themePropertiesSchema, defaultThemeProperties } from '@zero/db/theme_properties';
import { Ratelimit } from '@upstash/ratelimit';
import { theme, connection } from '@zero/db/schema';
import { TRPCError } from '@trpc/server';
import { and, eq, desc } from 'drizzle-orm';
import { z } from 'zod';

export const themesRouter = router({
  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        properties: themePropertiesSchema,
        isPublic: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const timestamp = new Date();
      const id = crypto.randomUUID();

      await db.insert(theme).values({
        id,
        name: input.name,
        description: input.description || '',
        userId: session.user.id,
        isPublic: input.isPublic,
        properties: input.properties,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      return { id };
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        properties: themePropertiesSchema.optional(),
        isPublic: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const timestamp = new Date();

      const existingTheme = await db.query.theme.findFirst({
        where: and(eq(theme.id, input.id), eq(theme.userId, session.user.id)),
      });

      if (!existingTheme) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme not found',
        });
      }

      await db
        .update(theme)
        .set({
          name: input.name ?? existingTheme.name,
          description: input.description ?? existingTheme.description,
          properties: input.properties ?? existingTheme.properties,
          isPublic: input.isPublic ?? existingTheme.isPublic,
          updatedAt: timestamp,
        })
        .where(and(eq(theme.id, input.id), eq(theme.userId, session.user.id)));

      return { success: true };
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      // Check if theme exists and belongs to user
      const existingTheme = await db.query.theme.findFirst({
        where: and(eq(theme.id, input.id), eq(theme.userId, session.user.id)),
      });

      if (!existingTheme) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme not found',
        });
      }

      // Remove theme association from connections
      await db
        .update(connection)
        .set({ themeId: null })
        .where(eq(connection.themeId, input.id));

      // Delete the theme
      await db
        .delete(theme)
        .where(and(eq(theme.id, input.id), eq(theme.userId, session.user.id)));

      return { success: true };
    }),

  list: privateProcedure
    .use(
      createRateLimiterMiddleware({
        limiter: Ratelimit.slidingWindow(60, '1m'),
        generatePrefix: ({ session }) => `ratelimit:list-themes-${session?.user.id}`,
      }),
    )
    .query(async ({ ctx }) => {
      const { db, session } = ctx;
      const themes = await db
        .select()
        .from(theme)
        .where(eq(theme.userId, session.user.id))
        .orderBy(desc(theme.updatedAt));

      return themes;
    }),

  get: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const themeData = await db.query.theme.findFirst({
        where: and(eq(theme.id, input.id), eq(theme.userId, session.user.id)),
      });

      if (!themeData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme not found',
        });
      }

      return themeData;
    }),

  getPublic: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const themeData = await db.query.theme.findFirst({
        where: and(eq(theme.id, input.id), eq(theme.isPublic, true)),
      });

      if (!themeData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Public theme not found',
        });
      }

      return themeData;
    }),

  listPublic: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { limit, cursor } = input;

      const themes = await db
        .select()
        .from(theme)
        .where(eq(theme.isPublic, true))
        .orderBy(desc(theme.updatedAt))
        .limit(limit + 1)
        .offset(cursor ? 1 : 0);

      let nextCursor: string | undefined = undefined;
      if (themes.length > limit) {
        const nextItem = themes.pop();
        nextCursor = nextItem?.id;
      }

      return {
        themes,
        nextCursor,
      };
    }),

  copy: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const timestamp = new Date();

      // Get the public theme
      const publicTheme = await db.query.theme.findFirst({
        where: and(eq(theme.id, input.id), eq(theme.isPublic, true)),
      });

      if (!publicTheme) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Public theme not found',
        });
      }

      // Create a copy for the user
      const id = crypto.randomUUID();
      await db.insert(theme).values({
        id,
        name: `${publicTheme.name} (Copy)`,
        description: publicTheme.description,
        userId: session.user.id,
        isPublic: false,
        properties: publicTheme.properties,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      return { id };
    }),

  getDefault: privateProcedure.query(async () => {
    return {
      light: defaultThemeProperties,
    };
  }),
});