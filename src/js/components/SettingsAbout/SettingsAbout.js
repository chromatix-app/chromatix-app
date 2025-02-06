// ======================================================================
// IMPORTS
// ======================================================================

import moment from 'moment';

import { isElectron, electronPlatform, electronVersion, electronBuildDate } from 'js/utils';

import style from './SettingsAbout.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const electronMoment = electronBuildDate ? moment(electronBuildDate * 1000) : null;
const webMoment = moment(process.env.REACT_APP_DATE * 1000);

const capitalise = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const SettingsAbout = () => {
  return (
    <div className={style.wrap}>
      {isElectron && (electronVersion || electronPlatform || electronBuildDate) && (
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
            {electronMoment && (
              <p>
                Compiled: <strong>{electronMoment.format('dddd Do MMMM YYYY')}</strong> at{' '}
                <strong>{electronMoment.format('HH:mm:ss')}</strong>
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
            Compiled: <strong>{webMoment.format('dddd Do MMMM YYYY')}</strong> at{' '}
            <strong>{webMoment.format('HH:mm:ss')}</strong>
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
