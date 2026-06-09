// ======================================================================
// IMPORTS
// ======================================================================

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Button, FormOTP, Icon } from 'js/components';

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
              type="button"
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
                  {!entry?.thumbSm && (
                    <span className={style.thumbIcon}>
                      <Icon icon="ArtistCollectionsIcon" cover stroke strokeWidth={3} />
                    </span>
                  )}
                  {entry?.thumbSm && <img src={entry?.thumbSm} alt="Profile" draggable="false" />}
                </div>

                <div className={style.title}>{entry.displayName}</div>

                <div>
                  {entry.admin && (
                    <span className={style.iconAdmin}>
                      <Icon icon="CrownIcon" cover />
                    </span>
                  )}

                  {entry.admin && <>Admin</>}
                  {entry.restrictionProfile && <>{formatRestrictionProfile(entry.restrictionProfile)}</>}
                  {entry.guest && <>Guest</>}
                  {!entry.admin && !entry.restrictionProfile && !entry.guest && <>Standard</>}
                </div>
              </div>

              {entry.pinProtected && (
                <div className={style.locked}>
                  <span className={style.iconLock}>
                    <Icon icon="PadlockIcon" cover stroke />
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const UserForm = ({ pinUser, setRenderPinEntry }) => {
  const dispatch = useDispatch();
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (pin.length === 4 && !isSubmitting) {
      setIsSubmitting(true);
      dispatch.sessionModel.setCurrentUser({ user: pinUser, pin });
    }
  }, [pin, isSubmitting, dispatch.sessionModel, pinUser]);

  // [NOTE] We don't really need to handle submission state here,
  // because useGotRequiredData stops anything from rendering anyway
  if (isSubmitting) {
    return null;
  }

  return (
    <div className={style.wrap}>
      <div className={style.form}>
        <div className={style.otpWrapper}>
          <FormOTP value={pin} onChange={setPin} autoFocus />
        </div>
        <div className={style.cancel}>
          <Button size="tiny" color="secondary" onClick={() => setRenderPinEntry(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
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
