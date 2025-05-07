'use client';

import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { hslToHex, hexToHsl } from '@/lib/theme-utils';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [hexColor, setHexColor] = useState(() => hslToHex(value));
  
  // Update hex color when HSL value changes
  useEffect(() => {
    setHexColor(hslToHex(value));
  }, [value]);
  
  // Handle hex color input change
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHexColor(newHex);
    
    // Only update HSL if hex is valid
    if (/^#[0-9A-F]{6}$/i.test(newHex)) {
      const newHsl = hexToHsl(newHex);
      onChange(newHsl);
    }
  };
  
  // Handle color picker change
  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHexColor(newHex);
    const newHsl = hexToHsl(newHex);
    onChange(newHsl);
  };
  
  return (
    <div className="flex items-center justify-between py-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={hexColor}
          onChange={handleHexChange}
          className="h-8 w-20"
        />
        <Popover>
          <PopoverTrigger asChild>
            <div
              className="h-8 w-8 cursor-pointer rounded-md border"
              style={{ backgroundColor: hexColor }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="end">
            <input
              type="color"
              value={hexColor}
              onChange={handleColorPickerChange}
              className="h-32 w-32 cursor-pointer"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}