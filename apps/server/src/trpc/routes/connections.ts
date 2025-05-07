import { createRateLimiterMiddleware, privateProcedure, router } from '../trpc';
import { connection, user as user_, theme } from '@zero/db/schema';
import { Ratelimit } from '@upstash/ratelimit';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const connectionsRouter = router({
  list: privateProcedure
    .use(
      createRateLimiterMiddleware({
        limiter: Ratelimit.slidingWindow(60, '1m'),
        generatePrefix: ({ session }) => `ratelimit:get-connections-${session?.user.id}`,
      }),
    )
    .query(async ({ ctx }) => {
      const { db, session } = ctx;
      const connections = await db
        .select({
          id: connection.id,
          email: connection.email,
          name: connection.name,
          picture: connection.picture,
          createdAt: connection.createdAt,
          themeId: connection.themeId,
        })
        .from(connection)
        .where(eq(connection.userId, session.user.id));

      return { connections };
    }),
  setDefault: privateProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { connectionId } = input;
      const { db } = ctx;
      const user = ctx.session.user;
      const foundConnection = await db.query.connection.findFirst({
        where: and(eq(connection.id, connectionId), eq(connection.userId, user.id)),
      });
      if (!foundConnection) throw new TRPCError({ code: 'NOT_FOUND' });
      await db
        .update(user_)
        .set({ defaultConnectionId: connectionId })
        .where(eq(user_.id, user.id));
    }),
  delete: privateProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { connectionId } = input;
      const { db } = ctx;
      const user = ctx.session.user;
      await db
        .delete(connection)
        .where(and(eq(connection.id, connectionId), eq(connection.userId, user.id)));

      if (connectionId === ctx.session.connectionId)
        await db.update(user_).set({ defaultConnectionId: null });
    }),
  updateTheme: privateProcedure
    .input(z.object({ 
      connectionId: z.string(),
      themeId: z.string().nullable(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { connectionId, themeId } = input;
      const { db } = ctx;
      const user = ctx.session.user;
      
      // Verify connection exists and belongs to user
      const foundConnection = await db.query.connection.findFirst({
        where: and(eq(connection.id, connectionId), eq(connection.userId, user.id)),
      });
      
      if (!foundConnection) {
        throw new TRPCError({ 
          code: 'NOT_FOUND',
          message: 'Connection not found'
        });
      }
      
      // If themeId is provided, verify theme exists and belongs to user
      if (themeId) {
        const foundTheme = await db.query.theme.findFirst({
          where: and(
            eq(theme.id, themeId),
            eq(theme.userId, user.id)
          ),
        });
        
        if (!foundTheme) {
          throw new TRPCError({ 
            code: 'NOT_FOUND',
            message: 'Theme not found'
          });
        }
      }
      
      // Update connection with theme
      await db
        .update(connection)
        .set({ themeId })
        .where(and(eq(connection.id, connectionId), eq(connection.userId, user.id)));
        
      return { success: true };
    }),
});
