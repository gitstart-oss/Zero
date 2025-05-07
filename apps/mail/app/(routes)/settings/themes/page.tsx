'use client';

import { useState } from 'react';
import { useThemes, createTheme, updateTheme, deleteTheme } from '@/hooks/use-themes';
import { ThemeEditor } from '@/components/theme/theme-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SettingsCard } from '@/components/settings/settings-card';
import { ThemeProperties } from '@/types';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Plus, Globe } from 'lucide-react';

export default function ThemesPage() {
  const { data: themes, mutate } = useThemes();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newThemeName, setNewThemeName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  const handleCreateTheme = async (properties: ThemeProperties) => {
    if (!newThemeName.trim()) {
      toast.error('Please enter a theme name');
      return;
    }

    setIsLoading(true);
    try {
      await createTheme({
        name: newThemeName,
        isPublic,
        properties,
      });
      
      await mutate();
      setIsCreating(false);
      setNewThemeName('');
      setIsPublic(false);
      toast.success('Theme created successfully');
    } catch (error) {
      console.error('Error creating theme:', error);
      toast.error('Failed to create theme');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTheme = async (properties: ThemeProperties) => {
    if (!isEditing) return;

    setIsLoading(true);
    try {
      await updateTheme(isEditing, {
        isPublic,
        properties,
      });
      
      await mutate();
      setIsEditing(null);
      toast.success('Theme updated successfully');
    } catch (error) {
      console.error('Error updating theme:', error);
      toast.error('Failed to update theme');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTheme = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteTheme(id);
      await mutate();
      toast.success('Theme deleted successfully');
    } catch (error) {
      console.error('Error deleting theme:', error);
      toast.error('Failed to delete theme');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublicChange = async (id: string, isPublic: boolean) => {
    setIsLoading(true);
    try {
      await updateTheme(id, { isPublic });
      await mutate();
      toast.success(isPublic ? 'Theme is now public' : 'Theme is now private');
    } catch (error) {
      console.error('Error updating theme visibility:', error);
      toast.error('Failed to update theme visibility');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <SettingsCard
        title={t('pages.settings.themes.title') || 'Themes'}
        description={t('pages.settings.themes.description') || 'Create and manage your custom themes.'}
      >
        <Tabs defaultValue="my-themes">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-themes">My Themes</TabsTrigger>
            <TabsTrigger value="marketplace">
              <a href="/settings/themes/marketplace">Theme Marketplace</a>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="my-themes" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Theme
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Create New Theme</DialogTitle>
                    <DialogDescription>
                      Create a custom theme with your preferred colors, fonts, and styles.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="theme-name">Theme Name</Label>
                        <Input
                          id="theme-name"
                          value={newThemeName}
                          onChange={(e) => setNewThemeName(e.target.value)}
                          placeholder="My Custom Theme"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="public-theme"
                          checked={isPublic}
                          onCheckedChange={setIsPublic}
                        />
                        <Label htmlFor="public-theme">Make this theme public</Label>
                      </div>
                    </div>
                    <ThemeEditor
                      onSave={handleCreateTheme}
                      onCancel={() => setIsCreating(false)}
                      isPublic={isPublic}
                      onPublicChange={setIsPublic}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes?.map((theme) => (
                <Card key={theme.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>{theme.name}</CardTitle>
                      {theme.isPublic && (
                        <Globe className="h-4 w-4 text-blue-500" title="Public Theme" />
                      )}
                    </div>
                    <CardDescription>
                      Created {new Date(theme.createdAt).toLocaleDateString()}
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
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`public-${theme.id}`}
                        checked={theme.isPublic}
                        onCheckedChange={(checked) => handlePublicChange(theme.id, checked)}
                        disabled={isLoading}
                      />
                      <Label htmlFor={`public-${theme.id}`}>Public</Label>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog open={isEditing === theme.id} onOpenChange={(open) => setIsEditing(open ? theme.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Edit Theme: {theme.name}</DialogTitle>
                            <DialogDescription>
                              Customize your theme with your preferred colors, fonts, and styles.
                            </DialogDescription>
                          </DialogHeader>
                          <ThemeEditor
                            initialTheme={theme.properties}
                            onSave={handleUpdateTheme}
                            onCancel={() => setIsEditing(null)}
                            isPublic={theme.isPublic}
                            onPublicChange={(checked) => setIsPublic(checked)}
                          />
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Theme</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this theme? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTheme(theme.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardFooter>
                </Card>
              ))}
              
              {themes?.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-muted-foreground mb-4">You haven't created any themes yet.</p>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Theme
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SettingsCard>
    </div>
  );
}