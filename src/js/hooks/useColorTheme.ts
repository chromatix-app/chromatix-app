import { useEffect } from 'react';
import { useSelector } from 'react-redux';
// @ts-ignore - No type definitions available for chroma-js
import chroma from 'chroma-js';

import { themes } from 'js/_config/themes';
import { decimalMultiplier, decimalToHex, sendToElectron } from 'js/utils';

/**
 * Custom hook that manages dynamic color theming for the application.
 * Calculates and applies CSS custom properties based on theme selection and accessibility settings.
 */

function useColorTheme(): void {
  const defaultTheme = 'chromatix';

  const accessibilityContrast = useSelector(({ sessionModel }: any) => sessionModel.accessibilityContrast);

  const currentServer = useSelector(({ sessionModel }: any) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }: any) => sessionModel.currentLibrary);
  const queueIsVisible = useSelector(({ sessionModel }: any) => sessionModel.queueIsVisible);

  const hasSelectedLibrary = currentServer && currentLibrary;
  const hasQueueVisible = queueIsVisible && hasSelectedLibrary;

  const currentTheme = useSelector(({ sessionModel }: any) => sessionModel.currentTheme);

  const currentColorBackground = useSelector(({ sessionModel }: any) => sessionModel.currentColorBackground);
  const currentColorPrimary = useSelector(({ sessionModel }: any) => sessionModel.currentColorPrimary);
  const currentColorText = useSelector(({ sessionModel }: any) => sessionModel.currentColorText);

  useEffect(() => {
    const actualTheme = themes[currentTheme as keyof typeof themes] ? currentTheme : defaultTheme;

    const colorCore =
      currentTheme === 'custom' ? currentColorPrimary : themes[actualTheme as keyof typeof themes].primary;
    const colorText = currentTheme === 'custom' ? currentColorText : themes[actualTheme as keyof typeof themes].text;
    const colorPrimaryBackground =
      currentTheme === 'custom' ? currentColorBackground : themes[actualTheme as keyof typeof themes].background;

    const chromaMultiplier = accessibilityContrast ? 1.4 : 1.1;
    const opacityMultiplier = accessibilityContrast ? 1.6 : 1;

    const isLightTheme = chroma(colorPrimaryBackground).luminance() > 0.5;

    let colorBlackout;
    let colorButtonSecondary;

    let colorSecondaryBackground: string;
    let colorSecondaryBorder: string;
    let colorSecondaryCard: string;
    let colorSecondaryHover: string;
    let colorSecondaryActive: string;

    let colorTertiaryBackground: string;
    let colorTertiaryBorder: string;

    // Light theme handling
    if (isLightTheme) {
      colorBlackout =
        chroma(colorPrimaryBackground)
          .darken(0.2 * chromaMultiplier)
          .hex() + decimalToHex(decimalMultiplier(opacityMultiplier, 0.9));
      colorButtonSecondary = chroma(colorText)
        .brighten(0.3 * chromaMultiplier)
        .hex();

      colorSecondaryBackground = chroma(colorPrimaryBackground)
        .darken(0.4 * chromaMultiplier)
        .hex();
      colorSecondaryBorder = chroma(colorPrimaryBackground)
        .darken(0.8 * chromaMultiplier)
        .hex();
      colorSecondaryCard = chroma(colorPrimaryBackground)
        .darken(0.55 * chromaMultiplier)
        .hex();
      colorSecondaryHover = chroma(colorPrimaryBackground)
        .darken(0.65 * chromaMultiplier)
        .hex();
      colorSecondaryActive = chroma(colorPrimaryBackground)
        .darken(0.75 * chromaMultiplier)
        .hex();

      colorTertiaryBackground = chroma(colorPrimaryBackground)
        .darken(0.9 * chromaMultiplier)
        .hex();
      colorTertiaryBorder = chroma(colorPrimaryBackground)
        .darken(1.2 * chromaMultiplier)
        .hex();
    }

    // Dark theme handling
    else {
      colorBlackout =
        chroma(colorPrimaryBackground)
          .darken(0.5 * chromaMultiplier)
          .desaturate(0.35)
          .hex() + decimalToHex(decimalMultiplier(opacityMultiplier, 0.8));
      colorButtonSecondary = chroma(colorText)
        .darken(0.3 * chromaMultiplier)
        .hex();

      colorSecondaryBackground = chroma(colorPrimaryBackground)
        .brighten(0.4 * chromaMultiplier)
        .hex();
      colorSecondaryBorder = chroma(colorPrimaryBackground)
        .brighten(0.8 * chromaMultiplier)
        .hex();
      colorSecondaryCard = chroma(colorPrimaryBackground)
        .brighten(0.55 * chromaMultiplier)
        .hex();
      colorSecondaryHover = chroma(colorPrimaryBackground)
        .brighten(0.65 * chromaMultiplier)
        .hex();
      colorSecondaryActive = chroma(colorPrimaryBackground)
        .brighten(0.75 * chromaMultiplier)
        .hex();

      colorTertiaryBackground = chroma(colorPrimaryBackground)
        .brighten(0.9 * chromaMultiplier)
        .hex();
      colorTertiaryBorder = chroma(colorPrimaryBackground)
        .brighten(1.2 * chromaMultiplier)
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

    const shadowHeavy = isLightTheme ? '0 4px 20px rgba(0, 0, 0, 0.1)' : '0 2px 20px rgba(0, 0, 0, 0.4)';
    const shadowMedium = isLightTheme ? '0 4px 6px rgba(0, 0, 0, 0.05)' : '0 2px 10px rgba(0, 0, 0, 0.4)';
    const shadowLight = isLightTheme ? '0 4px 6px rgba(0, 0, 0, 0.05)' : '0 2px 8px rgba(0, 0, 0, 0.35)';

    const opacity02 = decimalMultiplier(opacityMultiplier, 0.2);
    const opacity025 = decimalMultiplier(opacityMultiplier, 0.25);
    const opacity03 = decimalMultiplier(opacityMultiplier, 0.3);
    const opacity04 = decimalMultiplier(opacityMultiplier, 0.4);
    const opacity05 = decimalMultiplier(opacityMultiplier, 0.5);
    const opacity06 = decimalMultiplier(opacityMultiplier, 0.6);
    const opacity07 = decimalMultiplier(opacityMultiplier, 0.7);
    const opacity08 = decimalMultiplier(opacityMultiplier, 0.8);

    const colors: Record<string, string | number> = {
      '--color-core': colorCore,
      '--color-text': colorText,
      '--color-primary-background': colorPrimaryBackground,
      '--color-blackout': colorBlackout,

      '--color-button-secondary': colorButtonSecondary,

      '--color-secondary-background': colorSecondaryBackground,
      '--color-secondary-border': colorSecondaryBorder,
      '--color-secondary-card': colorSecondaryCard,
      '--color-secondary-hover': colorSecondaryHover,
      '--color-secondary-active': colorSecondaryActive,

      '--color-tertiary-background': colorTertiaryBackground,
      '--color-tertiary-border': colorTertiaryBorder,

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

      '--shadow-heavy': shadowHeavy,
      '--shadow-medium': shadowMedium,
      '--shadow-light': shadowLight,

      '--opacity-02': opacity02,
      '--opacity-025': opacity025,
      '--opacity-03': opacity03,
      '--opacity-04': opacity04,
      '--opacity-05': opacity05,
      '--opacity-06': opacity06,
      '--opacity-07': opacity07,
      '--opacity-08': opacity08,
    };

    for (const color in colors) {
      document.documentElement.style.setProperty(color, colors[color].toString());
    }

    sendToElectron('win', 'color-theme', {
      background: hasQueueVisible ? colorSecondaryBackground : colorPrimaryBackground,
      text: colorText,
      primary: colorCore,
    });
  }, [
    accessibilityContrast,
    hasQueueVisible,
    currentTheme,
    currentColorBackground,
    currentColorText,
    currentColorPrimary,
  ]);
}

export default useColorTheme;
