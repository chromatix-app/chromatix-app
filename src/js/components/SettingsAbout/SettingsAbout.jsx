// ======================================================================
// IMPORTS
// ======================================================================

import { getEnvironment } from 'js/utils';

import style from './SettingsAbout.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const envData = getEnvironment();

export const SettingsAbout = () => {
  return (
    <div className={style.wrap}>
      {envData.isElectron && (envData.electronVersion || envData.electronPlatformName || envData.electronBuildDate) && (
        <div className={style.group}>
          <div className={style.title}>Chromatix Desktop</div>
          <div className={style.body}>
            {envData.electronVersion && (
              <p>
                Version: <strong>{envData.electronVersion}</strong>
              </p>
            )}
            {envData.electronPlatformName && (
              <p>
                Platform: <strong>{envData.electronPlatformName}</strong>
              </p>
            )}
            {envData.electronBuildDate && (
              <p>
                Compiled: <strong>{envData.electronBuildDate}</strong> at <strong>{envData.electronBuildTime}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      <div className={style.group}>
        <div className={style.title}>Chromatix Web App</div>
        <div className={style.body}>
          <p>
            Version: <strong>{envData.webVersion}</strong>
          </p>
          <p>
            Environment: <strong>{envData.webEnvName}</strong>
          </p>
          <p>
            Compiled: <strong>{envData.webBuildDate}</strong> at <strong>{envData.webBuildTime}</strong>
          </p>
        </div>
      </div>

      <div className={style.legal}>Copyright &copy; {new Date().getFullYear()}</div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsAbout;
