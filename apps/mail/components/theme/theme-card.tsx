'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemePreview } from './theme-preview';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, Globe, GlobeLock } from 'lucide-react';
import type { ThemeProperties } from '@zero/db/theme_properties';

interface ThemeCardProps {
  theme: {
    id: string;
    name: string;
    description?: string;
    properties: ThemeProperties;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  onEdit: (theme: any) => void;
  onDelete: (themeId: string) => void;
  onTogglePublic: (themeId: string, isPublic: boolean) => void;
}

export function ThemeCard({ theme, onEdit, onDelete, onTogglePublic }: ThemeCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{theme.name}</CardTitle>
          {theme.isPublic ? (
            <Badge variant="outline" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Public
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1 opacity-50">
              <GlobeLock className="h-3 w-3" />
              Private
            </Badge>
          )}
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
      <CardFooter className="flex justify-between p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTogglePublic(theme.id, !theme.isPublic)}
        >
          {theme.isPublic ? 'Make Private' : 'Make Public'}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(theme)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(theme.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}