'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useActiveTheme } from '@/hooks/use-themes';
import { useSettings } from '@/hooks/use-settings';
import { useEffect } from 'react';

export function ThemeProvider({ children, ...props }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const { activeTheme } = useActiveTheme();
  
  // Apply theme properties to CSS variables
  useEffect(() => {
    if (!activeTheme) return;
    
    const root = document.documentElement;
    
    // Apply colors
    Object.entries(activeTheme.properties.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--${key}`, value);
      } else if (key === 'sidebar') {
        Object.entries(value).forEach(([sidebarKey, sidebarValue]) => {
          root.style.setProperty(`--sidebar-${sidebarKey}`, sidebarValue);
        });
      }
    });
    
    // Apply font
    if (activeTheme.properties.font) {
      const fontLink = document.createElement('link');
      fontLink.href = `https://fonts.googleapis.com/css2?family=${activeTheme.properties.font.replace(' ', '+')}&display=swap`;
      fontLink.rel = 'stylesheet';
      document.head.appendChild(fontLink);
      
      root.style.fontFamily = `'${activeTheme.properties.font}', sans-serif`;
    }
    
    // Apply other properties
    root.style.setProperty('--radius', activeTheme.properties.borderRadius.medium);
    
    return () => {
      // Clean up
      const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
      fontLinks.forEach((link) => link.remove());
    };
  }, [activeTheme]);
  
  return (
    <NextThemesProvider {...props} defaultTheme={settings?.colorTheme || 'system'}>
      {children}
    </NextThemesProvider>
  );
}