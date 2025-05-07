'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from './color-picker';
import { FontSelector } from './font-selector';
import { SpacingControl } from './spacing-controls';
import { ThemePreview } from './theme-preview';
import { defaultThemeProperties, darkThemeProperties } from '@zero/db/theme_properties';
import type { ThemeProperties } from '@zero/db/theme_properties';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from 'next-themes';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  name: z.string().min(1, 'Theme name is required'),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

interface ThemeEditorProps {
  initialTheme?: {
    id?: string;
    name: string;
    description?: string;
    properties: ThemeProperties;
    isPublic: boolean;
  };
  onSave: (theme: any) => void;
  onCancel: () => void;
}

export function ThemeEditor({ initialTheme, onSave, onCancel }: ThemeEditorProps) {
  const { theme: systemTheme } = useTheme();
  const [properties, setProperties] = useState<ThemeProperties>(
    initialTheme?.properties || 
    (systemTheme === 'dark' ? darkThemeProperties : defaultThemeProperties)
  );
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialTheme?.name || 'New Theme',
      description: initialTheme?.description || '',
      isPublic: initialTheme?.isPublic || false,
    },
  });
  
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSave({
      ...values,
      id: initialTheme?.id,
      properties,
    });
  };
  
  const updateColor = (key: keyof ThemeProperties['colors'], value: string) => {
    setProperties((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value,
      },
    }));
  };
  
  const updateFont = (value: string) => {
    setProperties((prev) => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        body: value,
      },
    }));
  };
  
  const updateSpacing = (key: keyof ThemeProperties['spacing'], value: string) => {
    setProperties((prev) => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [key]: value,
      },
    }));
  };
  
  const updateShadow = (key: keyof ThemeProperties['shadows'], value: string) => {
    setProperties((prev) => ({
      ...prev,
      shadows: {
        ...prev.shadows,
        [key]: value,
      },
    }));
  };
  
  const resetToDefault = () => {
    setProperties(systemTheme === 'dark' ? darkThemeProperties : defaultThemeProperties);
  };
  
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Share in Marketplace</FormLabel>
                      <p className="text-muted-foreground text-sm">
                        Make this theme available to other users in the theme marketplace
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <Tabs defaultValue="colors">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="typography">Typography</TabsTrigger>
                <TabsTrigger value="spacing">Spacing</TabsTrigger>
                <TabsTrigger value="shadows">Shadows</TabsTrigger>
              </TabsList>
              
              <TabsContent value="colors" className="space-y-4">
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Base Colors</h3>
                    <Separator />
                    <ColorPicker
                      label="Background"
                      value={properties.colors.background}
                      onChange={(value) => updateColor('background', value)}
                    />
                    <ColorPicker
                      label="Foreground"
                      value={properties.colors.foreground}
                      onChange={(value) => updateColor('foreground', value)}
                    />
                    <ColorPicker
                      label="Card"
                      value={properties.colors.card}
                      onChange={(value) => updateColor('card', value)}
                    />
                    <ColorPicker
                      label="Card Foreground"
                      value={properties.colors.cardForeground}
                      onChange={(value) => updateColor('cardForeground', value)}
                    />
                    
                    <h3 className="mt-6 font-medium">UI Colors</h3>
                    <Separator />
                    <ColorPicker
                      label="Primary"
                      value={properties.colors.primary}
                      onChange={(value) => updateColor('primary', value)}
                    />
                    <ColorPicker
                      label="Primary Foreground"
                      value={properties.colors.primaryForeground}
                      onChange={(value) => updateColor('primaryForeground', value)}
                    />
                    <ColorPicker
                      label="Secondary"
                      value={properties.colors.secondary}
                      onChange={(value) => updateColor('secondary', value)}
                    />
                    <ColorPicker
                      label="Secondary Foreground"
                      value={properties.colors.secondaryForeground}
                      onChange={(value) => updateColor('secondaryForeground', value)}
                    />
                    <ColorPicker
                      label="Accent"
                      value={properties.colors.accent}
                      onChange={(value) => updateColor('accent', value)}
                    />
                    <ColorPicker
                      label="Accent Foreground"
                      value={properties.colors.accentForeground}
                      onChange={(value) => updateColor('accentForeground', value)}
                    />
                    <ColorPicker
                      label="Destructive"
                      value={properties.colors.destructive}
                      onChange={(value) => updateColor('destructive', value)}
                    />
                    <ColorPicker
                      label="Destructive Foreground"
                      value={properties.colors.destructiveForeground}
                      onChange={(value) => updateColor('destructiveForeground', value)}
                    />
                    
                    <h3 className="mt-6 font-medium">Muted Colors</h3>
                    <Separator />
                    <ColorPicker
                      label="Muted"
                      value={properties.colors.muted}
                      onChange={(value) => updateColor('muted', value)}
                    />
                    <ColorPicker
                      label="Muted Foreground"
                      value={properties.colors.mutedForeground}
                      onChange={(value) => updateColor('mutedForeground', value)}
                    />
                    
                    <h3 className="mt-6 font-medium">Border & Input</h3>
                    <Separator />
                    <ColorPicker
                      label="Border"
                      value={properties.colors.border}
                      onChange={(value) => updateColor('border', value)}
                    />
                    <ColorPicker
                      label="Input"
                      value={properties.colors.input}
                      onChange={(value) => updateColor('input', value)}
                    />
                    <ColorPicker
                      label="Ring"
                      value={properties.colors.ring}
                      onChange={(value) => updateColor('ring', value)}
                    />
                    
                    <h3 className="mt-6 font-medium">Sidebar Colors</h3>
                    <Separator />
                    <ColorPicker
                      label="Sidebar Background"
                      value={properties.colors.sidebarBackground}
                      onChange={(value) => updateColor('sidebarBackground', value)}
                    />
                    <ColorPicker
                      label="Sidebar Foreground"
                      value={properties.colors.sidebarForeground}
                      onChange={(value) => updateColor('sidebarForeground', value)}
                    />
                    <ColorPicker
                      label="Sidebar Primary"
                      value={properties.colors.sidebarPrimary}
                      onChange={(value) => updateColor('sidebarPrimary', value)}
                    />
                    <ColorPicker
                      label="Sidebar Primary Foreground"
                      value={properties.colors.sidebarPrimaryForeground}
                      onChange={(value) => updateColor('sidebarPrimaryForeground', value)}
                    />
                    <ColorPicker
                      label="Sidebar Accent"
                      value={properties.colors.sidebarAccent}
                      onChange={(value) => updateColor('sidebarAccent', value)}
                    />
                    <ColorPicker
                      label="Sidebar Accent Foreground"
                      value={properties.colors.sidebarAccentForeground}
                      onChange={(value) => updateColor('sidebarAccentForeground', value)}
                    />
                    <ColorPicker
                      label="Sidebar Border"
                      value={properties.colors.sidebarBorder}
                      onChange={(value) => updateColor('sidebarBorder', value)}
                    />
                    <ColorPicker
                      label="Sidebar Ring"
                      value={properties.colors.sidebarRing}
                      onChange={(value) => updateColor('sidebarRing', value)}
                    />
                    
                    <h3 className="mt-6 font-medium">Chart Colors</h3>
                    <Separator />
                    <ColorPicker
                      label="Chart 1"
                      value={properties.colors.chart1}
                      onChange={(value) => updateColor('chart1', value)}
                    />
                    <ColorPicker
                      label="Chart 2"
                      value={properties.colors.chart2}
                      onChange={(value) => updateColor('chart2', value)}
                    />
                    <ColorPicker
                      label="Chart 3"
                      value={properties.colors.chart3}
                      onChange={(value) => updateColor('chart3', value)}
                    />
                    <ColorPicker
                      label="Chart 4"
                      value={properties.colors.chart4}
                      onChange={(value) => updateColor('chart4', value)}
                    />
                    <ColorPicker
                      label="Chart 5"
                      value={properties.colors.chart5}
                      onChange={(value) => updateColor('chart5', value)}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="typography" className="space-y-4">
                <div className="rounded-md border p-4">
                  <FontSelector
                    value={properties.fonts.body}
                    onChange={updateFont}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="spacing" className="space-y-4">
                <div className="rounded-md border p-4">
                  <SpacingControl
                    label="Border Radius"
                    value={properties.spacing.borderRadius}
                    min={0}
                    max={2}
                    step={0.1}
                    unit="rem"
                    onChange={(value) => updateSpacing('borderRadius', value)}
                  />
                  <SpacingControl
                    label="Padding"
                    value={properties.spacing.padding}
                    min={0}
                    max={4}
                    step={0.25}
                    unit="rem"
                    onChange={(value) => updateSpacing('padding', value)}
                  />
                  <SpacingControl
                    label="Margin"
                    value={properties.spacing.margin}
                    min={0}
                    max={4}
                    step={0.25}
                    unit="rem"
                    onChange={(value) => updateSpacing('margin', value)}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="shadows" className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <FormLabel>Small Shadow</FormLabel>
                      <Textarea
                        value={properties.shadows.small}
                        onChange={(e) => updateShadow('small', e.target.value)}
                        className="font-mono text-xs"
                      />
                      <div className="h-16 w-16 rounded-md bg-card p-4" style={{ boxShadow: properties.shadows.small }}>
                        <div className="h-full w-full rounded bg-primary" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel>Medium Shadow</FormLabel>
                      <Textarea
                        value={properties.shadows.medium}
                        onChange={(e) => updateShadow('medium', e.target.value)}
                        className="font-mono text-xs"
                      />
                      <div className="h-16 w-16 rounded-md bg-card p-4" style={{ boxShadow: properties.shadows.medium }}>
                        <div className="h-full w-full rounded bg-primary" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel>Large Shadow</FormLabel>
                      <Textarea
                        value={properties.shadows.large}
                        onChange={(e) => updateShadow('large', e.target.value)}
                        className="font-mono text-xs"
                      />
                      <div className="h-16 w-16 rounded-md bg-card p-4" style={{ boxShadow: properties.shadows.large }}>
                        <div className="h-full w-full rounded bg-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={resetToDefault}>
                Reset to Default
              </Button>
              <div className="space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  {initialTheme?.id ? 'Update Theme' : 'Create Theme'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
      
      <div className="lg:col-span-2">
        <div className="sticky top-6 space-y-6">
          <div className="rounded-md border">
            <div className="bg-muted p-2 text-center text-sm font-medium">
              Live Preview
            </div>
            <ThemePreview properties={properties} className="max-h-[600px] overflow-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}