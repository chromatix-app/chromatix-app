// ======================================================================
// IMPORTS
// ======================================================================

import moment from 'moment';

import style from './SettingsAbout.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const isElectron = window?.isElectron;
const electronPlatform = (isElectron && window?.electronProcess?.platform) || null;
const electronVersion = (isElectron && window?.electronProcess?.appVersion) || null;
const electronDate = (isElectron && window?.electronProcess?.buildDate) || null;

const appDate = electronDate ? moment(electronDate * 1000) : null;
const webDate = moment(process.env.REACT_APP_DATE * 1000);

const capitalise = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const SettingsAbout = () => {
  return (
    <div className={style.wrap}>
      {isElectron && (electronVersion || electronPlatform || electronDate) && (
        <div className={style.group}>
          <div className={style.title}>Chromatix Desktop</div>
          <div className={style.body}>
            {electronVersion && (
              <p>
                Version: <strong>{electronVersion}</strong>
              </p>
            )}
            {electronPlatform && (
              <p>
                Platform: <strong>{capitalise(electronPlatform)}</strong>
              </p>
            )}
            {electronDate && (
              <p>
                Compiled: <strong>{appDate.format('dddd Do MMMM YYYY')}</strong> at{' '}
                <strong>{appDate.format('HH:mm:ss')}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      <div className={style.group}>
        <div className={style.title}>Chromatix Web App</div>
        <div className={style.body}>
          <p>
            Version: <strong>{process.env.REACT_APP_VERSION}</strong>
          </p>
          <p>
            Environment: <strong>{capitalise(process.env.REACT_APP_ENV)}</strong>
          </p>
          <p>
            Compiled: <strong>{webDate.format('dddd Do MMMM YYYY')}</strong> at{' '}
            <strong>{webDate.format('HH:mm:ss')}</strong>
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
