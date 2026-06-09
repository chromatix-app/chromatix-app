// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';

import { Icon } from 'js/components';

import style from './ViewServers.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

// const isProduction = import.meta.env.VITE_ENV === 'production';
// const serverProtocol = isProduction ? 'https://' : 'http://';

const ViewServers = ({ entries, variant }) => {
  const dispatch = useDispatch();

  if (entries) {
    if (variant === 'servers') {
      return (
        <div className={style.wrap}>
          {entries.map((entry, index) => {
            return (
              <button
                type="button"
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
                  {/* <div className={style.url}>
                    {serverProtocol}
                    {entry.host}:{entry.port}
                  </div> */}
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
                type="button"
                key={index}
                className={style.entry}
                onClick={() => {
                  dispatch.sessionModel.setCurrentLibrary(entry);
                }}
              >
                <div className={style.icon}>
                  <Icon icon="MusicNoteDoubleIcon" cover stroke />
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

export default ViewServers;
