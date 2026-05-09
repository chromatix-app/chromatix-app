/**
 * Detects the user's browser name based on the user agent string
 * @returns {string} The detected browser name or 'Unknown'
 */

const getBrowserName = (): string => {
  const userAgent: string = navigator.userAgent;

  interface BrowserInfo {
    name: string;
    identifier: string | string[];
  }

  const browsers: BrowserInfo[] = [
    { name: 'Microsoft Edge', identifier: 'Edg' },
    { name: 'Opera', identifier: ['Opera', 'OPR'] },
    { name: 'Samsung Internet', identifier: 'SamsungBrowser' },
    { name: 'Chromium', identifier: 'Chromium' },
    { name: 'Chrome', identifier: 'Chrome' },
    { name: 'Firefox', identifier: 'Firefox' },
    { name: 'Safari', identifier: 'Safari' },
    { name: 'Microsoft Internet Explorer', identifier: 'Trident' },
  ];

  const browser: BrowserInfo | undefined = browsers.find((b) =>
    Array.isArray(b.identifier) ? b.identifier.some((id) => userAgent.includes(id)) : userAgent.includes(b.identifier)
  );

  return browser ? browser.name : 'Unknown';
};

export default getBrowserName;
