'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { applyThemeProperties, loadGoogleFont } from '@/lib/theme-utils';
import type { ThemeProperties } from '@zero/db/theme_properties';
import { useEffect, useState } from 'react';

interface ThemePreviewProps {
  properties: ThemeProperties;
  className?: string;
}

export function ThemePreview({ properties, className }: ThemePreviewProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Apply theme properties to preview container
  useEffect(() => {
    setIsMounted(true);
    
    // Load font if needed
    if (properties.fonts.body) {
      loadGoogleFont(properties.fonts.body.split(',')[0].trim());
    }
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  return (
    <div 
      className={className}
      style={{
        // Apply theme properties inline for isolated preview
        '--background': properties.colors.background,
        '--foreground': properties.colors.foreground,
        '--card': properties.colors.card,
        '--card-foreground': properties.colors.cardForeground,
        '--primary': properties.colors.primary,
        '--primary-foreground': properties.colors.primaryForeground,
        '--secondary': properties.colors.secondary,
        '--secondary-foreground': properties.colors.secondaryForeground,
        '--muted': properties.colors.muted,
        '--muted-foreground': properties.colors.mutedForeground,
        '--accent': properties.colors.accent,
        '--accent-foreground': properties.colors.accentForeground,
        '--destructive': properties.colors.destructive,
        '--destructive-foreground': properties.colors.destructiveForeground,
        '--border': properties.colors.border,
        '--input': properties.colors.input,
        '--ring': properties.colors.ring,
        '--radius': properties.spacing.borderRadius,
        fontFamily: properties.fonts.body,
      } as React.CSSProperties}
    >
      <div className="rounded-lg bg-background p-6 text-foreground">
        <h3 className="mb-4 text-lg font-semibold">Theme Preview</h3>
        
        <div className="space-y-4">
          {/* Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          
          {/* Card */}
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is a card with some content. It demonstrates how the theme affects card components.</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Submit</Button>
            </CardFooter>
          </Card>
          
          {/* Form elements */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="input">Input</Label>
              <Input id="input" placeholder="Enter text..." />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch id="switch" />
              <Label htmlFor="switch">Toggle</Label>
            </div>
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
          
          {/* Typography */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Heading 1</h1>
            <h2 className="text-xl font-semibold">Heading 2</h2>
            <h3 className="text-lg font-medium">Heading 3</h3>
            <p className="text-base">Regular paragraph text</p>
            <p className="text-sm text-muted-foreground">Muted small text</p>
          </div>
        </div>
      </div>
    </div>
  );
}