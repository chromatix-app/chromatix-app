import { isElectron } from './environment';
import getBrowserName from './getBrowserName';
import getOperatingSystemName from './getOperatingSystemName';

/**
 * Gets an appropriate platform name to provide to the media provider based on whether the user is using the Electron version or not
 * @returns The detected platform name or 'Unknown'
 */
const getPlayerPlatformName = (): string => {
  let platformName;

  if (isElectron) {
    platformName = getOperatingSystemName();
  } else {
    platformName = getBrowserName();
  }

  return platformName ?? 'Unknown';
};

export default getPlayerPlatformName;
