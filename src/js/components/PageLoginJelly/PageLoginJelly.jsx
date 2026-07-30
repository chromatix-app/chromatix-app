// ======================================================================
// IMPORTS
// ======================================================================

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
import clsx from 'clsx';

import { Button } from 'js/components';
import * as bridge from 'js/services/bridge';
import { getEnvironment } from 'js/utils';

import style from './PageLoginJelly.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const isLocal = import.meta.env.VITE_ENV === 'local';

const devServer = import.meta.env.VITE_JELLY_SERVER || '';
const devUsername = import.meta.env.VITE_JELLY_USERNAME || '';
const devPassword = import.meta.env.VITE_JELLY_PASSWORD || '';

const envData = getEnvironment();

const initialValues = {
  server: isLocal ? devServer : '',
  username: isLocal ? devUsername : '',
  password: isLocal ? devPassword : '',
};

export const PageLoginJelly = () => {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);
    setTouched({ server: true, username: true, password: true });
    setGeneralError(null);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    bridge.jellyLogin(values).catch((err) => {
      setIsSubmitting(false);
      setTouched((prev) => ({ ...prev, password: false }));
      setValues((prev) => ({ ...prev, password: '' }));
      setTimeout(function () {
        if (
          [
            'CERT_AUTHORITY_INVALID',
            'CERT_REJECTED',
            'CERT_UNTRUSTED',
            'DEPTH_ZERO_SELF_SIGNED_CERT',
            'ERR_CERT_AUTHORITY_INVALID',
            'ERR_CERT_REJECTED',
            'ERR_CERT_UNTRUSTED',
            'ERR_NETWORK',
            'ERR_TLS_CERT_ALTNAME_INVALID',
            'SELF_SIGNED_CERT_IN_CHAIN',
          ].includes(err?.error?.code)
        ) {
          setGeneralError(
            <>
              <p>Sorry, we couldn't log you in.</p>
              <p>Your server must be running and have a valid SSL certificate.</p>
            </>
          );
        } else {
          setGeneralError(
            <>
              <p>Sorry, we couldn't log you in.</p>
              <p>Are your login details correct?</p>
              {window.location.protocol === 'https:' && <p>Your server must have a valid SSL certificate.</p>}
            </>
          );
        }
      }, 10);
    });
  };

  return (
    <div className={clsx(style.wrap, 'text-center')}>
      <div className={style.main}>
        <h1 className={style.title}>Login with Jellyfin</h1>
        <h2 className={style.subtitle}>(Beta)</h2>
        <div className={style.body}>
          <p>
            Right now you can only log into one service at a time, and settings are not shared between accounts. We hope
            to add multiple account support soon.
          </p>
        </div>

        <form className={style.form} onSubmit={handleSubmit}>
          <div className={style.formRow}>
            <label htmlFor="server">Jellyfin Server Address *</label>
            <input
              type="text"
              id="server"
              name="server"
              placeholder="Example: https://192.168.0.1:8920"
              value={values.server}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.server && touched.server && <div className={style.errorField}>{errors.server}</div>}
          </div>

          <div className={style.formRow}>
            <label htmlFor="username">Jellyfin Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.username && touched.username && <div className={style.errorField}>{errors.username}</div>}
          </div>

          <div className={style.formRow}>
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && touched.password && <div className={style.errorField}>{errors.password}</div>}
          </div>

          <div className={style.buttonRow}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login with Jellyfin'}
            </Button>
          </div>

          {generalError && <div className={style.errorGeneral}>{generalError}</div>}

          <div className={style.links}>
            <NavLink to="/">Back to Home</NavLink>
          </div>
        </form>
      </div>

      <div className={style.troubleshooting}>
        <h2 className={style.subtitle}>Troubleshooting</h2>
        <div className={style.body}>
          {!envData.isElectron && (
            <>
              <p>Your Jellyfin server must be running and have a valid SSL certificate.</p>
              <p>If you are using a self-signed certificate, you may need to add an exception in your browser.</p>
            </>
          )}
          {envData.isElectron && (
            <>
              <p>Your Jellyfin server must be running and have a valid SSL certificate.</p>
              <p>
                Alternatively, you can toggle "Allow Insecure Connections" in the "Advanced" section of the main menu to
                allow logging in to unsecured servers, but this is not advised.
              </p>
            </>
          )}
        </div>
      </div>

      <div className={style.border}></div>

      <div className={style.legal}>Copyright &copy; {new Date().getFullYear()}</div>
    </div>
  );
};

// ======================================================================
// HELPERS
// ======================================================================

const isValidUrl = (value) => {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const validate = (values) => {
  const errors = {};

  if (!values.server) {
    errors.server = 'Server address is required';
  } else if (!isValidUrl(values.server)) {
    errors.server = 'Invalid URL';
  } else if (window.location.protocol === 'https:' && !values.server.toLowerCase().startsWith('https://')) {
    errors.server = 'Server address must use HTTPS';
  }

  if (!values.username) errors.username = 'Username is required';
  if (!values.password) errors.password = 'Password is required';

  return errors;
};

// ======================================================================
// EXPORT
// ======================================================================

export default PageLoginJelly;
