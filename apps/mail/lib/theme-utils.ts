import type { ThemeProperties } from '@zero/db/theme_properties';

// Convert theme properties to CSS variables
export function applyThemeProperties(properties: ThemeProperties) {
  const root = document.documentElement;
  
  // Apply colors
  Object.entries(properties.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${kebabCase(key)}`, value);
  });
  
  // Apply fonts
  root.style.setProperty('--font-body', properties.fonts.body);
  
  // Apply spacing
  Object.entries(properties.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--${kebabCase(key)}`, value);
  });
  
  // Apply shadows
  Object.entries(properties.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${kebabCase(key)}`, value);
  });
}

// Helper function to convert camelCase to kebab-case
export function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// Convert CSS HSL values to hex color
export function hslToHex(hsl: string): string {
  // Parse HSL value (format: "240 10% 3.9%")
  const [h, s, l] = hsl.split(' ').map(val => parseFloat(val.replace('%', '')));
  
  // Convert HSL to RGB
  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const lDecimal = l / 100;
  
  let r, g, b;
  
  if (sDecimal === 0) {
    r = g = b = lDecimal;
  } else {
    const q = lDecimal < 0.5 
      ? lDecimal * (1 + sDecimal) 
      : lDecimal + sDecimal - lDecimal * sDecimal;
    const p = 2 * lDecimal - q;
    
    r = hueToRgb(p, q, hDecimal + 1/3);
    g = hueToRgb(p, q, hDecimal);
    b = hueToRgb(p, q, hDecimal - 1/3);
  }
  
  // Convert RGB to hex
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

// Convert hex color to HSL value
export function hexToHsl(hex: string): string {
  // Convert hex to RGB
  let r = 0, g = 0, b = 0;
  
  // 3 digits
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16) / 255;
    g = parseInt(hex[2] + hex[2], 16) / 255;
    b = parseInt(hex[3] + hex[3], 16) / 255;
  } 
  // 6 digits
  else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16) / 255;
    g = parseInt(hex.substring(3, 5), 16) / 255;
    b = parseInt(hex.substring(5, 7), 16) / 255;
  }
  
  // Find greatest and smallest channel values
  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  let h = 0, s = 0, l = 0;
  
  // Calculate hue
  if (delta === 0) {
    h = 0;
  } else if (cmax === r) {
    h = ((g - b) / delta) % 6;
  } else if (cmax === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }
  
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  // Calculate lightness
  l = (cmax + cmin) / 2;
  
  // Calculate saturation
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  
  // Convert to percentages
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);
  
  return `${h} ${s}% ${l}%`;
}

// List of popular Google Fonts
export const popularGoogleFonts = [
  'Geist',
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Nunito',
  'Playfair Display',
  'Source Sans Pro',
  'Oswald',
  'Merriweather',
  'Ubuntu',
  'Rubik',
  'Work Sans',
  'Quicksand',
  'Mulish',
  'Noto Sans',
  'Roboto Condensed',
];

// Function to load a Google Font dynamically
export async function loadGoogleFont(fontName: string) {
  if (!fontName || fontName === 'Geist') return; // Geist is already loaded
  
  const formattedName = fontName.replace(/\s+/g, '+');
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@400;500;600;700&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  
  return new Promise<void>((resolve) => {
    link.onload = () => resolve();
  });
}