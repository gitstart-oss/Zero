import { db } from '@zero/db';
import { connection } from '@zero/db/schema';
import { getServerSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateConnectionSchema = z.object({
  themeId: z.string().nullable().optional(),
});

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const connectionId = url.pathname.split('/').pop();
    
    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
    }
    
    const body = await request.json();
    const validatedData = updateConnectionSchema.parse(body);
    
    const existingConnection = await db.query.connection.findFirst({
      where: and(
        eq(connection.id, connectionId),
        eq(connection.userId, session.user.id)
      ),
    });
    
    if (!existingConnection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }
    
    const updatedConnection = await db.update(connection)
      .set({
        themeId: validatedData.themeId,
        updatedAt: new Date(),
      })
      .where(and(
        eq(connection.id, connectionId),
        eq(connection.userId, session.user.id)
      ))
      .returning();
    
    return NextResponse.json(updatedConnection[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error('Error updating connection:', error);
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 });
  }
}