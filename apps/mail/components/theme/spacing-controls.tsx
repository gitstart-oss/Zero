'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface SpacingControlsProps {
  label: string;
  value: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: string) => void;
}

export function SpacingControl({
  label,
  value,
  min = 0,
  max = 2,
  step = 0.1,
  unit = 'rem',
  onChange,
}: SpacingControlsProps) {
  // Parse numeric value from string (e.g., "0.5rem" -> 0.5)
  const [numericValue, setNumericValue] = useState(() => {
    const match = value.match(/^([\d.]+)/);
    return match ? parseFloat(match[1]) : min;
  });
  
  // Update numeric value when string value changes
  useEffect(() => {
    const match = value.match(/^([\d.]+)/);
    if (match) {
      setNumericValue(parseFloat(match[1]));
    }
  }, [value]);
  
  // Handle slider change
  const handleSliderChange = (newValue: number[]) => {
    const value = newValue[0];
    setNumericValue(value);
    onChange(`${value}${unit}`);
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= min && value <= max) {
      setNumericValue(value);
      onChange(`${value}${unit}`);
    }
  };
  
  return (
    <div className="space-y-2 py-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={numericValue}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            className="h-8 w-16"
          />
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <Slider
        value={[numericValue]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleSliderChange}
      />
    </div>
  );
}