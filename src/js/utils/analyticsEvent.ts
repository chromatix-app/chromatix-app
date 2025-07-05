import { track } from '@vercel/analytics';

import { isElectron, electronVersion, appPlatform } from './environment';

const isLocal = process.env.REACT_APP_ENV === 'local';

const analyticsEvent = (event: string, props: object = {}) => {
  const finalProps = {
    ...props,
    appPlatform: appPlatform,
    appVersion: process.env.REACT_APP_VERSION || 'Unknown',
    environment: process.env.REACT_APP_ENV || 'Unknown',
    isElectron: isElectron,
    electronVersion: electronVersion,
  };

  if (!isLocal) {
    try {
      track(event, finalProps);
      // window.umami.track(event, finalProps);
    } catch (error) {
      // Ignore errors
    }
  }
};

export default analyticsEvent;
