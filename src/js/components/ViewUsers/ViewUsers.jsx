// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';

import { Icon } from 'js/components';

import style from './ViewUsers.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ViewUsers = ({ entries, variant }) => {
  const dispatch = useDispatch();

  if (entries) {
    console.log(entries);

    return (
      <div className={style.wrap}>
        <div className={style.grid} data-total={entries.length}>
          {entries.map((entry, index) => {
            return (
              <button
                key={index}
                className={style.entry}
                onClick={() => {
                  dispatch.sessionModel.setCurrentUser(entry);
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
  }
};

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
