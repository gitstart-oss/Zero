'use client';

import { useState } from 'react';
import { usePublicThemes, copyTheme } from '@/hooks/use-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsCard } from '@/components/settings/settings-card';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Copy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ThemeMarketplacePage() {
  const { data: publicThemes, mutate } = usePublicThemes();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  const handleCopyTheme = async (id: string) => {
    setIsLoading(true);
    try {
      await copyTheme(id);
      toast.success('Theme copied to your themes');
    } catch (error) {
      console.error('Error copying theme:', error);
      toast.error('Failed to copy theme');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredThemes = publicThemes?.filter((theme) =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid gap-6">
      <SettingsCard
        title={t('pages.settings.themes.marketplace.title') || 'Theme Marketplace'}
        description={t('pages.settings.themes.marketplace.description') || 'Browse and copy themes created by other users.'}
      >
        <Tabs defaultValue="marketplace">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-themes">
              <Link href="/settings/themes" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                My Themes
              </Link>
            </TabsTrigger>
            <TabsTrigger value="marketplace">Theme Marketplace</TabsTrigger>
          </TabsList>
          <TabsContent value="marketplace" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search themes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredThemes?.map((theme) => (
                <Card key={theme.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{theme.name}</CardTitle>
                    <CardDescription>
                      By {theme.userId.substring(0, 8)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-24 rounded-md border" style={{ 
                      background: theme.properties.colors.background,
                      color: theme.properties.colors.foreground,
                      fontFamily: `'${theme.properties.font}', sans-serif`,
                      padding: theme.properties.spacing.base,
                      borderRadius: theme.properties.borderRadius.medium,
                    }}>
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 rounded-md" style={{ background: theme.properties.colors.primary }}></div>
                        <div className="w-8 h-8 rounded-md" style={{ background: theme.properties.colors.secondary }}></div>
                        <div className="w-8 h-8 rounded-md" style={{ background: theme.properties.colors.accent }}></div>
                        <div className="w-8 h-8 rounded-md" style={{ background: theme.properties.colors.destructive }}></div>
                      </div>
                      <p className="mt-2">Theme Preview</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleCopyTheme(theme.id)}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to My Themes
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              {filteredThemes?.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-muted-foreground">No public themes found.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SettingsCard>
    </div>
  );
}