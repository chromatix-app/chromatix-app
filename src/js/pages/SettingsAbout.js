// ======================================================================
// IMPORTS
// ======================================================================

import moment from 'moment';

import { PageText, TitleHeading } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const isElectron = window?.isElectron;
const electronVersion = (isElectron && window?.electronProcess?.version) || null;

const momentDate = moment(process.env.REACT_APP_DATE * 1000);

const capitalise = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const Component = () => {
  return (
    <>
      <TitleHeading title="About Chromatix" />
      <PageText>
        {electronVersion && (
          <p>
            Version: <strong>{electronVersion}</strong>
          </p>
        )}
        <p>
          Web app version: <strong>{process.env.REACT_APP_VERSION}</strong>
        </p>
        <p>
          Environment: <strong>{capitalise(process.env.REACT_APP_ENV)}</strong>
        </p>
        <p>
          Compiled: <strong>{momentDate.format('dddd Do MMMM YYYY')}</strong> at{' '}
          <strong>{momentDate.format('HH:mm:ss')}</strong>
        </p>
        <p>Copyright &copy; {new Date().getFullYear()}</p>
      </PageText>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
