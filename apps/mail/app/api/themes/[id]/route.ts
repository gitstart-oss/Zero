import { db } from '@zero/db';
import { theme } from '@zero/db/schema';
import { getServerSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
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

const updateThemeSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  isPublic: z.boolean().optional(),
  properties: themePropertiesSchema.optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const themeData = await db.query.theme.findFirst({
      where: and(
        eq(theme.id, params.id),
        eq(theme.userId, session.user.id)
      ),
    });
    
    if (!themeData) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }
    
    return NextResponse.json(themeData);
  } catch (error) {
    console.error('Error fetching theme:', error);
    return NextResponse.json({ error: 'Failed to fetch theme' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validatedData = updateThemeSchema.parse(body);
    
    const existingTheme = await db.query.theme.findFirst({
      where: and(
        eq(theme.id, params.id),
        eq(theme.userId, session.user.id)
      ),
    });
    
    if (!existingTheme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }
    
    const updatedTheme = await db.update(theme)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(and(
        eq(theme.id, params.id),
        eq(theme.userId, session.user.id)
      ))
      .returning();
    
    return NextResponse.json(updatedTheme[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error('Error updating theme:', error);
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const existingTheme = await db.query.theme.findFirst({
      where: and(
        eq(theme.id, params.id),
        eq(theme.userId, session.user.id)
      ),
    });
    
    if (!existingTheme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }
    
    await db.delete(theme)
      .where(and(
        eq(theme.id, params.id),
        eq(theme.userId, session.user.id)
      ));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting theme:', error);
    return NextResponse.json({ error: 'Failed to delete theme' }, { status: 500 });
  }
}