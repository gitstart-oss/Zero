'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { popularGoogleFonts, loadGoogleFont } from '@/lib/theme-utils';

interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function FontSelector({ value, onChange }: FontSelectorProps) {
  const [selectedFont, setSelectedFont] = useState(() => {
    // Extract font name from font family string (e.g., "Inter, sans-serif" -> "Inter")
    return value.split(',')[0].trim();
  });
  
  // Load font when selected
  useEffect(() => {
    loadGoogleFont(selectedFont);
  }, [selectedFont]);
  
  const handleFontChange = (fontName: string) => {
    setSelectedFont(fontName);
    onChange(`${fontName}, sans-serif`);
  };
  
  return (
    <div className="flex items-center justify-between py-2">
      <Label className="text-sm font-medium">Font</Label>
      <div className="w-[180px]">
        <Select value={selectedFont} onValueChange={handleFontChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {popularGoogleFonts.map((font) => (
              <SelectItem key={font} value={font} style={{ fontFamily: `${font}, sans-serif` }}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}