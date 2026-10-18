import chroma from 'chroma-js';

import decimalMultiplier from './decimalMultiplier';
import decimalToHex from './decimalToHex';

export type ColorContrast = 'default' | 'medium' | 'high';
type ColorTinting = 'auto' | 'darken' | 'lighten';

export interface ColorTokensInput {
  background: string;
  text: string;
  core: string;
  contrast: ColorContrast;
  tinting: ColorTinting;
}

interface ColorTokens {
  tokens: Record<string, string | number>;
  isLightTheme: boolean;
  isLightText: boolean;
}

// Values that change with the contrast setting: the surface step multipliers, the opacity multiplier, and the minimum
// contrast for button text, focus borders and hovers
interface ContrastLevel {
  chromaMultiplierLow: number;
  chromaMultiplierHigh: number;
  opacityMultiplier: number;
  coreTextContrast: number;
  focusContrast: number;
  hoverContrast: number;
}

export const contrastLevels: Record<ColorContrast, ContrastLevel> = {
  default: {
    chromaMultiplierLow: 1.1,
    chromaMultiplierHigh: 1.1,
    opacityMultiplier: 1,
    coreTextContrast: 3,
    focusContrast: 3,
    hoverContrast: 1.15,
  },
  medium: {
    chromaMultiplierLow: 1.3,
    chromaMultiplierHigh: 1.4,
    opacityMultiplier: 1.5,
    coreTextContrast: 3.1,
    focusContrast: 3.5,
    hoverContrast: 1.2,
  },
  high: {
    chromaMultiplierLow: 1.5,
    chromaMultiplierHigh: 1.7,
    opacityMultiplier: 2,
    coreTextContrast: 3.2,
    focusContrast: 4,
    hoverContrast: 1.25,
  },
};

/**
 * Generates the theme's CSS custom properties from its three base colours, scaled by the contrast setting.
 * Tinting decides whether surfaces darken or lighten; `auto` picks from the background colour.
 */
const getColorTokens = ({ background, text, core, contrast, tinting }: ColorTokensInput): ColorTokens => {
  // ======================================================================
  // SETTINGS
  // ======================================================================

  // Normalise to 6-digit hex, since opacity variants are built by appending an alpha suffix (e.g. '#fff' would break)
  const toHex = (color: string): string => chroma(color).hex('rgb');

  const colorCore = toHex(core);
  const colorText = toHex(text);
  const colorPrimaryBg = toHex(background);

  // Falls back to the default level for an unknown or unset contrast setting
  const {
    chromaMultiplierLow,
    chromaMultiplierHigh,
    opacityMultiplier,
    coreTextContrast,
    focusContrast,
    hoverContrast,
  } = contrastLevels[contrast] ?? contrastLevels.default;

  const primaryBackgroundChroma = chroma(colorPrimaryBg);

  const isLightTheme =
    chroma.contrast(primaryBackgroundChroma.hex(), '#000000') >=
    chroma.contrast(primaryBackgroundChroma.hex(), '#ffffff');

  const isLightText =
    chroma.contrast(chroma(colorText).hex(), '#000000') >= chroma.contrast(chroma(colorText).hex(), '#ffffff');

  const isActualLightTheme = tinting === 'darken' || (tinting === 'auto' && isLightTheme);

  // ======================================================================
  // HELPERS
  // ======================================================================

  // A contrast-scaled opacity, for whole elements
  const scaledOpacity = (opacity: number): number => decimalMultiplier(opacityMultiplier, opacity);

  // The text colour at a contrast-scaled opacity, as hex with an alpha suffix
  const textOpacity = (opacity: number): string => colorText + decimalToHex(scaledOpacity(opacity));

  // The text colour at a contrast-scaled opacity over a background, flattened to a solid hex
  const flattenText = (background: string, opacity: number): string =>
    chroma.mix(background, colorText, scaledOpacity(opacity), 'rgb').hex();

  // The lowest contrast of a colour against several backgrounds
  const contrastAgainst = (color: string, backgrounds: string[]): number =>
    Math.min(...backgrounds.map((background) => chroma.contrast(color, background)));

  // Binary searches amounts from 0 to `max` for the smallest that makes `make(amount)` reach a target contrast against
  // every background
  const searchAtContrast = (
    make: (amount: number) => string,
    max: number,
    backgrounds: string[],
    target: number
  ): string => {
    let low = 0;
    let high = max;
    for (let step = 0; step < 12; step++) {
      const middle = (low + high) / 2;
      if (contrastAgainst(make(middle), backgrounds) >= target) high = middle;
      else low = middle;
    }
    return make(high);
  };

  // Mixes a background towards another colour just far enough to reach a target contrast against it. Keeps `current`
  // if it already reaches the target, and falls back to the other colour itself when the colours can't reach it
  const mixAtContrast = (background: string, towards: string, target: number, current: string): string => {
    if (chroma.contrast(current, background) >= target) return current;
    if (chroma.contrast(towards, background) <= target) return towards;

    const mix = (amount: number): string => chroma.mix(background, towards, amount, 'rgb').hex();
    return searchAtContrast(mix, 1, [background], target);
  };

  // Shifts a colour towards another's lightness: darker if it's lighter than the target, otherwise lighter
  const shiftTowards = (color: string, amount: number, target: string): string =>
    chroma(color).luminance() > chroma(target).luminance()
      ? chroma(color).darken(amount).hex()
      : chroma(color).brighten(amount).hex();

  // Shifts a colour towards the text colour's lightness (in Lab, so it keeps its hue) just far enough to reach a target
  // contrast against every background. Keeps the colour if it already reaches the target, and falls back to the better
  // of the colour and the text colour when even the furthest shift (fully black or white) can't reach it
  const shiftAtContrast = (color: string, backgrounds: string[], target: number): string => {
    if (contrastAgainst(color, backgrounds) >= target) return color;

    const shift = (amount: number): string => shiftTowards(color, amount, colorText);
    if (contrastAgainst(shift(6), backgrounds) < target)
      return contrastAgainst(colorText, backgrounds) > contrastAgainst(color, backgrounds) ? colorText : color;
    return searchAtContrast(shift, 6, backgrounds, target);
  };

  // ======================================================================
  // CORE
  // ======================================================================

  // Core hover and border move away from the background: darker on light themes, lighter on dark themes. The
  // border moves twice as far, so it stays visible against the hover fill
  const shiftCore = (amount: number): string =>
    isActualLightTheme ? chroma(colorCore).darken(amount).hex() : chroma(colorCore).brighten(amount).hex();
  const colorCoreHover = shiftCore(0.25 * chromaMultiplierLow);
  const colorCoreBorder = shiftCore(0.5 * chromaMultiplierLow);

  // Whether the text colour reads better on core than a background, and whether that background is unreadable on core
  const textReadsBetterOnCore = (background: string): boolean =>
    chroma.contrast(colorText, colorCore) > chroma.contrast(background, colorCore);
  const isUnreadableOnCore = (background: string): boolean =>
    chroma.contrast(background, colorCore) < coreTextContrast && textReadsBetterOnCore(background);

  // ======================================================================
  // SURFACES
  // ======================================================================

  let colorBlackout: string;

  let colorSecondaryBg: string;
  let colorSecondaryBorder: string;
  let colorSecondaryHover: string;
  let colorSecondaryActive: string;

  let colorTertiaryBg: string;
  let colorTertiaryBorder: string;
  let colorTertiaryHover: string;

  // [NOTE] Optional tinting maybe to be added in future

  // // Tint secondary and tertiary colours using the core colour
  // const [red, green, blue] = primaryBackgroundChroma.rgb();
  // const isNeutralBackground = Math.max(red, green, blue) - Math.min(red, green, blue) <= 2;
  // const shouldApplyCoreTint = isLightTheme && isNeutralBackground;

  // if (shouldApplyCoreTint) {
  //   const applyCoreTint = (color: string): string => chroma.mix(color, colorCore, 0.02, 'lab').hex();

  //   colorSecondaryBg = applyCoreTint(colorSecondaryBg);
  //   colorSecondaryBorder = applyCoreTint(colorSecondaryBorder);
  //   colorCardOnPrimaryBg = applyCoreTint(colorCardOnPrimaryBg);
  //   colorSecondaryHover = applyCoreTint(colorSecondaryHover);
  //   colorSecondaryActive = applyCoreTint(colorSecondaryActive);

  //   colorTertiaryBg = applyCoreTint(colorTertiaryBg);
  //   colorTertiaryBorder = applyCoreTint(colorTertiaryBorder);
  //   colorTertiaryHover = applyCoreTint(colorTertiaryHover);
  // }

  // Light theme handling (new)
  if (isActualLightTheme) {
    colorBlackout =
      chroma(colorPrimaryBg)
        .darken(0.2 * chromaMultiplierHigh)
        .hex() + decimalToHex(scaledOpacity(0.9));

    colorSecondaryBg = chroma(colorPrimaryBg)
      .darken(0.2 * chromaMultiplierLow)
      .hex();
    colorSecondaryBorder = chroma(colorPrimaryBg)
      .darken(0.6 * chromaMultiplierHigh)
      .hex();
    colorSecondaryHover = chroma(colorPrimaryBg)
      .darken(0.4 * chromaMultiplierHigh)
      .hex();
    colorSecondaryActive = chroma(colorPrimaryBg)
      .darken(0.6 * chromaMultiplierHigh)
      .hex();

    colorTertiaryBg = chroma(colorPrimaryBg)
      .darken(0.6 * chromaMultiplierLow)
      .hex();
    colorTertiaryBorder = chroma(colorPrimaryBg)
      .darken(0.9 * chromaMultiplierHigh)
      .hex();
    colorTertiaryHover = chroma(colorPrimaryBg)
      .darken(0.8 * chromaMultiplierHigh)
      .hex();
  }

  // Dark theme handling
  else {
    colorBlackout =
      chroma(colorPrimaryBg)
        .darken(0.5 * chromaMultiplierHigh)
        .desaturate(0.35)
        .hex() + decimalToHex(scaledOpacity(0.8));

    colorSecondaryBg = chroma(colorPrimaryBg)
      .brighten(0.4 * chromaMultiplierHigh)
      .hex();
    colorSecondaryBorder = chroma(colorPrimaryBg)
      .brighten(0.8 * chromaMultiplierHigh)
      .hex();
    colorSecondaryHover = chroma(colorPrimaryBg)
      .brighten(0.6 * chromaMultiplierHigh)
      .hex();
    colorSecondaryActive = chroma(colorPrimaryBg)
      .brighten(0.75 * chromaMultiplierHigh)
      .hex();

    colorTertiaryBg = chroma(colorPrimaryBg)
      .brighten(0.9 * chromaMultiplierHigh)
      .hex();
    colorTertiaryBorder = chroma(colorPrimaryBg)
      .brighten(1.2 * chromaMultiplierHigh)
      .hex();
    colorTertiaryHover = chroma(colorPrimaryBg)
      .brighten(1.1 * chromaMultiplierHigh)
      .hex();
  }

  // Hovers move further towards their surface's border where needed, to reach the hover contrast against the fill
  colorSecondaryHover = mixAtContrast(colorSecondaryBg, colorSecondaryBorder, hoverContrast, colorSecondaryHover);
  colorTertiaryHover = mixAtContrast(colorTertiaryBg, colorTertiaryBorder, hoverContrast, colorTertiaryHover);

  // ======================================================================
  // BUTTONS
  // ======================================================================

  // Core text is the surface the core element sits on, switching to the text colour where that surface is unreadable
  // on core. Both surfaces switch together when the text colour reads better than both, so a theme stays consistent
  const shouldSwitchCoreText =
    (isUnreadableOnCore(colorPrimaryBg) || isUnreadableOnCore(colorSecondaryBg)) &&
    textReadsBetterOnCore(colorPrimaryBg) &&
    textReadsBetterOnCore(colorSecondaryBg);
  const coreText = (background: string): string =>
    shouldSwitchCoreText || isUnreadableOnCore(background) ? colorText : background;

  // The mono border is the text colour, and the fill is the text colour shifted towards the background. The hover
  // sits halfway between them, so the border stays visible against it
  const colorButtonMonoBg = shiftTowards(colorText, 0.6 * chromaMultiplierHigh, colorPrimaryBg);
  const colorButtonMonoHover = shiftTowards(colorText, 0.3 * chromaMultiplierHigh, colorPrimaryBg);

  // Button borders move just far enough towards the text colour to stay visible against the hover
  const colorButtonOnPrimaryBorder = mixAtContrast(colorSecondaryHover, colorText, 1.05, colorSecondaryBorder);
  const colorButtonOnSecondaryBorder = mixAtContrast(colorTertiaryHover, colorText, 1.05, colorTertiaryBorder);

  // ======================================================================
  // CARDS
  // ======================================================================

  // Ghost cards on secondary deliberately use the secondary border on light themes, so it's near invisible
  const colorCardGhostOnSecondaryHoverBorder = isActualLightTheme ? colorSecondaryBorder : colorTertiaryBorder;

  // ======================================================================
  // CONTROLS AND FIELDS
  // ======================================================================

  // Focus borders start as the text colour at 30% over their background, strengthened where needed to reach the focus
  // contrast (3 at default, the WCAG minimum for UI parts)
  const focusBorder = (background: string): string =>
    mixAtContrast(background, colorText, focusContrast, flattenText(background, 0.3));

  // Controls on secondary (the sidebar search, release banner and user menu) share one look, dropping back to the
  // primary background on light themes. Fields on secondary (e.g. modal inputs) use the same values
  const colorControlOnSecondaryBg = isActualLightTheme ? colorPrimaryBg : colorTertiaryBg;
  const colorControlOnSecondaryBorder = isActualLightTheme ? colorSecondaryBorder : colorTertiaryBorder;
  const colorControlOnSecondaryHover = isActualLightTheme ? colorSecondaryBg : colorTertiaryHover;
  const colorControlOnSecondaryFocusBorder = focusBorder(colorControlOnSecondaryBg);

  const colorFieldOnPrimaryFocusBorder = focusBorder(colorSecondaryBg);

  // ======================================================================
  // CORE ACCENTS
  // ======================================================================

  // Core used as a fill on a surface (checked checkboxes, slider fills), shifted where needed to reach the focus
  // contrast against it
  const colorCoreAccentOnPrimary = shiftAtContrast(colorCore, [colorPrimaryBg], focusContrast);
  const colorCoreAccentOnSecondary = shiftAtContrast(colorCore, [colorSecondaryBg], focusContrast);

  // Core on secondary items that may also be highlighted (selected select items), reaching the focus contrast against
  // both the surface and its hover, since the selected item is highlighted when the popup opens
  const colorCoreAccentOnSecondaryItem = shiftAtContrast(
    colorCore,
    [colorSecondaryBg, colorSecondaryHover],
    focusContrast
  );

  // ======================================================================
  // CHECKBOXES
  // ======================================================================

  // Unchecked checkbox and radio borders are the text colour at 50% over the primary background
  const colorCheckboxOnPrimaryBorder = flattenText(colorPrimaryBg, 0.5);

  // The tick on a checked fill is the primary background, so it reads as well as the fill stands out
  const colorCheckboxOnPrimaryCheckedTick = colorPrimaryBg;

  // ======================================================================
  // DISABLED
  // ======================================================================

  // Disabled states don't scale with contrast, so they stay clearly disabled at every level
  const opacityDisabled = 0.4;
  const opacityDisabledIcon = 0.6;
  const colorDisabledText = colorText + decimalToHex(0.4);
  const colorButtonDisabledText = colorText + decimalToHex(0.3);
  const colorButtonDisabledBg = colorText + decimalToHex(0.05);

  // ======================================================================
  // SHADOWS
  // ======================================================================

  const shadowLg = isActualLightTheme ? '0 4px 20px rgba(0, 0, 0, 0.1)' : '0 2px 20px rgba(0, 0, 0, 0.35)';
  const shadowMd = isActualLightTheme ? '0 4px 8px rgba(0, 0, 0, 0.1)' : '0 2px 10px rgba(0, 0, 0, 0.35)';
  const shadowSm = isActualLightTheme ? '0 2px 4px rgba(0, 0, 0, 0.05)' : '0 2px 6px rgba(0, 0, 0, 0.2)';

  // ======================================================================
  // TOKENS
  // ======================================================================

  const tokens: Record<string, string | number> = {
    '--color-core-main': colorCore,
    '--color-core-border': colorCoreBorder,
    '--color-core-hover': colorCoreHover,
    '--color-core-on-primary-text': coreText(colorPrimaryBg),
    '--color-core-on-secondary-text': coreText(colorSecondaryBg),

    '--color-text': colorText,
    '--color-blackout': colorBlackout,

    '--color-primary-bg': colorPrimaryBg,

    '--color-secondary-bg': colorSecondaryBg,
    '--color-secondary-border': colorSecondaryBorder,
    '--color-secondary-release-bg': colorSecondaryBorder,

    '--color-tertiary-bg': colorTertiaryBg,
    '--color-tertiary-border': colorTertiaryBorder,

    '--color-button-mono-bg': colorButtonMonoBg,
    '--color-button-mono-border': colorText,
    '--color-button-mono-hover': colorButtonMonoHover,
    '--color-button-mono-text': colorPrimaryBg,

    '--color-button-on-primary-bg': colorSecondaryBg,
    '--color-button-on-primary-border': colorButtonOnPrimaryBorder,
    '--color-button-on-primary-hover': colorSecondaryHover,
    '--color-button-on-primary-text': colorText,

    '--color-button-on-secondary-bg': colorTertiaryBg,
    '--color-button-on-secondary-border': colorButtonOnSecondaryBorder,
    '--color-button-on-secondary-hover': colorTertiaryHover,
    '--color-button-on-secondary-text': colorText,

    '--color-button-outline-on-primary-border': colorSecondaryBorder,
    '--color-button-outline-on-primary-hover': colorSecondaryBg,
    '--color-button-outline-on-primary-text': colorText,

    '--color-button-outline-on-secondary-border': colorTertiaryBorder,
    '--color-button-outline-on-secondary-hover': colorTertiaryBg,
    '--color-button-outline-on-secondary-text': colorText,

    '--color-button-disabled-bg': colorButtonDisabledBg,
    '--color-button-disabled-text': colorButtonDisabledText,

    '--color-card-on-primary-bg': colorSecondaryBg,
    '--color-card-on-primary-border': colorSecondaryBorder,
    '--color-card-on-primary-hover': colorTertiaryBg,
    '--color-card-on-primary-hover-border': colorTertiaryBorder,

    '--color-card-ghost-on-primary-hover': colorSecondaryBg,
    '--color-card-ghost-on-primary-hover-border': colorSecondaryBorder,

    '--color-card-ghost-on-secondary-hover': colorTertiaryBg,
    '--color-card-ghost-on-secondary-hover-border': colorCardGhostOnSecondaryHoverBorder,

    // Controls are things like search and release notes in the sidebar menu
    '--color-control-on-secondary-bg': colorControlOnSecondaryBg,
    '--color-control-on-secondary-border': colorControlOnSecondaryBorder,
    '--color-control-on-secondary-hover': colorControlOnSecondaryHover,
    '--color-control-on-secondary-focus-border': colorControlOnSecondaryFocusBorder,
    '--color-control-on-secondary-text': colorText,

    '--color-field-on-primary-bg': colorSecondaryBg,
    '--color-field-on-primary-border': colorSecondaryBorder,
    '--color-field-on-primary-focus-border': colorFieldOnPrimaryFocusBorder,
    '--color-field-on-primary-text': colorText,

    '--color-field-on-secondary-bg': colorControlOnSecondaryBg,
    '--color-field-on-secondary-border': colorControlOnSecondaryBorder,
    '--color-field-on-secondary-focus-border': colorControlOnSecondaryFocusBorder,
    '--color-field-on-secondary-text': colorText,

    '--color-checkbox-on-primary-border': colorCheckboxOnPrimaryBorder,
    '--color-checkbox-on-primary-checked-bg': colorCoreAccentOnPrimary,
    '--color-checkbox-on-primary-checked-tick': colorCheckboxOnPrimaryCheckedTick,

    '--color-slider-on-primary-fill': colorCoreAccentOnPrimary,
    '--color-slider-on-secondary-fill': colorCoreAccentOnSecondary,

    '--color-select-on-secondary-checked-text': colorCoreAccentOnSecondaryItem,

    '--color-disabled-text': colorDisabledText,

    // Items are slightly miscellaneous elements used throughout
    '--color-item-on-core-hover': colorCoreHover,
    '--color-item-on-primary-hover': colorSecondaryBg,
    '--color-item-on-secondary-hover': colorSecondaryHover,
    '--color-item-on-secondary-active': colorSecondaryActive,
    '--color-item-on-tertiary-hover': colorTertiaryHover,

    '--color-opacity-0025': textOpacity(0.025),
    '--color-opacity-005': textOpacity(0.05),
    '--color-opacity-01': textOpacity(0.1),
    '--color-opacity-015': textOpacity(0.15),
    '--color-opacity-02': textOpacity(0.2),
    '--color-opacity-025': textOpacity(0.25),
    '--color-opacity-03': textOpacity(0.3),
    '--color-opacity-04': textOpacity(0.4),
    '--color-opacity-05': textOpacity(0.5),
    '--color-opacity-06': textOpacity(0.6),
    '--color-opacity-07': textOpacity(0.7),

    '--opacity-02': scaledOpacity(0.2),
    '--opacity-025': scaledOpacity(0.25),
    '--opacity-03': scaledOpacity(0.3),
    '--opacity-04': scaledOpacity(0.4),
    '--opacity-05': scaledOpacity(0.5),
    '--opacity-06': scaledOpacity(0.6),

    '--opacity-disabled': opacityDisabled,
    '--opacity-disabled-icon': opacityDisabledIcon,

    '--shadow-lg': shadowLg,
    '--shadow-md': shadowMd,
    '--shadow-sm': shadowSm,
  };

  return { tokens, isLightTheme: isActualLightTheme, isLightText };
};

export default getColorTokens;
