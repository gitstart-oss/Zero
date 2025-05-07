'use client';

import { ThemeProperties } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useFonts } from '@/hooks/use-themes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTheme } from 'next-themes';

interface ThemeEditorProps {
  initialTheme?: ThemeProperties;
  onSave: (theme: ThemeProperties) => void;
  onCancel?: () => void;
  isPublic?: boolean;
  onPublicChange?: (isPublic: boolean) => void;
}

const defaultTheme: ThemeProperties = {
  colors: {
    background: '#ffffff',
    foreground: '#0f172a',
    card: '#ffffff',
    cardForeground: '#0f172a',
    popover: '#ffffff',
    popoverForeground: '#0f172a',
    primary: '#0f172a',
    primaryForeground: '#f8fafc',
    secondary: '#f1f5f9',
    secondaryForeground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    accent: '#f1f5f9',
    accentForeground: '#0f172a',
    destructive: '#ef4444',
    destructiveForeground: '#f8fafc',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#0f172a',
    sidebar: {
      background: '#f8fafc',
      foreground: '#64748b',
      primary: '#0f172a',
      primaryForeground: '#f8fafc',
      accent: '#f1f5f9',
      accentForeground: '#0f172a',
      border: '#e2e8f0',
      ring: '#0f172a',
    },
  },
  font: 'Inter',
  fontSize: {
    base: '16px',
    small: '14px',
    large: '18px',
  },
  spacing: {
    base: '16px',
    small: '8px',
    medium: '24px',
    large: '32px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
  shadows: {
    small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
};

export function ThemeEditor({
  initialTheme,
  onSave,
  onCancel,
  isPublic = false,
  onPublicChange,
}: ThemeEditorProps) {
  const [theme, setTheme] = useState<ThemeProperties>(initialTheme || defaultTheme);
  const [activeColor, setActiveColor] = useState<string>('');
  const [colorPath, setColorPath] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const { data: fonts, isLoading: fontsLoading } = useFonts();
  const { setTheme: setAppTheme } = useTheme();

  useEffect(() => {
    // Apply preview theme to document for live preview
    const root = document.documentElement;
    
    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--${key}`, value);
      } else if (key === 'sidebar') {
        Object.entries(value).forEach(([sidebarKey, sidebarValue]) => {
          root.style.setProperty(`--sidebar-${sidebarKey}`, sidebarValue);
        });
      }
    });
    
    // Apply font
    if (theme.font) {
      const fontLink = document.createElement('link');
      fontLink.href = `https://fonts.googleapis.com/css2?family=${theme.font.replace(' ', '+')}&display=swap`;
      fontLink.rel = 'stylesheet';
      document.head.appendChild(fontLink);
      
      root.style.fontFamily = `'${theme.font}', sans-serif`;
    }
    
    // Apply other properties
    root.style.setProperty('--radius', theme.borderRadius.medium);
    
    return () => {
      // Clean up
      const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
      fontLinks.forEach((link) => link.remove());
    };
  }, [theme, previewMode]);

  const handleColorChange = (color: string) => {
    if (colorPath.length === 0) return;
    
    setTheme((prev) => {
      const newTheme = { ...prev };
      let current: any = newTheme;
      
      // Navigate to the nested property
      for (let i = 0; i < colorPath.length - 1; i++) {
        current = current[colorPath[i]];
      }
      
      // Set the value
      current[colorPath[colorPath.length - 1]] = color;
      
      return newTheme;
    });
  };

  const handleInputChange = (path: string[], value: string) => {
    setTheme((prev) => {
      const newTheme = { ...prev };
      let current: any = newTheme;
      
      // Navigate to the nested property
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      
      // Set the value
      current[path[path.length - 1]] = value;
      
      return newTheme;
    });
  };

  const openColorPicker = (path: string[]) => {
    let current: any = theme;
    
    // Navigate to the nested property
    for (const key of path) {
      current = current[key];
    }
    
    setActiveColor(current);
    setColorPath(path);
  };

  const togglePreviewMode = () => {
    setPreviewMode(previewMode === 'light' ? 'dark' : 'light');
    setAppTheme(previewMode === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Theme Editor</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={togglePreviewMode}>
              {previewMode === 'light' ? 'Dark Preview' : 'Light Preview'}
            </Button>
            {onPublicChange && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="public-theme"
                  checked={isPublic}
                  onCheckedChange={onPublicChange}
                />
                <Label htmlFor="public-theme">Public Theme</Label>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="colors">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="spacing">Spacing</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="colors" className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="base-colors">
                <AccordionTrigger>Base Colors</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(theme.colors).map(([key, value]) => {
                      if (typeof value === 'string' && key !== 'sidebar') {
                        return (
                          <div key={key} className="space-y-2">
                            <Label className="capitalize">{key}</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start"
                                  style={{ backgroundColor: value }}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="capitalize">{key}</span>
                                    <span>{value}</span>
                                  </div>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <div className="p-3">
                                  <HexColorPicker
                                    color={value}
                                    onChange={(color) => handleInputChange(['colors', key], color)}
                                  />
                                  <Input
                                    value={value}
                                    onChange={(e) => handleInputChange(['colors', key], e.target.value)}
                                    className="mt-2"
                                  />
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="sidebar-colors">
                <AccordionTrigger>Sidebar Colors</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(theme.colors.sidebar).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label className="capitalize">{key}</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              style={{ backgroundColor: value }}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="capitalize">{key}</span>
                                <span>{value}</span>
                              </div>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-3">
                              <HexColorPicker
                                color={value}
                                onChange={(color) => handleInputChange(['colors', 'sidebar', key], color)}
                              />
                              <Input
                                value={value}
                                onChange={(e) => handleInputChange(['colors', 'sidebar', key], e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          <TabsContent value="typography" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={theme.font}
                  onValueChange={(value) => handleInputChange(['font'], value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontsLoading ? (
                      <SelectItem value="loading">Loading fonts...</SelectItem>
                    ) : (
                      fonts?.map((font) => (
                        <SelectItem key={font.family} value={font.family}>
                          {font.family}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(theme.fontSize).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key} Font Size</Label>
                    <Input
                      value={value}
                      onChange={(e) => handleInputChange(['fontSize', key], e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="spacing" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(theme.spacing).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key} Spacing</Label>
                  <Input
                    value={value}
                    onChange={(e) => handleInputChange(['spacing', key], e.target.value)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="effects" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(theme.borderRadius).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key} Border Radius</Label>
                    <Input
                      value={value}
                      onChange={(e) => handleInputChange(['borderRadius', key], e.target.value)}
                    />
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label>Shadows</Label>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(theme.shadows).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label className="capitalize">{key} Shadow</Label>
                      <Input
                        value={value}
                        onChange={(e) => handleInputChange(['shadows', key], e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={() => onSave(theme)}>
            Save Theme
          </Button>
        </div>
      </div>
      
      <div className="md:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your theme looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Text Elements</h3>
              <div className="space-y-1">
                <p className="text-lg">Large Text</p>
                <p>Normal Text</p>
                <p className="text-sm">Small Text</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Buttons</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Inputs</h3>
              <div className="space-y-2">
                <Input placeholder="Input field" />
                <div className="flex items-center space-x-2">
                  <Switch id="preview-switch" />
                  <Label htmlFor="preview-switch">Switch</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Card</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card content goes here.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">Cancel</Button>
                  <Button size="sm" className="ml-2">Submit</Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}