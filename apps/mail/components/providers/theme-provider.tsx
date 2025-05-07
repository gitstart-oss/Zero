'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useConnections } from '@/hooks/use-connections';
import { applyThemeProperties, loadGoogleFont } from '@/lib/theme-utils';
import { defaultThemeProperties, darkThemeProperties } from '@zero/db/theme_properties';
import type { ThemeProperties } from '@zero/db/theme_properties';
import { trpc } from '@/lib/trpc';
import { useTheme } from 'next-themes';

type ThemeContextType = {
  currentTheme: ThemeProperties | null;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: null,
  isLoading: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: connectionsData } = useConnections();
  const { theme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<ThemeProperties | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get active connection
  const activeConnection = connectionsData?.connections?.find(
    (connection) => connection.id === connectionsData?.activeConnection
  );
  
  // Fetch theme data if connection has a theme
  const { data: themeData } = trpc.themes.get.useQuery(
    { id: activeConnection?.themeId || '' },
    { enabled: !!activeConnection?.themeId }
  );
  
  // Apply theme when it changes
  useEffect(() => {
    const applyTheme = async () => {
      setIsLoading(true);
      
      let themeToApply: ThemeProperties;
      
      if (themeData) {
        // Use connection-specific theme if available
        themeToApply = themeData.properties as ThemeProperties;
        
        // Load font if needed
        if (themeToApply.fonts.body) {
          await loadGoogleFont(themeToApply.fonts.body.split(',')[0].trim());
        }
      } else {
        // Fall back to system theme preference
        themeToApply = theme === 'dark' ? darkThemeProperties : defaultThemeProperties;
      }
      
      // Apply theme properties to CSS variables
      applyThemeProperties(themeToApply);
      setCurrentTheme(themeToApply);
      setIsLoading(false);
    };
    
    applyTheme();
  }, [themeData, theme]);
  
  return (
    <ThemeContext.Provider value={{ currentTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useCustomTheme = () => useContext(ThemeContext);