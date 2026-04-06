// Convert hex color to RGB
const hexToRgb = (hex) => {
  hex = hex.replace('#', '');
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
};

// Parse HSL color string and convert to RGB values
// Also accepts hex colors
export const hslToRgb = (colorString) => {
  // If it's a hex color, convert it
  if (colorString.startsWith('#')) {
    return hexToRgb(colorString);
  }

  const match = colorString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return { r: 0, g: 111, b: 207 }; // fallback to Amex blue

  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.floor(r * 255),
    g: Math.floor(g * 255),
    b: Math.floor(b * 255)
  };
};

// Parse HSL string to individual components
export const parseHsl = (hslString) => {
  const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return { h: 217, s: 100, l: 50 }; // fallback to Amex blue

  return {
    h: parseInt(match[1]),
    s: parseInt(match[2]),
    l: parseInt(match[3])
  };
};

// Generate a darker shade of the color by reducing lightness
export const getDarkerShade = (hslString, lightnessReduction = 30) => {
  const { h, s, l } = parseHsl(hslString);
  const newL = Math.max(0, l - lightnessReduction);
  return `hsl(${h}, ${s}%, ${newL}%)`;
};

// Generate multiple depth shades from a base color
export const getColorShades = (hslString) => {
  const { h, s, l } = parseHsl(hslString);
  return {
    light: `hsl(${h}, ${s}%, ${Math.min(100, l + 10)}%)`,     // lighter
    base: hslString,                                            // original
    medium: `hsl(${h}, ${s}%, ${Math.max(0, l - 15)}%)`,      // medium dark
    dark: `hsl(${h}, ${s}%, ${Math.max(0, l - 30)}%)`         // darker
  };
};
