// ======================================================================
// IMPORTS
// ======================================================================

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';

import { Button, Icon } from 'js/components';

import style from './ViewUsers.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ViewUsers = ({ entries }) => {
  const [pinUser, setPinUser] = useState(null);
  const [renderPinEntry, setRenderPinEntry] = useState(false);

  if (!entries) return null;

  if (renderPinEntry) {
    return <UserForm pinUser={pinUser} setRenderPinEntry={setRenderPinEntry} />;
  } else {
    return <UserList entries={entries} setPinUser={setPinUser} setRenderPinEntry={setRenderPinEntry} />;
  }
};

const UserList = ({ entries, setPinUser, setRenderPinEntry }) => {
  const dispatch = useDispatch();

  return (
    <div className={style.wrap}>
      <div className={style.grid} data-total={entries.length}>
        {entries.map((entry, index) => {
          return (
            <button
              key={index}
              className={style.entry}
              onClick={() => {
                if (entry.pinProtected) {
                  setPinUser(entry);
                  setRenderPinEntry(true);
                } else {
                  dispatch.sessionModel.setCurrentUser({ user: entry });
                }
              }}
            >
              <div>
                <div className={style.thumb}>
                  {!entry?.thumb && (
                    <span className={style.thumbIcon}>
                      <Icon icon="ArtistCollectionsIcon" cover stroke strokeWidth={3} />
                    </span>
                  )}
                  {entry?.thumb && <img src={entry?.thumb} alt="Profile" draggable="false" />}
                </div>
                <div className={style.title}>{entry.displayName}</div>
                {entry.admin && <div className={style.admin}>Admin</div>}
                {entry.restrictionProfile && <div>{formatRestrictionProfile(entry.restrictionProfile)}</div>}
                {entry.guest && <div>Guest</div>}
                {!entry.admin && !entry.restrictionProfile && !entry.guest && <div>Standard</div>}
                {entry.pinProtected && <div>Pin Protected</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const UserForm = ({ pinUser, setRenderPinEntry }) => {
  const dispatch = useDispatch();

  const initialValues = {
    pin: '',
  };

  const validationSchema = yup.object({
    // pin is required and must be 4 characters long
    pin: yup.string().required('Pin is required').length(4, 'Pin must be exactly 4 characters'),
  });

  const onSubmit = (values, { setFieldTouched, setFieldValue, setFieldError, setSubmitting }) => {
    console.log(values);
    dispatch.sessionModel.setCurrentUser({ user: pinUser, pin: values.pin });
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
      {({ errors, touched, isSubmitting }) => (
        <div className={style.wrap}>
          <Form className={style.form}>
            <div>
              <Field
                className={style.input}
                type="password"
                id="pin"
                name="pin"
                maxLength={4}
                autoComplete="off"
                data-form-type="other"
                data-1p-ignore="true"
                data-bwignore="true"
                data-lpignore="true"
              />
              {/* {errors.pin && touched.pin && <div className={style.errorField}>{errors.pin}</div>} */}
            </div>
            <div className={style.submit}>
              <Button type="submit" size="small" color="primary" disabled={isSubmitting}>
                Submit
              </Button>
            </div>
            <div className={style.cancel}>
              <Button size="tiny" color="tertiary" onClick={() => setRenderPinEntry(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      )}
    </Formik>
  );
};

// ======================================================================
// HELPER FUNCTIONS
// ======================================================================

const formatRestrictionProfile = (profile) => {
  if (!profile) return '';
  profile = snakeToTitleCase(profile);
  profile = profile.replace('Little', 'Younger');
  return profile;
};

const snakeToTitleCase = (string) => {
  if (!string) return '';
  return string
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ======================================================================
// EXPORT
// ======================================================================

export default ViewUsers;
