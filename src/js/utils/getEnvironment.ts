import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

import getBrowserName from './getBrowserName';
import getElectronDetails from './getElectronDetails';
import getOperatingSystemName from './getOperatingSystemName';

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
    deviceId: 'Chromatix',
    deviceName: '',
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

const capitalise = (string?: string): string | null => {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : null;
};

export default getEnvironment;
