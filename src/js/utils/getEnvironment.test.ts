// Tests generated using AI

import config from 'js/_config/config';

import setLocalStorage from './setLocalStorage';

// getEnvironment caches its result, so import a fresh copy for each test
const loadEnvironment = async () => {
  vi.resetModules();
  const { default: getEnvironment } = await import('./getEnvironment');
  return getEnvironment();
};

const simulate = (value: string) => setLocalStorage(config.storageDevEnvironmentKey, value);

describe('Testing "getEnvironment" function', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv('VITE_ENV', 'local');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    delete window.isElectron;
    delete window.electronProcess;
  });

  // NO SIMULATION

  test('Returns real browser values when no simulated environment is stored', async () => {
    const envData = await loadEnvironment();
    expect(envData.isElectron).toBe(false);
    expect(envData.isRealElectron).toBe(false);
    expect(envData.electronPlatformId).toBeNull();
    expect(envData.appPlatformName).toBe('Web');
  });

  // DEVICE ID

  test('Generates a random device ID and stores it', async () => {
    const envData = await loadEnvironment();
    expect(envData.deviceId).toMatch(/^chromatix-[0-9a-f]{32}$/);
    expect(localStorage.getItem(config.storageDeviceIdKey)).not.toBeNull();
  });

  test('Reuses the stored device ID', async () => {
    const { deviceId } = await loadEnvironment();
    const envData = await loadEnvironment();
    expect(envData.deviceId).toBe(deviceId);
  });

  test('Generates a different device ID once storage is cleared', async () => {
    const { deviceId } = await loadEnvironment();
    localStorage.clear();
    const envData = await loadEnvironment();
    expect(envData.deviceId).not.toBe(deviceId);
  });

  test('Still returns a device ID when storing it fails', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    const envData = await loadEnvironment();
    expect(envData.deviceId).toMatch(/^chromatix-[0-9a-f]{32}$/);
    expect(localStorage.getItem(config.storageDeviceIdKey)).toBeNull();
  });

  // SIMULATED ELECTRON

  test('Simulates Electron on Windows', async () => {
    simulate('electron-win');
    const envData = await loadEnvironment();
    expect(envData.isElectron).toBe(true);
    expect(envData.electronPlatformId).toBe('win');
    expect(envData.electronPlatformName).toBe('Windows');
    expect(envData.osName).toBe('Windows');
    expect(envData.browserName).toBe('Chromatix');
    expect(envData.electronVersion).toBe('0.3.1+simulated');
  });

  test('Leaves isRealElectron and server-facing fields untouched when simulating Electron', async () => {
    simulate('electron-lin');
    const envData = await loadEnvironment();
    expect(envData.isRealElectron).toBe(false);
    expect(envData.appPlatformName).toBe('Web');
    expect(envData.deviceName).toBe('Chromatix for Web');
  });

  // SIMULATED WEB

  test('Simulates a web browser on Linux', async () => {
    simulate('web-lin');
    const envData = await loadEnvironment();
    expect(envData.isElectron).toBe(false);
    expect(envData.osName).toBe('Linux');
    expect(envData.electronPlatformId).toBeNull();
    expect(envData.electronPlatformName).toBeNull();
    expect(envData.electronVersion).toBeNull();
  });

  // IGNORED VALUES

  test.each(['actual', 'electron-xyz', 'foo', 'web', ''])('Ignores invalid stored value "%s"', async (value) => {
    simulate(value);
    const envData = await loadEnvironment();
    expect(envData.isElectron).toBe(false);
    expect(envData.electronPlatformId).toBeNull();
    expect(envData.electronVersion).toBeNull();
  });

  test('Ignores the simulated environment in production', async () => {
    vi.stubEnv('VITE_ENV', 'production');
    simulate('electron-win');
    const envData = await loadEnvironment();
    expect(envData.isElectron).toBe(false);
    expect(envData.electronPlatformId).toBeNull();
  });

  test('Ignores the simulated environment when running in real Electron', async () => {
    window.isElectron = true;
    window.electronProcess = { platform: 'darwin', appVersion: '1.2.3' };
    simulate('web-win');
    const envData = await loadEnvironment();
    expect(envData.isElectron).toBe(true);
    expect(envData.isRealElectron).toBe(true);
    expect(envData.electronPlatformId).toBe('mac');
    expect(envData.osName).toBe('macOS');
    expect(envData.electronVersion).toBe('1.2.3');
  });
});
