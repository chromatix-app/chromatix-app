import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

import config from 'js/_config/config';

import getBrowserName from './getBrowserName';
import getElectronDetails from './getElectronDetails';
import getLocalStorage from './getLocalStorage';
import getOperatingSystemName from './getOperatingSystemName';
import setLocalStorage from './setLocalStorage';

interface EnvironmentData {
  appName: string;
  appPlatformId: string;
  appPlatformName: string;
  browserName: string;
  deviceId: string;
  deviceName: string;
  electronBuildDate: string | null;
  electronBuildTime: string | null;
  electronBuildUnix: number | null;
  electronPlatformId: string | null;
  electronPlatformName: string | null;
  electronVersion: string | null;
  isElectron: boolean;
  isRealElectron: boolean;
  osName: string;
  webBuildDate: string | null;
  webBuildTime: string | null;
  webBuildUnix: string | null;
  webEnvId: string | null;
  webEnvName: string | null;
  webVersion: string | null;
}

let cachedData: EnvironmentData | null = null;

// const isLocal = import.meta.env.VITE_ENV === 'local';

/**
 * Determine various useful information about the user's environment
 * @returns An object containing the user's environment details
 */

const getEnvironment = (): EnvironmentData => {
  // Return cached value if already computed
  if (cachedData !== null) {
    return cachedData;
  }

  const electronDetails = getElectronDetails();
  const { isElectron } = electronDetails;

  const webBuildUnix = import.meta.env.VITE_DATE || null;
  const webBuildDayjs = webBuildUnix ? dayjs(parseInt(webBuildUnix, 10) * 1000) : null;
  const webBuildDate = webBuildDayjs ? webBuildDayjs.format('dddd Do MMMM YYYY') : null;
  const webBuildTime = webBuildDayjs ? webBuildDayjs.format('HH:mm:ss') : null;

  const envData: EnvironmentData = {
    appName: 'Chromatix',
    browserName: '',
    deviceId: getDeviceId(),
    deviceName: '',
    isRealElectron: isElectron,
    osName: '',
    webBuildDate: webBuildDate,
    webBuildTime: webBuildTime,
    webBuildUnix: webBuildUnix,
    webEnvId: import.meta.env.VITE_ENV || null,
    webEnvName: capitalise(import.meta.env.VITE_ENV),
    webVersion: import.meta.env.VITE_VERSION || null,
    ...electronDetails,
  };

  // If running in Electron, override browser and OS names
  if (isElectron) {
    envData.browserName = 'Chromatix';
    envData.osName = envData.appPlatformName;
  } else {
    envData.browserName = getBrowserName();
    envData.osName = getOperatingSystemName();
  }

  envData.deviceName = 'Chromatix for ' + envData.appPlatformName;

  // Dev only - display the app as if running in another environment
  applySimulatedEnvironment(envData);

  // // Debug logging
  // if (isLocal) {
  //   const sortedKeys = Object.keys(envData).sort();
  //   for (let keyIndex = 0; keyIndex < sortedKeys.length; keyIndex++) {
  //     const key = sortedKeys[keyIndex];
  //     const value = envData[key as keyof EnvironmentData];
  //     console.log(key, ':', value);
  //   }
  // }

  // Cache for efficiency
  cachedData = envData;

  // Return
  return envData;
};

const simulatedOsNames = {
  mac: 'macOS',
  win: 'Windows',
  lin: 'Linux',
} as const;

/**
 * Overrides display-related fields with the environment chosen on the dev components page (e.g. 'electron-win').
 * Browser and non-production only. Server-facing fields (appPlatformName, deviceName) and isRealElectron are left
 * untouched, so API requests and Electron-only behaviour are unaffected.
 */

const applySimulatedEnvironment = (envData: EnvironmentData): void => {
  if (import.meta.env.VITE_ENV === 'production' || envData.isRealElectron) return;

  const [platform, platformId] = getLocalStorage(config.storageDevEnvironmentKey)?.split('-') ?? [];
  const osName = simulatedOsNames[platformId as keyof typeof simulatedOsNames];
  if ((platform !== 'web' && platform !== 'electron') || !osName) return;

  const isElectron = platform === 'electron';

  envData.isElectron = isElectron;
  envData.osName = osName;
  envData.browserName = isElectron ? 'Chromatix' : envData.browserName;
  envData.electronPlatformId = isElectron ? platformId : null;
  envData.electronPlatformName = isElectron ? osName : null;
  envData.electronVersion = isElectron ? '0.3.1+simulated' : null;
};

/**
 * Gets this install's device ID, generating and storing a random one on first use. Jellyfin logs out
 * a user's other sessions on the same device ID, so each install needs its own. Uses getRandomValues
 * rather than randomUUID, which isn't available outside secure contexts (e.g. plain http).
 */

const getDeviceId = (): string => {
  const storedId = getLocalStorage(config.storageDeviceIdKey);
  if (storedId) return storedId;

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const deviceId = 'chromatix-' + Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  try {
    setLocalStorage(config.storageDeviceIdKey, deviceId);
  } catch {
    // Storage full or unavailable: keep the generated ID for this session only, so the app still loads
  }
  return deviceId;
};

const capitalise = (string?: string): string | null => {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : null;
};

export default getEnvironment;
