import { db } from '@zero/db';
import { theme } from '@zero/db/schema';
import { getServerSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const themePropertiesSchema = z.object({
  colors: z.object({
    background: z.string(),
    foreground: z.string(),
    card: z.string(),
    cardForeground: z.string(),
    popover: z.string(),
    popoverForeground: z.string(),
    primary: z.string(),
    primaryForeground: z.string(),
    secondary: z.string(),
    secondaryForeground: z.string(),
    muted: z.string(),
    mutedForeground: z.string(),
    accent: z.string(),
    accentForeground: z.string(),
    destructive: z.string(),
    destructiveForeground: z.string(),
    border: z.string(),
    input: z.string(),
    ring: z.string(),
    sidebar: z.object({
      background: z.string(),
      foreground: z.string(),
      primary: z.string(),
      primaryForeground: z.string(),
      accent: z.string(),
      accentForeground: z.string(),
      border: z.string(),
      ring: z.string(),
    }),
  }),
  font: z.string(),
  fontSize: z.object({
    base: z.string(),
    small: z.string(),
    large: z.string(),
  }),
  spacing: z.object({
    base: z.string(),
    small: z.string(),
    medium: z.string(),
    large: z.string(),
  }),
  borderRadius: z.object({
    small: z.string(),
    medium: z.string(),
    large: z.string(),
  }),
  shadows: z.object({
    small: z.string(),
    medium: z.string(),
    large: z.string(),
  }),
});

const createThemeSchema = z.object({
  name: z.string().min(1).max(50),
  isPublic: z.boolean().default(false),
  properties: themePropertiesSchema,
});

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const themes = await db.query.theme.findMany({
      where: eq(theme.userId, session.user.id),
      orderBy: (theme, { desc }) => [desc(theme.updatedAt)],
    });
    
    return NextResponse.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validatedData = createThemeSchema.parse(body);
    
    const newTheme = await db.insert(theme).values({
      id: nanoid(),
      name: validatedData.name,
      userId: session.user.id,
      isPublic: validatedData.isPublic,
      properties: validatedData.properties,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return NextResponse.json(newTheme[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error('Error creating theme:', error);
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 });
  }
}