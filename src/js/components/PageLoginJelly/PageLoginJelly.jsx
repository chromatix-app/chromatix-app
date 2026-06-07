// ======================================================================
// IMPORTS
// ======================================================================

import { NavLink } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import { object, string } from 'yup';
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

export const PageLoginJelly = () => {
  const initialValues = {
    server: isLocal ? devServer : '',
    username: isLocal ? devUsername : '',
    password: isLocal ? devPassword : '',
    general: '',
  };

  const validationSchema = object({
    server: string()
      .url('Invalid URL')
      .test('is-https', 'Server address must use HTTPS', (value) => {
        if (!value) return false;
        if (window.location.protocol === 'https:') {
          return value.toLowerCase().startsWith('https://');
        }
        return true;
      })
      .required('Server address is required'),
    username: string().required('Username is required'),
    password: string().required('Password is required'),
  });

  const onSubmit = (values, { setFieldTouched, setFieldValue, setFieldError, setSubmitting }) => {
    bridge.jellyLogin(values).catch((err) => {
      setSubmitting(false);
      setFieldTouched('password', false);
      setFieldValue('password', '', false);
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
          setFieldError(
            'general',
            <>
              <p>Sorry, we couldn't log you in.</p>
              <p>Your server must be running and have a valid SSL certificate.</p>
            </>
          );
        } else {
          setFieldError(
            'general',
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

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
          {({ errors, touched, isSubmitting }) => (
            <Form className={style.form}>
              <div className={style.formRow}>
                <label htmlFor="server">Jellyfin Server Address *</label>
                <Field type="text" id="server" name="server" placeholder="Example: https://192.168.0.1:8920" />
                {errors.server && touched.server && <div className={style.errorField}>{errors.server}</div>}
              </div>

              <div className={style.formRow}>
                <label htmlFor="username">Jellyfin Username *</label>
                <Field type="text" id="username" name="username" />
                {errors.username && touched.username && <div className={style.errorField}>{errors.username}</div>}
              </div>

              <div className={style.formRow}>
                <label htmlFor="password">Password *</label>
                <Field type="password" id="password" name="password" />
                {errors.password && touched.password && <div className={style.errorField}>{errors.password}</div>}
              </div>

              <div className={style.buttonRow}>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Logging in...' : 'Login with Jellyfin'}
                </Button>
              </div>

              {errors.general && touched.general && <div className={style.errorGeneral}>{errors.general}</div>}

              <div className={style.links}>
                <NavLink to="/">Back to Home</NavLink>
              </div>
            </Form>
          )}
        </Formik>
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
// EXPORT
// ======================================================================

export default PageLoginJelly;
