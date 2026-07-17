// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useState } from 'react';
import * as playerX from 'js/services/player';

// ======================================================================
// HOOK
// ======================================================================

const useAirPlay = () => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    playerX.subscribeAirPlayAvailability(setIsAvailable);
    return () => {
      playerX.unsubscribeAirPlayAvailability(setIsAvailable);
    };
  }, []);

  return { isAvailable, showPicker: playerX.showAirPlayPicker };
};

export default useAirPlay;
