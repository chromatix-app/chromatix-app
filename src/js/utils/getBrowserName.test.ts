// Generated using GitHub Copilot

import getBrowserName from './getBrowserName';
import {
  UA_CHROME_ANDROID,
  UA_CHROME_LINUX,
  UA_CHROME_MACOS,
  UA_CHROME_WINDOWS,
  UA_CHROMIUM_LINUX,
  UA_EDGE_MACOS,
  UA_EDGE_WINDOWS,
  UA_EMPTY,
  UA_FIREFOX_ANDROID,
  UA_FIREFOX_LINUX,
  UA_FIREFOX_MACOS,
  UA_FIREFOX_WINDOWS,
  UA_GOOGLEBOT,
  UA_IE11,
  UA_OPERA_LEGACY,
  UA_OPERA_MODERN,
  UA_SAFARI_IPAD,
  UA_SAFARI_IPHONE,
  UA_SAFARI_MACOS,
  UA_SAMSUNG_INTERNET,
} from './__fixtures__/userAgents';

const setUserAgent = (ua: string) => {
  Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });
};

describe('Testing "getBrowserName" function', () => {
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', { value: originalUserAgent, configurable: true });
  });

  // MICROSOFT EDGE

  test('Detects Microsoft Edge (Chromium)', () => {
    setUserAgent(UA_EDGE_WINDOWS);
    expect(getBrowserName()).toBe('Microsoft Edge');
  });

  test('Detects Microsoft Edge on macOS', () => {
    setUserAgent(UA_EDGE_MACOS);
    expect(getBrowserName()).toBe('Microsoft Edge');
  });

  // OPERA

  test('Detects Opera (OPR identifier)', () => {
    setUserAgent(UA_OPERA_MODERN);
    expect(getBrowserName()).toBe('Opera');
  });

  test('Detects Opera (legacy Opera identifier)', () => {
    setUserAgent(UA_OPERA_LEGACY);
    expect(getBrowserName()).toBe('Opera');
  });

  // CHROME

  test('Detects Chrome on Windows', () => {
    setUserAgent(UA_CHROME_WINDOWS);
    expect(getBrowserName()).toBe('Chrome');
  });

  test('Detects Chrome on macOS', () => {
    setUserAgent(UA_CHROME_MACOS);
    expect(getBrowserName()).toBe('Chrome');
  });

  test('Detects Chrome on Android', () => {
    setUserAgent(UA_CHROME_ANDROID);
    expect(getBrowserName()).toBe('Chrome');
  });

  test('Detects Chrome on Linux', () => {
    setUserAgent(UA_CHROME_LINUX);
    expect(getBrowserName()).toBe('Chrome');
  });

  // CHROMIUM

  test('Detects Chromium', () => {
    setUserAgent(UA_CHROMIUM_LINUX);
    expect(getBrowserName()).toBe('Chromium');
  });

  // FIREFOX

  test('Detects Firefox on Windows', () => {
    setUserAgent(UA_FIREFOX_WINDOWS);
    expect(getBrowserName()).toBe('Firefox');
  });

  test('Detects Firefox on macOS', () => {
    setUserAgent(UA_FIREFOX_MACOS);
    expect(getBrowserName()).toBe('Firefox');
  });

  test('Detects Firefox on Linux', () => {
    setUserAgent(UA_FIREFOX_LINUX);
    expect(getBrowserName()).toBe('Firefox');
  });

  test('Detects Firefox on Android', () => {
    setUserAgent(UA_FIREFOX_ANDROID);
    expect(getBrowserName()).toBe('Firefox');
  });

  // SAFARI

  test('Detects Safari on macOS', () => {
    setUserAgent(UA_SAFARI_MACOS);
    expect(getBrowserName()).toBe('Safari');
  });

  test('Detects Safari on iPhone', () => {
    setUserAgent(UA_SAFARI_IPHONE);
    expect(getBrowserName()).toBe('Safari');
  });

  test('Detects Safari on iPad', () => {
    setUserAgent(UA_SAFARI_IPAD);
    expect(getBrowserName()).toBe('Safari');
  });

  // SAMSUNG INTERNET

  test('Detects Samsung Internet', () => {
    setUserAgent(UA_SAMSUNG_INTERNET);
    expect(getBrowserName()).toBe('Samsung Internet');
  });

  // MICROSOFT INTERNET EXPLORER

  test('Detects Internet Explorer 11', () => {
    setUserAgent(UA_IE11);
    expect(getBrowserName()).toBe('Microsoft Internet Explorer');
  });

  // UNKNOWN

  test('Returns "Unknown" for an unrecognised user agent', () => {
    setUserAgent(UA_GOOGLEBOT);
    expect(getBrowserName()).toBe('Unknown');
  });

  test('Returns "Unknown" for an empty user agent string', () => {
    setUserAgent(UA_EMPTY);
    expect(getBrowserName()).toBe('Unknown');
  });
});
