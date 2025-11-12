import { track } from '@vercel/analytics';

import getEnvironment from './getEnvironment';

const isLocal = process.env.REACT_APP_ENV === 'local';
const envData = getEnvironment();

/**
 * Tracks analytics events with automatic platform and environment metadata.
 * Events are only sent in non-local environments.
 * @param event - Event name to track
 * @param props - Additional properties to include with the event
 */

const analyticsEvent = (event: string, props: object = {}) => {
  if (isLocal) {
    try {
      console.log(`%cAnalytics: ${event}`, 'color:#a8bdbe');

      const finalProps = {
        ...props,
        appPlatform: envData.appPlatformName || 'Unknown',
        appVersion: envData.webVersion || 'Unknown',
        environment: envData.webEnvName,
        isElectron: envData.isElectron,
        electronVersion: envData.electronVersion,
      };

      track(event, finalProps);
      // window.umami.track(event, finalProps);
    } catch (error) {
      // Ignore errors
    }
  }
};

export default analyticsEvent;
