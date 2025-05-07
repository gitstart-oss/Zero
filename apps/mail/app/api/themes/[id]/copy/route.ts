import { db } from '@zero/db';
import { theme } from '@zero/db/schema';
import { getServerSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const themeData = await db.query.theme.findFirst({
      where: eq(theme.id, params.id),
    });
    
    if (!themeData) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }
    
    if (!themeData.isPublic && themeData.userId !== session.user.id) {
      return NextResponse.json({ error: 'Theme is not public' }, { status: 403 });
    }
    
    const newTheme = await db.insert(theme).values({
      id: nanoid(),
      name: `${themeData.name} (Copy)`,
      userId: session.user.id,
      isPublic: false,
      properties: themeData.properties,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return NextResponse.json(newTheme[0]);
  } catch (error) {
    console.error('Error copying theme:', error);
    return NextResponse.json({ error: 'Failed to copy theme' }, { status: 500 });
  }
}