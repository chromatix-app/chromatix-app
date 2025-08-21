import { track } from '@vercel/analytics';

import { isElectron, electronVersion, appPlatform } from './environment';

const isLocal = process.env.REACT_APP_ENV === 'local';

/**
 * Tracks analytics events with automatic platform and environment metadata.
 * Events are only sent in non-local environments.
 * @param event - Event name to track
 * @param props - Additional properties to include with the event
 */

const analyticsEvent = (event: string, props: object = {}) => {
  if (!isLocal) {
    try {
      const finalProps = {
        ...props,
        appPlatform: appPlatform,
        appVersion: process.env.REACT_APP_VERSION || 'Unknown',
        environment: process.env.REACT_APP_ENV || 'Unknown',
        isElectron: isElectron,
        electronVersion: electronVersion,
      };

      track(event, finalProps);
      // window.umami.track(event, finalProps);
    } catch (error) {
      // Ignore errors
    }
  }
};

export default analyticsEvent;
