import moment from 'moment';

type PlatformId = 'lin' | 'mac' | 'win' | 'web';
type RawPlatform = 'darwin' | 'linux' | 'win32';

interface ElectronDetails {
  isElectron: boolean;
  appPlatformId: PlatformId;
  appPlatformName: string;
  electronBuildUnix: number | null;
  electronBuildDate: string | null;
  electronBuildTime: string | null;
  electronPlatformId: PlatformId | null;
  electronPlatformName: string | null;
  electronVersion: string | null;
}

/**
 * Utility to get Electron application details
 * @returns An object containing Electron application details
 */

const getElectronDetails = (): ElectronDetails => {
  const isElectron = window?.isElectron ? true : false;

  const expectedPlatforms: PlatformId[] = ['lin', 'mac', 'win'];
  const rawPlatforms: Record<RawPlatform, PlatformId> = {
    darwin: 'mac',
    linux: 'lin',
    win32: 'win',
  };
  const fullPlatforms: Record<PlatformId, string> = {
    lin: 'Linux',
    mac: 'macOS',
    win: 'Windows',
    web: 'Web',
  };

  let appPlatformId: PlatformId = 'web';
  let appPlatformName: string = 'Web';
  let electronBuildUnix: number | null = null;
  let electronBuildMoment: moment.Moment | null = null;
  let electronBuildDate: string | null = null;
  let electronBuildTime: string | null = null;
  let electronPlatformId: PlatformId | null = null;
  let electronPlatformName: string | null = null;
  let electronVersion: string | null = null;

  if (isElectron) {
    // Detect Electron build date
    if (window?.electronProcess?.buildDate) {
      const buildDateValue = window.electronProcess.buildDate;
      electronBuildUnix = buildDateValue ? parseInt(buildDateValue, 10) : null;
      electronBuildMoment = electronBuildUnix ? moment(electronBuildUnix * 1000) : null;
      electronBuildDate = electronBuildMoment ? electronBuildMoment.format('dddd Do MMMM YYYY') : null;
      electronBuildTime = electronBuildMoment ? electronBuildMoment.format('HH:mm:ss') : null;
    }

    // Detect Electron platform
    if (window?.electronProcess?.platform) {
      let detectedPlatform = window.electronProcess.platform as PlatformId;

      // [NOTE] this is here for backwards compatibility
      if (!expectedPlatforms.includes(detectedPlatform)) {
        detectedPlatform = rawPlatforms[detectedPlatform as RawPlatform] || ('web' as PlatformId);
      }

      electronPlatformId = detectedPlatform;
      electronPlatformName = fullPlatforms[electronPlatformId] || null;

      if (electronPlatformId && electronPlatformName) {
        appPlatformId = electronPlatformId;
        appPlatformName = fullPlatforms[electronPlatformId] || 'Web';
      }
    }

    // Detect Electron app version
    if (window?.electronProcess?.appVersion) {
      electronVersion = window.electronProcess.appVersion;
    }
  }

  return {
    isElectron,
    appPlatformId,
    appPlatformName,
    electronBuildUnix,
    electronBuildDate,
    electronBuildTime,
    electronPlatformId,
    electronPlatformName,
    electronVersion,
  };
};

export default getElectronDetails;
