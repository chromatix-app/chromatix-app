// ======================================================================
// IMPORTS
// ======================================================================

import React from 'react';
import moment from 'moment';

import { Icon } from 'js/components';

import style from './ListSet.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ListSet = ({ entries }) => {
  const totalDiscs = entries.reduce((acc, entry) => {
    return Math.max(acc, entry.discNumber);
  }, 0);

  let currentDisc = 0;

  if (entries) {
    return (
      <div className={style.wrap}>
        {entries.map((entry, index) => {
          const showDisc = totalDiscs > 1 && currentDisc !== entry.discNumber;
          currentDisc = entry.discNumber;
          return (
            <React.Fragment key={index}>
              {showDisc && (
                <div className={style.disc}>
                  <div className={style.discIcon}>
                    <Icon icon="DiscIcon" cover stroke />
                  </div>
                  <div className={style.discNumber}>Disc {entry.discNumber}</div>
                </div>
              )}

              <div className={style.entry}>
                <div className={style.trackNumber}>{entry.trackNumber}</div>
                <div className={style.title}>{entry.title}</div>
                <div className={style.artist}>{entry.artist}</div>
                <div className={style.userRating}>{entry.userRating ? entry.userRating : '-'}</div>
                <div className={style.duration}>{`${Math.floor(
                  moment.duration(entry.duration, 'milliseconds').asMinutes()
                )}:${String(moment.duration(entry.duration, 'milliseconds').seconds()).padStart(2, '0')}`}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  }
};

// ======================================================================
// EXPORT
// ======================================================================

export default ListSet;
