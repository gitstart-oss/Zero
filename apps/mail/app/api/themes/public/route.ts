import { db } from '@zero/db';
import { theme } from '@zero/db/schema';
import { getServerSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const publicThemes = await db.query.theme.findMany({
      where: eq(theme.isPublic, true),
      orderBy: (theme, { desc }) => [desc(theme.updatedAt)],
    });
    
    return NextResponse.json(publicThemes);
  } catch (error) {
    console.error('Error fetching public themes:', error);
    return NextResponse.json({ error: 'Failed to fetch public themes' }, { status: 500 });
  }
}