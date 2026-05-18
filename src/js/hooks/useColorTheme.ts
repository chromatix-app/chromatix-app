import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import chroma from 'chroma-js';

import { themes } from 'js/_config/themes';
import { decimalMultiplier, decimalToHex, sendToElectron } from 'js/utils';

/**
 * Custom hook that manages dynamic color theming for the application.
 * Calculates and applies CSS custom properties based on theme selection and accessibility settings.
 */

function useColorTheme(): void {
  const defaultTheme = 'chromatix-magenta';

  const dispatch = useDispatch();

  const fullPageMode = useSelector(({ appModel }: any) => appModel.fullPageMode);
  const fullPageTheme = useSelector(({ sessionModel }: any) => sessionModel.fullPageTheme);

  const currentServer = useSelector(({ sessionModel }: any) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }: any) => sessionModel.currentLibrary);
  const queueIsVisible = useSelector(({ sessionModel }: any) => sessionModel.queueIsVisible);

  const hasSelectedLibrary = currentServer && currentLibrary;
  const hasQueueVisible = queueIsVisible && hasSelectedLibrary;

  const themeContrast = useSelector(({ sessionModel }: any) => sessionModel.themeContrast);
  const themeUiTinting = useSelector(({ sessionModel }: any) => sessionModel.themeUiTinting);

  const currentTheme = useSelector(({ sessionModel }: any) => sessionModel.currentTheme);
  const currentColorBackground = useSelector(({ sessionModel }: any) => sessionModel.currentColorBackground);
  const currentColorPrimary = useSelector(({ sessionModel }: any) => sessionModel.currentColorPrimary);
  const currentColorText = useSelector(({ sessionModel }: any) => sessionModel.currentColorText);

  useEffect(() => {
    const actualTheme =
      fullPageMode && !fullPageTheme
        ? 'full-page'
        : themes[currentTheme as keyof typeof themes]
          ? currentTheme
          : defaultTheme;

    const colorCore =
      currentTheme === 'custom' ? currentColorPrimary : themes[actualTheme as keyof typeof themes].primary;
    const colorText = currentTheme === 'custom' ? currentColorText : themes[actualTheme as keyof typeof themes].text;
    const colorPrimaryBg =
      currentTheme === 'custom' ? currentColorBackground : themes[actualTheme as keyof typeof themes].background;

    const contrastLevel = themeContrast === 'high' ? 'high' : themeContrast === 'medium' ? 'medium' : 'default';

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

    const isActualLightTheme =
      currentTheme === 'custom'
        ? themeUiTinting === 'darken' || (themeUiTinting === 'auto' && isLightTheme)
        : isLightTheme;

    let colorBlackout: string;

    let colorSecondaryBg: string;
    let colorSecondaryBorder: string;
    let colorSecondaryHover: string;
    let colorSecondaryActive: string;

    let colorTertiaryBg: string;
    let colorTertiaryBorder: string;
    let colorTertiaryHover: string;

    let colorCardOnPrimaryBg: string;
    let colorCardOnPrimaryBorder: string;

    let colorCardOnSecondaryBg: string;
    let colorCardOnSecondaryBorder: string;

    let colorButtonMonoBg: string;

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
        .darken(0.9 * chromaMultiplierHigh)
        .hex();

      colorCardOnPrimaryBg = chroma(colorPrimaryBg)
        .darken(0.2 * chromaMultiplierLow)
        .hex();
      colorCardOnPrimaryBorder = chroma(colorPrimaryBg)
        .darken(0.6 * chromaMultiplierHigh)
        .hex();

      colorCardOnSecondaryBg = chroma(colorPrimaryBg)
        .darken(0.6 * chromaMultiplierLow)
        .hex();
      colorCardOnSecondaryBorder = chroma(colorPrimaryBg)
        .darken(0.6 * chromaMultiplierHigh) // [NOTE] invisible border
        .hex();

      colorButtonMonoBg = chroma(colorText)
        .brighten(0.3 * chromaMultiplierHigh)
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
        .brighten(1.25 * chromaMultiplierHigh)
        .hex();

      colorCardOnPrimaryBg = chroma(colorPrimaryBg)
        .brighten(0.55 * chromaMultiplierHigh)
        .hex();
      colorCardOnPrimaryBorder = chroma(colorPrimaryBg)
        .brighten(0.85 * chromaMultiplierHigh)
        .hex();

      colorCardOnSecondaryBg = chroma(colorPrimaryBg)
        .brighten(0.9 * chromaMultiplierHigh)
        .hex();
      colorCardOnSecondaryBorder = chroma(colorPrimaryBg)
        .brighten(1.2 * chromaMultiplierHigh)
        .hex();

      colorButtonMonoBg = chroma(colorText)
        .darken(0.3 * chromaMultiplierHigh)
        .hex();
    }

    const colorOpacity0025 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.025));
    const colorOpacity005 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.05));
    const colorOpacity0075 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.075));
    const colorOpacity01 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.1));
    const colorOpacity015 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.15));
    const colorOpacity02 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.2));
    const colorOpacity025 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.25));
    const colorOpacity03 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.3));
    const colorOpacity04 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.4));
    const colorOpacity05 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.5));
    const colorOpacity06 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.6));
    const colorOpacity07 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.7));
    const colorOpacity08 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.8));

    const opacity02 = decimalMultiplier(opacityMultiplier, 0.2);
    const opacity025 = decimalMultiplier(opacityMultiplier, 0.25);
    const opacity03 = decimalMultiplier(opacityMultiplier, 0.3);
    const opacity04 = decimalMultiplier(opacityMultiplier, 0.4);
    const opacity05 = decimalMultiplier(opacityMultiplier, 0.5);
    const opacity06 = decimalMultiplier(opacityMultiplier, 0.6);
    const opacity07 = decimalMultiplier(opacityMultiplier, 0.7);
    const opacity08 = decimalMultiplier(opacityMultiplier, 0.8);

    const shadowLg = isActualLightTheme ? '0 4px 20px rgba(0, 0, 0, 0.1)' : '0 2px 20px rgba(0, 0, 0, 0.35)';
    const shadowMd = isActualLightTheme ? '0 4px 8px rgba(0, 0, 0, 0.1)' : '0 2px 10px rgba(0, 0, 0, 0.35)';
    const shadowSm = isActualLightTheme ? '0 2px 4px rgba(0, 0, 0, 0.05)' : '0 2px 6px rgba(0, 0, 0, 0.2)';

    const colors: Record<string, string | number> = {
      '--color-core': colorCore,
      '--color-text': colorText,
      '--color-blackout': colorBlackout,

      '--color-primary-bg': colorPrimaryBg,

      '--color-secondary-bg': colorSecondaryBg,
      '--color-secondary-border': colorSecondaryBorder,
      '--color-secondary-hover': colorSecondaryHover,
      '--color-secondary-active': colorSecondaryActive,

      '--color-tertiary-bg': colorTertiaryBg,
      '--color-tertiary-border': colorTertiaryBorder,
      '--color-tertiary-hover': colorTertiaryHover,

      '--color-card-on-primary-bg': colorCardOnPrimaryBg,
      '--color-card-on-primary-border': colorCardOnPrimaryBorder,

      '--color-card-on-secondary-bg': colorCardOnSecondaryBg,
      '--color-card-on-secondary-border': colorCardOnSecondaryBorder,

      '--color-button-on-primary-bg': colorCardOnPrimaryBg,
      '--color-button-on-primary-border': colorCardOnPrimaryBorder,

      '--color-button-on-secondary-bg': colorTertiaryBg,
      '--color-button-on-secondary-border': colorTertiaryBorder,

      '--color-button-mono-bg': colorButtonMonoBg,

      '--color-opacity-0025': colorOpacity0025,
      '--color-opacity-005': colorOpacity005,
      '--color-opacity-0075': colorOpacity0075,
      '--color-opacity-01': colorOpacity01,
      '--color-opacity-015': colorOpacity015,
      '--color-opacity-02': colorOpacity02,
      '--color-opacity-025': colorOpacity025,
      '--color-opacity-03': colorOpacity03,
      '--color-opacity-04': colorOpacity04,
      '--color-opacity-05': colorOpacity05,
      '--color-opacity-06': colorOpacity06,
      '--color-opacity-07': colorOpacity07,
      '--color-opacity-08': colorOpacity08,

      '--opacity-02': opacity02,
      '--opacity-025': opacity025,
      '--opacity-03': opacity03,
      '--opacity-04': opacity04,
      '--opacity-05': opacity05,
      '--opacity-06': opacity06,
      '--opacity-07': opacity07,
      '--opacity-08': opacity08,

      '--shadow-lg': shadowLg,
      '--shadow-md': shadowMd,
      '--shadow-sm': shadowSm,
    };

    // Get or create the style element for dynamic theme variables
    let styleElement = document.getElementById('dynamic-theme-props') as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'dynamic-theme-props';
      document.head.appendChild(styleElement);
    }

    // Update the style element with the new CSS variables
    const cssText = `:root {\n${Object.entries(colors)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')}\n}`;
    styleElement.textContent = cssText;

    // Send updated colors to Electron main process
    sendToElectron(['win', 'lin'], 'color-theme', {
      background: hasQueueVisible && !fullPageMode ? colorSecondaryBg : colorPrimaryBg,
      text: colorText,
      primary: colorCore,
    });

    // Save whether the theme is light or dark in the session state
    dispatch.sessionModel.setSessionState({
      isLightTheme: isActualLightTheme,
      isLightText: isLightText,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    themeContrast,
    themeUiTinting,
    hasQueueVisible,
    currentTheme,
    currentColorBackground,
    currentColorText,
    currentColorPrimary,
    fullPageMode,
    fullPageTheme,
  ]);
}

export default useColorTheme;
