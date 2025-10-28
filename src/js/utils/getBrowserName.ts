import { isElectron } from './environment';

/**
 * Detects the user's browser name based on the user agent string
 * @returns The detected browser name or 'Unknown'
 */

const getBrowserName = (): string => {
  if (isElectron) {
    return 'Chromatix';
  }

  const userAgent: string = navigator.userAgent;

  interface BrowserInfo {
    name: string;
    identifier: string | string[];
  }

  const browsers: BrowserInfo[] = [
    { name: 'Microsoft Edge', identifier: 'Edg' },
    { name: 'Brave', identifier: 'Brave' },
    { name: 'Opera', identifier: ['Opera', 'OPR'] },
    { name: 'Chrome', identifier: 'Chrome' },
    { name: 'Chromium', identifier: 'Chromium' },
    { name: 'Firefox', identifier: 'Firefox' },
    { name: 'Safari', identifier: 'Safari' },
    { name: 'Samsung Internet', identifier: 'SamsungBrowser' },
    { name: 'Microsoft Internet Explorer', identifier: 'Trident' },
  ];

  const browser: BrowserInfo | undefined = browsers.find((b) =>
    Array.isArray(b.identifier) ? b.identifier.some((id) => userAgent.includes(id)) : userAgent.includes(b.identifier)
  );

  return browser ? browser.name : 'Unknown';
};

export default getBrowserName;
