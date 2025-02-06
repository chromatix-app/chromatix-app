import { track } from '@vercel/analytics';

import { isElectron, electronVersion, appPlatform } from './environment';

const analyticsEvent = (event: string, props: object = {}) => {
  const finalProps = {
    ...props,
    isElectron: isElectron,
    appPlatform: appPlatform,
    electronVersion: electronVersion,
  };

  track(event, finalProps);
};

// Export the getTrackKeys function
export default analyticsEvent;
