'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { SettingsCard } from '@/components/settings/settings-card';
import { zodResolver } from '@hookform/resolvers/zod';
import type { MessageKey } from '@/config/navigation';
import { useTRPC } from '@/providers/query-provider';
import { useMutation } from '@tanstack/react-query';
import { useSettings } from '@/hooks/use-settings';
import { useThemes } from '@/hooks/use-themes';
import { Laptop, Moon, Sun, Plus, Paintbrush } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';
import { ThemeEditor } from '@/components/theme/theme-editor';
import { ThemeCard } from '@/components/theme/theme-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { defaultThemeProperties } from '@zero/db/theme_properties';

const formSchema = z.object({
  colorTheme: z.enum(['dark', 'light', 'system', '']),
});

type Theme = 'dark' | 'light' | 'system';

export default function AppearancePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<any>(null);
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);
  
  const t = useTranslations();
  const { data, refetch } = useSettings();
  const { theme, systemTheme, resolvedTheme, setTheme } = useTheme();
  const { themes, isLoading: isLoadingThemes, createTheme, updateTheme, deleteTheme, togglePublic } = useThemes();
  
  const trpc = useTRPC();
  const { mutateAsync: saveUserSettings } = useMutation(trpc.settings.save.mutationOptions());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      colorTheme: data?.settings.colorTheme || (theme as Theme),
    },
  });

  async function handleThemeChange(newTheme: string) {
    let nextResolvedTheme = newTheme;

    if (newTheme === 'system' && systemTheme) {
      nextResolvedTheme = systemTheme;
    }

    function update() {
      setTheme(newTheme);
      form.setValue('colorTheme', newTheme as z.infer<typeof formSchema>['colorTheme']);
    }

    if (document.startViewTransition && nextResolvedTheme !== resolvedTheme) {
      document.documentElement.style.viewTransitionName = 'theme-transition';
      await document.startViewTransition(update).finished;
      document.documentElement.style.viewTransitionName = '';
    } else {
      update();
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    try {
      await saveUserSettings({
        ...(data?.settings ? data.settings : {}),
        colorTheme: values.colorTheme as Theme,
      });
      await refetch();

      toast.success(t('common.settings.saved'));
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(t('common.settings.failedToSave'));
      await refetch();
    } finally {
      setIsSaving(false);
    }
  }
  
  const handleCreateTheme = () => {
    setCurrentTheme(null);
    setIsEditorOpen(true);
  };
  
  const handleEditTheme = (theme: any) => {
    setCurrentTheme(theme);
    setIsEditorOpen(true);
  };
  
  const handleDeleteTheme = (themeId: string) => {
    setThemeToDelete(themeId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteTheme = async () => {
    if (themeToDelete) {
      await deleteTheme(themeToDelete);
      setIsDeleteDialogOpen(false);
      setThemeToDelete(null);
    }
  };
  
  const handleSaveTheme = async (themeData: any) => {
    try {
      if (themeData.id) {
        // Update existing theme
        await updateTheme(themeData.id, {
          name: themeData.name,
          description: themeData.description,
          properties: themeData.properties,
          isPublic: themeData.isPublic,
        });
      } else {
        // Create new theme
        await createTheme(
          themeData.name,
          themeData.properties,
          themeData.description,
          themeData.isPublic,
        );
      }
      setIsEditorOpen(false);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  if (!data?.settings) return null;

  return (
    <div className="grid gap-6">
      <SettingsCard
        title={t('pages.settings.appearance.title')}
        description={t('pages.settings.appearance.description')}
        footer={
          <Button type="submit" form="appearance-form" disabled={isSaving}>
            {isSaving ? t('common.actions.saving') : t('common.actions.saveChanges')}
          </Button>
        }
      >
        <Form {...form}>
          <form id="appearance-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <div className="max-w-sm space-y-2">
                {data.settings.colorTheme || theme ? (
                  <FormField
                    control={form.control}
                    name="colorTheme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('pages.settings.appearance.theme')}</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              handleThemeChange(value);
                            }}
                            defaultValue={form.getValues().colorTheme}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select theme">
                                <div className="flex items-center gap-2 capitalize">
                                  {theme === 'dark' && <Moon className="h-4 w-4" />}
                                  {theme === 'light' && <Sun className="h-4 w-4" />}
                                  {theme === 'system' && <Laptop className="h-4 w-4" />}
                                  {t(`common.themes.${theme}` as MessageKey)}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dark">
                                <div className="flex items-center gap-2">
                                  <Moon className="h-4 w-4" />
                                  {t('common.themes.dark')}
                                </div>
                              </SelectItem>
                              <SelectItem value="system">
                                <div className="flex items-center gap-2">
                                  <Laptop className="h-4 w-4" />
                                  {t('common.themes.system')}
                                </div>
                              </SelectItem>
                              <SelectItem value="light">
                                <div className="flex items-center gap-2">
                                  <Sun className="h-4 w-4" />
                                  {t('common.themes.light')}
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
              </div>
            </div>
          </form>
        </Form>
      </SettingsCard>
      
      <SettingsCard
        title="Custom Themes"
        description="Create and manage your custom themes. You can create themes with custom colors, fonts, and spacing."
      >
        <Tabs defaultValue="my-themes">
          <TabsList className="mb-4">
            <TabsTrigger value="my-themes">My Themes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-themes" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleCreateTheme} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Theme
              </Button>
            </div>
            
            {isLoadingThemes ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-[350px] animate-pulse rounded-lg border bg-muted" />
                ))}
              </div>
            ) : themes && themes.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {themes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    onEdit={handleEditTheme}
                    onDelete={handleDeleteTheme}
                    onTogglePublic={togglePublic}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <Paintbrush className="mb-2 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium">No themes yet</h3>
                <p className="text-muted-foreground mb-4 mt-2 text-sm">
                  Create your first custom theme to personalize your experience.
                </p>
                <Button onClick={handleCreateTheme} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Theme
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SettingsCard>
      
      {/* Theme Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{currentTheme ? 'Edit Theme' : 'Create Theme'}</DialogTitle>
            <DialogDescription>
              Customize colors, fonts, and spacing to create your perfect theme.
            </DialogDescription>
          </DialogHeader>
          
          <ThemeEditor
            initialTheme={currentTheme || {
              name: 'New Theme',
              description: '',
              properties: defaultThemeProperties,
              isPublic: false,
            }}
            onSave={handleSaveTheme}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Theme</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this theme? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTheme}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
