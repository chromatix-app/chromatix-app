// ======================================================================
// IMPORTS
// ======================================================================

import { NavLink } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import clsx from 'clsx';

import { Button } from 'js/components';
import * as bridge from 'js/services/bridge';

import style from './PageLoginJelly.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

const devServer = process.env.REACT_APP_JELLY_SERVER || '';
const devUsername = process.env.REACT_APP_JELLY_USERNAME || '';
const devPassword = process.env.REACT_APP_JELLY_PASSWORD || '';

export const PageLoginJelly = () => {
  const initialValues = {
    server: isLocal ? devServer : '',
    username: isLocal ? devUsername : '',
    password: isLocal ? devPassword : '',
    general: '',
  };

  const validationSchema = yup.object({
    server: yup
      .string()
      .url('Invalid URL')
      .test('is-https', 'Server address must use HTTPS', (value) => {
        if (!value) return false;
        if (window.location.protocol === 'https:') {
          return value.toLowerCase().startsWith('https://');
        }
        return true;
      })
      .required('Server address is required'),
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
  });

  const onSubmit = (values, { setFieldTouched, setFieldValue, setFieldError, setSubmitting }) => {
    bridge.jellyLogin(values).catch((err) => {
      setSubmitting(false);
      setFieldTouched('password', false);
      setFieldValue('password', '', false);
      setTimeout(function () {
        setFieldError(
          'general',
          <>
            Sorry, we couldn't log you in.
            <br />
            Are your server address and login details correct?
            {window.location.protocol === 'https:' && (
              <>
                <br />
                Your server must have a valid SSL certificate.
              </>
            )}
          </>
        );
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
            Your Jellyfin server must have a valid SSL certificate. If you are using a self-signed certificate, you may
            need to add an exception in your browser.
          </p>
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

      <div className={style.border}></div>

      <div className={style.legal}>Copyright &copy; {new Date().getFullYear()}</div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PageLoginJelly;
