import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { themes } from 'js/_config/themes';
import { getColorTokens, sendToElectron } from 'js/utils';

/**
 * Custom hook that manages dynamic color theming for the application.
 * Applies the CSS custom properties from `getColorTokens` for the selected theme and accessibility settings.
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

  const currentTheme = useSelector(({ sessionModel }: any) => sessionModel.currentTheme);
  const currentColorBackground = useSelector(({ sessionModel }: any) => sessionModel.currentColorBackground);
  const currentColorPrimary = useSelector(({ sessionModel }: any) => sessionModel.currentColorPrimary);
  const currentColorText = useSelector(({ sessionModel }: any) => sessionModel.currentColorText);
  const currentUiTinting = useSelector(({ sessionModel }: any) => sessionModel.currentUiTinting);
  const currentContrast = useSelector(({ sessionModel }: any) => sessionModel.currentContrast);

  useEffect(() => {
    const actualTheme =
      fullPageMode && !fullPageTheme
        ? 'full-page'
        : themes[currentTheme as keyof typeof themes]
          ? currentTheme
          : defaultTheme;

    const theme = themes[actualTheme as keyof typeof themes];
    const isCustom = currentTheme === 'custom';

    const { tokens, isLightTheme, isLightText } = getColorTokens({
      background: isCustom ? currentColorBackground : theme.background,
      text: isCustom ? currentColorText : theme.text,
      core: isCustom ? currentColorPrimary : theme.primary,
      contrast: currentContrast,
      tinting: isCustom ? currentUiTinting : 'auto',
    });

    // Get or create the style element for dynamic theme variables
    let styleElement = document.getElementById('dynamic-theme-props') as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'dynamic-theme-props';
      document.head.appendChild(styleElement);
    }

    // Update the style element with the new CSS variables
    const cssText = `:root {\n${Object.entries(tokens)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')}\n}`;
    styleElement.textContent = cssText;

    // Send updated colors to Electron main process
    sendToElectron(['win', 'lin'], 'color-theme', {
      background: tokens[hasQueueVisible && !fullPageMode ? '--color-secondary-bg' : '--color-primary-bg'],
      text: tokens['--color-text'],
      primary: tokens['--color-core-main'],
    });

    // Save whether the theme is light or dark in the session state
    dispatch.sessionModel.setSessionState({
      isLightTheme,
      isLightText,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentContrast,
    currentUiTinting,
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
