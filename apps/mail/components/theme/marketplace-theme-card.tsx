'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemePreview } from './theme-preview';
import { Badge } from '@/components/ui/badge';
import { Copy, User } from 'lucide-react';
import type { ThemeProperties } from '@zero/db/theme_properties';
import { useState } from 'react';

interface MarketplaceThemeCardProps {
  theme: {
    id: string;
    name: string;
    description?: string;
    properties: ThemeProperties;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  onCopy: (themeId: string) => Promise<void>;
}

export function MarketplaceThemeCard({ theme, onCopy }: MarketplaceThemeCardProps) {
  const [isCopying, setIsCopying] = useState(false);
  
  const handleCopy = async () => {
    setIsCopying(true);
    try {
      await onCopy(theme.id);
    } finally {
      setIsCopying(false);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{theme.name}</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {theme.userId.substring(0, 6)}
          </Badge>
        </div>
        {theme.description && (
          <p className="text-muted-foreground text-sm">{theme.description}</p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[200px] overflow-hidden border-y">
          <ThemePreview properties={theme.properties as ThemeProperties} className="scale-[0.6] origin-top" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end p-4">
        <Button
          onClick={handleCopy}
          disabled={isCopying}
          className="flex items-center gap-1"
        >
          <Copy className="h-4 w-4" />
          {isCopying ? 'Copying...' : 'Copy to My Themes'}
        </Button>
      </CardFooter>
    </Card>
  );
}