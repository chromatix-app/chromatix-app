import moment from 'moment';

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

// const isLocal = process.env.REACT_APP_ENV === 'local';

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

  const webBuildUnix = process.env.REACT_APP_DATE || null;
  const webBuildMoment = webBuildUnix ? moment(parseInt(webBuildUnix, 10) * 1000) : null;
  const webBuildDate = webBuildMoment ? webBuildMoment.format('dddd Do MMMM YYYY') : null;
  const webBuildTime = webBuildMoment ? webBuildMoment.format('HH:mm:ss') : null;

  const envData: EnvironmentData = {
    appName: 'Chromatix',
    browserName: '',
    deviceId: 'Chromatix',
    deviceName: '',
    osName: '',
    webBuildDate: webBuildDate,
    webBuildTime: webBuildTime,
    webBuildUnix: webBuildUnix,
    webEnvId: process.env.REACT_APP_ENV || null,
    webEnvName: capitalise(process.env.REACT_APP_ENV),
    webVersion: process.env.REACT_APP_VERSION || null,
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
