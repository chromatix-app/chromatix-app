import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import chroma from 'chroma-js';

import { themes } from 'js/_config/themes';
import { decimalMultiplier, decimalToHex, sendToElectron } from 'js/utils';

function useColorTheme() {
  const defaultTheme = 'chromatix';

  const accessibilityContrast = useSelector(({ sessionModel }) => sessionModel.accessibilityContrast);

  const currentServer = useSelector(({ sessionModel }) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const queueIsVisible = useSelector(({ sessionModel }) => sessionModel.queueIsVisible);

  const hasSelectedLibrary = currentServer && currentLibrary;
  const hasQueueVisible = queueIsVisible && hasSelectedLibrary;

  const currentTheme = useSelector(({ sessionModel }) => sessionModel.currentTheme);

  const currentColorBackground = useSelector(({ sessionModel }) => sessionModel.currentColorBackground);
  const currentColorText = useSelector(({ sessionModel }) => sessionModel.currentColorText);
  const currentColorPrimary = useSelector(({ sessionModel }) => sessionModel.currentColorPrimary);

  useEffect(() => {
    const actualTheme = themes[currentTheme] ? currentTheme : defaultTheme;

    const colorBackground = currentTheme === 'custom' ? currentColorBackground : themes[actualTheme].background;
    const colorText = currentTheme === 'custom' ? currentColorText : themes[actualTheme].text;
    const colorPrimary = currentTheme === 'custom' ? currentColorPrimary : themes[actualTheme].primary;

    const chromaMultiplier = accessibilityContrast ? 1.4 : 1.1;
    const opacityMultiplier = accessibilityContrast ? 1.6 : 1;

    const isLightTheme = chroma(colorBackground).luminance() > 0.5;

    let colorPanelBackground;
    let colorHover;
    let colorBorder;

    // Light theme handling
    if (isLightTheme) {
      colorPanelBackground = chroma(colorBackground)
        .darken(0.4 * chromaMultiplier)
        .hex();
      colorHover = chroma(colorBackground)
        .darken(0.8 * chromaMultiplier)
        .hex();
      colorBorder = chroma(colorBackground)
        .darken(0.8 * chromaMultiplier)
        .hex();
    }

    // Dark theme handling
    else {
      colorPanelBackground = chroma(colorBackground)
        .brighten(0.4 * chromaMultiplier)
        .hex();
      colorHover = chroma(colorBackground)
        .brighten(0.8 * chromaMultiplier)
        .hex();
      colorBorder = chroma(colorBackground)
        .brighten(0.8 * chromaMultiplier)
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
    const colorOpacity08 = colorText + decimalToHex(decimalMultiplier(opacityMultiplier, 0.8));

    const colorShadow = isLightTheme ? '' : '#00000066';

    const opacity02 = decimalMultiplier(opacityMultiplier, 0.2);
    const opacity025 = decimalMultiplier(opacityMultiplier, 0.25);
    const opacity03 = decimalMultiplier(opacityMultiplier, 0.3);
    const opacity04 = decimalMultiplier(opacityMultiplier, 0.4);
    const opacity05 = decimalMultiplier(opacityMultiplier, 0.5);
    const opacity06 = decimalMultiplier(opacityMultiplier, 0.6);
    const opacity07 = decimalMultiplier(opacityMultiplier, 0.7);
    const opacity08 = decimalMultiplier(opacityMultiplier, 0.8);

    const colors = {
      '--color-background': colorBackground,
      '--color-text': colorText,
      '--color-primary': colorPrimary,

      '--color-panel-background': colorPanelBackground,
      '--color-hover': colorHover,
      '--color-border': colorBorder,

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
      '--color-opacity-08': colorOpacity08,

      '--color-shadow': colorShadow,

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
      document.documentElement.style.setProperty(color, colors[color]);
    }

    sendToElectron('win', 'color-theme', {
      background: hasQueueVisible ? colorPanelBackground : colorBackground,
      text: colorText,
      primary: colorPrimary,
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
