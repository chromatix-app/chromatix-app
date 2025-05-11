import { track } from '@vercel/analytics';

import { isElectron, electronVersion, appPlatform } from './environment';

const isLocal = process.env.REACT_APP_ENV === 'local';

const analyticsEvent = (event: string, props: object = {}) => {
  const finalProps = {
    ...props,
    isElectron: isElectron,
    appPlatform: appPlatform,
    electronVersion: electronVersion,
  };

  if (!isLocal) {
    try {
      track(event, finalProps);
      window.umami.track(event, finalProps);
    } catch (error) {
      // Ignore errors
    }
  }
};

export default analyticsEvent;
