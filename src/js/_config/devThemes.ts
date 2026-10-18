// Themes for checking the UI across colour extremes, used by /dev/components and the colour contrast audit.
// Presets use a theme key from themes.ts; custom entries set the custom theme colours (overwriting any saved ones)

interface DevTheme {
  label: string;
  theme?: string;
  background?: string;
  primary?: string;
  text?: string;
  tinting?: 'auto' | 'darken' | 'lighten';
}

export const devThemes: DevTheme[] = [
  { label: 'Chromatix / Magenta', theme: 'chromatix-magenta' },
  { label: 'Chromatix / Teal', theme: 'chromatix-teal' },
  { label: 'White / Magenta', theme: 'white-magenta' },
  { label: 'Black / Magenta', theme: 'black-magenta' },
  { label: 'White / Mint', theme: 'white-mint' },
  { label: 'Custom / Blue + Dark', background: '#0d7eae', primary: '#ffa8cb', text: '#ffffff', tinting: 'auto' },
  { label: 'Custom / Blue + Light', background: '#0d7dad', primary: '#ffa8cb', text: '#ffffff', tinting: 'auto' },
  { label: 'Custom / Blue + Red', background: '#b3e8ff', primary: '#0033ff', text: '#9e0000', tinting: 'auto' },
  { label: 'Custom / Sepia', background: '#f4ecd8', primary: '#a0522d', text: '#3b2f2f', tinting: 'auto' },
  { label: 'Custom / Forest', background: '#0f1f17', primary: '#7bd389', text: '#e8f5e9', tinting: 'auto' },
  { label: 'Custom / Grey + White', background: '#808080', primary: '#f7277a', text: '#ffffff', tinting: 'auto' },
  { label: 'Custom / Grey + Black', background: '#808080', primary: '#f7277a', text: '#000000', tinting: 'auto' },
  { label: 'Custom / Dark Core', background: '#021c27', primary: '#14323f', text: '#ffffff', tinting: 'auto' },
  { label: 'Custom / Low Contrast', background: '#2a2a2a', primary: '#f7277a', text: '#6a6a6a', tinting: 'auto' },
];
