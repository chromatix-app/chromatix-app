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

/**
 * Generates the theme's CSS custom properties from its three base colours, scaled by the contrast setting.
 * Tinting decides whether surfaces darken or lighten; `auto` picks from the background colour.
 */
const getColorTokens = ({ background, text, core, contrast, tinting }: ColorTokensInput): ColorTokens => {
  // Normalise to 6-digit hex, since opacity variants are built by appending an alpha suffix (e.g. '#fff' would break)
  const toHex = (color: string): string => chroma(color).hex('rgb');

  const colorCore = toHex(core);
  const colorText = toHex(text);
  const colorPrimaryBg = toHex(background);

  const contrastLevel = contrast === 'high' ? 'high' : contrast === 'medium' ? 'medium' : 'default';

  const chromaMultiplierLow = contrastLevel === 'high' ? 1.5 : contrastLevel === 'medium' ? 1.3 : 1.1;
  const chromaMultiplierHigh = contrastLevel === 'high' ? 1.7 : contrastLevel === 'medium' ? 1.4 : 1.1;
  const opacityMultiplier = contrastLevel === 'high' ? 2 : contrastLevel === 'medium' ? 1.5 : 1;

  const primaryBackgroundChroma = chroma(colorPrimaryBg);

  // [NOTE] Old method
  // const isLightTheme = primaryBackgroundChroma.luminance() > 0.6;
  const isLightTheme =
    chroma.contrast(primaryBackgroundChroma.hex(), '#000000') >=
    chroma.contrast(primaryBackgroundChroma.hex(), '#ffffff');

  const isLightText =
    chroma.contrast(chroma(colorText).hex(), '#000000') >= chroma.contrast(chroma(colorText).hex(), '#ffffff');

  const isActualLightTheme = tinting === 'darken' || (tinting === 'auto' && isLightTheme);

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
        .hex() + decimalToHex(decimalMultiplier(opacityMultiplier, 0.9));

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
        .hex() + decimalToHex(decimalMultiplier(opacityMultiplier, 0.8));

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

  const colorOpacity0025 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.025));
  const colorOpacity005 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.05));
  const colorOpacity01 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.1));
  const colorOpacity015 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.15));
  const colorOpacity02 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.2));
  const colorOpacity025 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.25));
  const colorOpacity03 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.3));
  const colorOpacity04 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.4));
  const colorOpacity05 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.5));
  const colorOpacity06 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.6));
  const colorOpacity07 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.7));

  const opacity02 = decimalMultiplier(opacityMultiplier, 0.2);
  const opacity025 = decimalMultiplier(opacityMultiplier, 0.25);
  const opacity03 = decimalMultiplier(opacityMultiplier, 0.3);
  const opacity04 = decimalMultiplier(opacityMultiplier, 0.4);
  const opacity05 = decimalMultiplier(opacityMultiplier, 0.5);
  const opacity06 = decimalMultiplier(opacityMultiplier, 0.6);

  // Disabled states don't scale with contrast, so they stay clearly disabled at every level
  const opacityDisabled = 0.4;
  const opacityDisabledIcon = 0.6;
  const colorDisabledText = colorText + decimalToHex(0.4);
  const colorButtonDisabledText = colorText + decimalToHex(0.3);
  const colorButtonDisabledBg = colorText + decimalToHex(0.05);

  const shadowLg = isActualLightTheme ? '0 4px 20px rgba(0, 0, 0, 0.1)' : '0 2px 20px rgba(0, 0, 0, 0.35)';
  const shadowMd = isActualLightTheme ? '0 4px 8px rgba(0, 0, 0, 0.1)' : '0 2px 10px rgba(0, 0, 0, 0.35)';
  const shadowSm = isActualLightTheme ? '0 2px 4px rgba(0, 0, 0, 0.05)' : '0 2px 6px rgba(0, 0, 0, 0.2)';

  // The text colour at a contrast-scaled opacity over a background, flattened to a solid hex
  const flattenText = (background: string, opacity: number): string =>
    chroma.mix(background, colorText, decimalMultiplier(opacityMultiplier, opacity), 'rgb').hex();

  // The text colour mixed over a background just far enough to reach a target contrast. Keeps `current` if it already
  // reaches the target, and falls back to the text colour itself when the colours can't reach it
  const textAtContrast = (background: string, target: number, current: string): string => {
    if (chroma.contrast(current, background) >= target) return current;
    if (chroma.contrast(colorText, background) <= target) return colorText;

    // Binary search for the smallest mix that reaches the target
    const mix = (amount: number): string => chroma.mix(background, colorText, amount, 'rgb').hex();
    let low = 0;
    let high = 1;
    for (let step = 0; step < 12; step++) {
      const middle = (low + high) / 2;
      if (chroma.contrast(mix(middle), background) >= target) high = middle;
      else low = middle;
    }
    return mix(high);
  };

  // Focus borders start as the text colour at 30% over their background, strengthened where needed to reach the WCAG
  // minimum for UI parts (3), raised with the contrast setting
  const focusContrast = contrastLevel === 'high' ? 4 : contrastLevel === 'medium' ? 3.5 : 3;
  const focusBorder = (background: string): string =>
    textAtContrast(background, focusContrast, flattenText(background, 0.3));

  // Shifts a colour towards another's lightness: darker if it's lighter than the target, otherwise lighter
  const shiftTowards = (color: string, amount: number, target: string): string =>
    chroma(color).luminance() > chroma(target).luminance()
      ? chroma(color).darken(amount).hex()
      : chroma(color).brighten(amount).hex();

  // Core hover and border move away from the background: darker on light themes, lighter on dark themes. The
  // border moves twice as far, so it stays visible against the hover fill
  const shiftCore = (amount: number): string =>
    isActualLightTheme ? chroma(colorCore).darken(amount).hex() : chroma(colorCore).brighten(amount).hex();
  const colorCoreHover = shiftCore(0.25 * chromaMultiplierLow);
  const colorCoreBorder = shiftCore(0.5 * chromaMultiplierLow);

  // The mono border is the text colour, and the fill is the text colour shifted towards the background. The hover
  // sits halfway between them, so the border stays visible against it
  const colorButtonMonoBg = shiftTowards(colorText, 0.6 * chromaMultiplierHigh, colorPrimaryBg);
  const colorButtonMonoHover = shiftTowards(colorText, 0.3 * chromaMultiplierHigh, colorPrimaryBg);

  // Ghost cards on secondary deliberately use the secondary border on light themes, so it's near invisible
  const colorCardGhostOnSecondaryHoverBorder = isActualLightTheme ? colorSecondaryBorder : colorTertiaryBorder;

  // Controls on secondary (the sidebar search, release banner and user menu) share one look, dropping back to the
  // primary background on light themes. Fields on secondary (e.g. modal inputs) use the same values
  const colorControlOnSecondaryBg = isActualLightTheme ? colorPrimaryBg : colorTertiaryBg;
  const colorControlOnSecondaryBorder = isActualLightTheme ? colorSecondaryBorder : colorTertiaryBorder;
  const colorControlOnSecondaryHover = isActualLightTheme ? colorSecondaryBg : colorTertiaryHover;
  const colorControlOnSecondaryFocusBorder = focusBorder(colorControlOnSecondaryBg);

  const colorFieldOnPrimaryFocusBorder = focusBorder(colorSecondaryBg);

  // Unchecked checkbox and radio borders are the text colour at 50% over the primary background
  const colorCheckboxOnPrimaryBorder = flattenText(colorPrimaryBg, 0.5);

  const tokens: Record<string, string | number> = {
    '--color-core-main': colorCore,
    '--color-core-border': colorCoreBorder,
    '--color-core-hover': colorCoreHover,
    '--color-core-on-primary-text': colorPrimaryBg,
    '--color-core-on-secondary-text': colorSecondaryBg,

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
    '--color-button-on-primary-border': colorSecondaryBorder,
    '--color-button-on-primary-hover': colorSecondaryHover,
    '--color-button-on-primary-text': colorText,

    '--color-button-on-secondary-bg': colorTertiaryBg,
    '--color-button-on-secondary-border': colorTertiaryBorder,
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

    '--color-disabled-text': colorDisabledText,

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

    // items are slightly miscellaneous elements throughout
    '--color-item-on-core-hover': colorCoreHover,
    '--color-item-on-primary-hover': colorSecondaryBg,
    '--color-item-on-secondary-hover': colorSecondaryHover,
    '--color-item-on-secondary-active': colorSecondaryActive,
    '--color-item-on-tertiary-hover': colorTertiaryHover,

    '--color-opacity-0025': colorOpacity0025,
    '--color-opacity-005': colorOpacity005,
    '--color-opacity-01': colorOpacity01,
    '--color-opacity-015': colorOpacity015,
    '--color-opacity-02': colorOpacity02,
    '--color-opacity-025': colorOpacity025,
    '--color-opacity-03': colorOpacity03,
    '--color-opacity-04': colorOpacity04,
    '--color-opacity-05': colorOpacity05,
    '--color-opacity-06': colorOpacity06,
    '--color-opacity-07': colorOpacity07,

    '--opacity-02': opacity02,
    '--opacity-025': opacity025,
    '--opacity-03': opacity03,
    '--opacity-04': opacity04,
    '--opacity-05': opacity05,
    '--opacity-06': opacity06,

    '--opacity-disabled': opacityDisabled,
    '--opacity-disabled-icon': opacityDisabledIcon,

    '--shadow-lg': shadowLg,
    '--shadow-md': shadowMd,
    '--shadow-sm': shadowSm,
  };

  return { tokens, isLightTheme: isActualLightTheme, isLightText };
};

export default getColorTokens;
