// Tests generated using AI

import getOperatingSystemName from './getOperatingSystemName';
import {
  UA_CHROME_ANDROID,
  UA_CHROME_LINUX,
  UA_CHROME_MACOS,
  UA_CHROME_WINDOWS,
  UA_EMPTY,
  UA_FIREFOX_ANDROID,
  UA_FIREFOX_LINUX,
  UA_FIREFOX_MACOS,
  UA_FIREFOX_WINDOWS,
  UA_GOOGLEBOT,
  UA_IE11,
  UA_SAFARI_IPAD,
  UA_SAFARI_IPHONE,
  UA_SAFARI_IPOD,
  UA_SAFARI_MACOS,
  UA_SAMSUNG_INTERNET,
} from './__fixtures__/userAgents';

const setUserAgent = (ua: string) => {
  Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });
};

describe('Testing "getOperatingSystemName" function', () => {
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', { value: originalUserAgent, configurable: true });
  });

  // WINDOWS

  test('Detects Windows from Chrome on Windows 11', () => {
    setUserAgent(UA_CHROME_WINDOWS);
    expect(getOperatingSystemName()).toBe('Windows');
  });

  test('Detects Windows from Firefox on Windows', () => {
    setUserAgent(UA_FIREFOX_WINDOWS);
    expect(getOperatingSystemName()).toBe('Windows');
  });

  test('Detects Windows from Internet Explorer 11', () => {
    setUserAgent(UA_IE11);
    expect(getOperatingSystemName()).toBe('Windows');
  });

  // MACOS

  test('Detects macOS from Safari on macOS', () => {
    setUserAgent(UA_SAFARI_MACOS);
    expect(getOperatingSystemName()).toBe('macOS');
  });

  test('Detects macOS from Chrome on macOS', () => {
    setUserAgent(UA_CHROME_MACOS);
    expect(getOperatingSystemName()).toBe('macOS');
  });

  test('Detects macOS from Firefox on macOS', () => {
    setUserAgent(UA_FIREFOX_MACOS);
    expect(getOperatingSystemName()).toBe('macOS');
  });

  // LINUX

  test('Detects Linux from Firefox on Ubuntu', () => {
    setUserAgent(UA_FIREFOX_LINUX);
    expect(getOperatingSystemName()).toBe('Linux');
  });

  test('Detects Linux from Chrome on Linux', () => {
    setUserAgent(UA_CHROME_LINUX);
    expect(getOperatingSystemName()).toBe('Linux');
  });

  // ANDROID

  test('Detects Android from Chrome on Android', () => {
    setUserAgent(UA_CHROME_ANDROID);
    expect(getOperatingSystemName()).toBe('Android');
  });

  test('Detects Android from Firefox on Android', () => {
    setUserAgent(UA_FIREFOX_ANDROID);
    expect(getOperatingSystemName()).toBe('Android');
  });

  test('Detects Android from Samsung Internet', () => {
    setUserAgent(UA_SAMSUNG_INTERNET);
    expect(getOperatingSystemName()).toBe('Android');
  });

  // IOS

  test('Detects iOS from Safari on iPhone', () => {
    setUserAgent(UA_SAFARI_IPHONE);
    expect(getOperatingSystemName()).toBe('iOS');
  });

  test('Detects iOS from Safari on iPad', () => {
    setUserAgent(UA_SAFARI_IPAD);
    expect(getOperatingSystemName()).toBe('iOS');
  });

  test('Detects iOS from Safari on iPod', () => {
    setUserAgent(UA_SAFARI_IPOD);
    expect(getOperatingSystemName()).toBe('iOS');
  });

  // UNKNOWN

  test('Returns "Unknown" for an unrecognised user agent', () => {
    setUserAgent(UA_GOOGLEBOT);
    expect(getOperatingSystemName()).toBe('Unknown');
  });

  test('Returns "Unknown" for an empty user agent string', () => {
    setUserAgent(UA_EMPTY);
    expect(getOperatingSystemName()).toBe('Unknown');
  });
});
