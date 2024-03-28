// ======================================================================
// IMPORTS
// ======================================================================

import React from 'react';
import moment from 'moment';
import clsx from 'clsx';

import { Icon, StarRating } from 'js/components';

import style from './ListSet.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ListSet = ({ entries, variant }) => {
  const totalDiscs =
    variant === 'album'
      ? entries.reduce((acc, entry) => {
          return Math.max(acc, entry.discNumber);
        }, 0)
      : 1;

  let currentDisc = 0;

  if (entries) {
    return (
      <div className={clsx(style.wrap, style['wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1)])}>
        {entries.map((entry, index) => {
          const duration = `${Math.floor(moment.duration(entry.duration, 'milliseconds').asMinutes())}:${String(
            moment.duration(entry.duration, 'milliseconds').seconds()
          ).padStart(2, '0')}`;

          const trackNumber = variant === 'playlist' ? index + 1 : entry.trackNumber;

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
                <div className={style.trackNumber}>{trackNumber}</div>
                {variant === 'playlist' && entry.thumb && (
                  <div className={style.thumb}>
                    <img src={entry.thumb} alt={entry.title} />
                  </div>
                )}
                <div className={style.title}>{entry.title}</div>
                <div className={style.artist}>{entry.artist}</div>
                {variant === 'playlist' && <div className={style.album}>{entry.album}</div>}
                <div className={style.userRating}>{entry.userRating && <StarRating rating={entry.userRating} />}</div>
                <div className={style.duration}>{duration}</div>
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
