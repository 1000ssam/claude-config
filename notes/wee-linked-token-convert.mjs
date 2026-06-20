// Deterministic hex -> shadcn HSL ("H S% L%") + WCAG contrast checks.
// Source of truth: wee-linked @theme tokens (dusty rose × mist blue).
// Run: node /mnt/c/dev/notes/wee-linked-token-convert.mjs

function hexToRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60; if (h < 0) h += 360;
  }
  return [Math.round(h), Math.round(s * 1000) / 10, Math.round(l * 1000) / 10];
}
function hslStr(hex) {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  return `${h} ${s}% ${l}%`;
}
// WCAG relative luminance + contrast
function lum([r, g, b]) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function contrast(h1, h2) {
  const L1 = lum(hexToRgb(h1)), L2 = lum(hexToRgb(h2));
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

const tokens = {
  // base
  'bg': '#ffffff', 'bg-tint': '#fbfafb', 'surface': '#ffffff',
  'ink': '#2b2630', 'muted': '#8c8590', 'faint': '#b6b0bb',
  'line': '#efebee', 'card-line': '#f1edf1',
  // rose (lead)
  'rose': '#e3aebf', 'rose-strong': '#d093a7', 'rose-ink': '#b0617e', 'rose-soft': '#faeef3',
  // blue (support)
  'blue': '#aec4e0', 'blue-ink': '#5a7fa6', 'blue-soft': '#eef4fb',
  // accent-strong (deep rose), lilac ink (chart)
  'accent-strong': '#8a4763', 'lilac-ink': '#6b569c',
  // derived sidebar greys
  'sidebar-bg': '#f6f3f5', 'sidebar-border': '#ebe6ea',
};

console.log('=== hex -> "H S% L%" ===');
for (const [k, v] of Object.entries(tokens)) {
  console.log(`${k.padEnd(14)} ${v}  ->  ${hslStr(v)}`);
}

console.log('\n=== WCAG contrast (key pairs) ===');
const pairs = [
  ['white-on-primary(rose-ink)', '#ffffff', '#b0617e'],
  ['white-on-primary-strong',     '#ffffff', '#8a4763'],
  ['white-on-sage(blue-ink)',     '#ffffff', '#5a7fa6'],
  ['ink-on-background(bg-tint)',   '#2b2630', '#fbfafb'],
  ['ink-on-card(white)',           '#2b2630', '#ffffff'],
  ['muted-on-background',          '#8c8590', '#fbfafb'],
  ['faint-on-background',          '#b6b0bb', '#fbfafb'],
  ['rose-ink-text-on-white',       '#b0617e', '#ffffff'],
  ['blue-ink-text-on-white',       '#5a7fa6', '#ffffff'],
  ['rose-ink-on-rose-soft',        '#b0617e', '#faeef3'],
  ['blue-ink-on-blue-soft',        '#5a7fa6', '#eef4fb'],
  ['ink-on-rose(pastel fill)',     '#2b2630', '#e3aebf'],
];
for (const [name, fg, bg] of pairs) {
  const c = contrast(fg, bg);
  const aa = c >= 4.5 ? 'AA' : c >= 3 ? 'AA-large' : 'FAIL';
  console.log(`${name.padEnd(30)} ${c.toString().padEnd(6)} ${aa}`);
}
