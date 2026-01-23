import { useEffect } from 'react';
import { useSelector } from 'react-redux';

/** Custom hook that manages dynamic style options for the application. */

function useStyleOptions(): void {
  const winScrollbarWidth = useSelector(({ sessionModel }: any) => sessionModel.winScrollbarWidth);

  useEffect(() => {
    const options: Record<string, string | number> = {
      '--scrollbar-width': winScrollbarWidth ? `${winScrollbarWidth}px` : '8px',
    };

    // Get or create the style element for dynamic style options
    let styleElement = document.getElementById('dynamic-style-props') as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'dynamic-style-props';
      document.head.appendChild(styleElement);
    }

    // Update the style element with the new CSS variables
    const cssText = `:root {\n${Object.entries(options)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')}\n}`;
    styleElement.textContent = cssText;
  }, [winScrollbarWidth]);
}

export default useStyleOptions;
