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

export const PageLoginJelly = () => {
  const initialValues = {
    server: isLocal ? 'http://192.168.1.201:8096' : '',
    username: isLocal ? 'Alex' : '',
    password: '',
    general: '',
  };

  const validationSchema = yup.object({
    server: yup.string().url('Invalid URL').required('Server address is required'),
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

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
          {({ errors, touched, isSubmitting }) => (
            <Form className={style.form}>
              <div className={style.formRow}>
                <label htmlFor="server">Jellyfin Server Address *</label>
                <Field type="text" id="server" name="server" placeholder="Example: http://192.168.0.1:8096" />
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
