import { useEffect } from 'react';
import { useSelector } from 'react-redux';

/** Custom hook that manages dynamic style options for the application. */

function useStyleOptions(): void {
  const winScrollbarWidth = useSelector(({ sessionModel }: any) => sessionModel.winScrollbarWidth);

  useEffect(() => {
    const options: Record<string, string | number> = {
      '--scrollbar-width': winScrollbarWidth ? `${winScrollbarWidth}px` : '8px',
    };

    for (const option in options) {
      document.documentElement.style.setProperty(option, options[option].toString());
    }
  }, [winScrollbarWidth]);
}

export default useStyleOptions;
