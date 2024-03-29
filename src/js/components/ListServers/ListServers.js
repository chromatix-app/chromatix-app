// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';

import { Icon } from 'js/components';

import style from './ListServers.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const isProduction = process.env.REACT_APP_ENV === 'production';
const plexServerProtocol = isProduction ? 'https://' : 'http://';

const ListServers = ({ entries, variant }) => {
  const dispatch = useDispatch();

  if (entries) {
    if (variant === 'servers') {
      return (
        <div className={style.wrap}>
          {entries.map((entry, index) => {
            return (
              <button
                key={index}
                className={style.entry}
                onClick={() => {
                  dispatch.sessionModel.setCurrentServer(entry);
                }}
              >
                <div className={style.icon}>
                  <Icon icon="ServerIcon" cover stroke />
                </div>
                <div>
                  <div className={style.title}>{entry.name}</div>
                  <div className={style.url}>
                    {plexServerProtocol}
                    {entry.host}:{entry.port}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      );
    } else if (variant === 'libraries') {
      return (
        <div className={style.wrap}>
          {entries.map((entry, index) => {
            return (
              <button
                key={index}
                className={style.entry}
                onClick={() => {
                  dispatch.sessionModel.setCurrentLibrary(entry);
                }}
              >
                <div className={style.icon}>
                  <Icon icon="MusicNoteIcon" cover stroke />
                </div>
                <div>
                  <div className={style.title}>{entry.title}</div>
                </div>
              </button>
            );
          })}
        </div>
      );
    }
  }
};

// ======================================================================
// EXPORT
// ======================================================================

export default ListServers;
