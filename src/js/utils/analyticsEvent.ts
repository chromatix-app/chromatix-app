import { track } from '@vercel/analytics';

declare global {
  interface Window {
    isElectron?: boolean;
    electronProcess?: {
      platform?: string;
    };
  }
}

const isElectron = window?.isElectron || false;
const platform = isElectron ? (window?.electronProcess?.platform === 'darwin' ? 'mac' : 'win') : 'web';

const analyticsEvent = (event: string, props: object = {}) => {
  const finalProps = {
    ...props,
    electron: isElectron,
    platform: platform,
  };

  track(event, finalProps);
};

// Export the getTrackKeys function
export default analyticsEvent;
