import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import chroma from 'chroma-js';

import { themes } from 'js/_config/themes';

function useColorTheme() {
  const defaultTheme = 'chromatix';

  const currentTheme = useSelector(({ sessionModel }) => sessionModel.currentTheme);

  const actualTheme = themes[currentTheme] ? currentTheme : defaultTheme;

  const currentColorBackground = useSelector(({ sessionModel }) => sessionModel.colorBackground);
  const currentColorText = useSelector(({ sessionModel }) => sessionModel.colorText);
  const currentColorPrimary = useSelector(({ sessionModel }) => sessionModel.colorPrimary);

  const colorBackground = currentTheme === 'custom' ? currentColorBackground : themes[actualTheme].background;
  const colorText = currentTheme === 'custom' ? currentColorText : themes[actualTheme].text;
  const colorPrimary = currentTheme === 'custom' ? currentColorPrimary : themes[actualTheme].primary;

  const isLightTheme = chroma(colorBackground).luminance() > 0.5;

  let colorPanelBackground = chroma(colorBackground).brighten(0.4).hex(); // #1e1e1e
  let colorHover = chroma(colorBackground).brighten(0.8).hex(); // #2a2a2a
  let colorBorder = chroma(colorBackground).brighten(0.8).hex(); // #2a2a2a

  let colorOpacity0025 = colorText + '06';
  let colorOpacity005 = colorText + '0d';
  let colorOpacity01 = colorText + '1a';
  let colorOpacity015 = colorText + '26';
  let colorOpacity02 = colorText + '33';

  let colorShadow = isLightTheme ? '' : '#00000044';

  // If the background color is light, darken the colors instead
  if (isLightTheme) {
    colorPanelBackground = chroma(colorBackground).darken(0.4).hex();
    colorHover = chroma(colorBackground).darken(0.8).hex();
    colorBorder = chroma(colorBackground).darken(0.8).hex();
  }

  useEffect(() => {
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

      '--color-shadow': colorShadow,
    };

    for (const color in colors) {
      document.documentElement.style.setProperty(color, colors[color]);
    }
  }, [
    colorBackground,
    colorText,
    colorPrimary,

    colorPanelBackground,
    colorHover,
    colorBorder,

    colorOpacity0025,
    colorOpacity005,
    colorOpacity01,
    colorOpacity015,
    colorOpacity02,

    colorShadow,
  ]);
}

export default useColorTheme;
