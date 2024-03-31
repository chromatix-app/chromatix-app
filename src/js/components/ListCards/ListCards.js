// ======================================================================
// IMPORTS
// ======================================================================

import React, { useCallback } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
// import moment from 'moment';

import { StarRating } from 'js/components';
import { durationToStringLong } from 'js/utils';

import style from './ListCards.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ListCards = ({ entries }) => {
  if (entries) {
    return (
      <div className={style.wrap}>
        {entries.map((entry, index) => (
          <ListEntry key={index} {...entry} />
        ))}
      </div>
    );
  }
};

const ListEntry = React.memo(({ thumb, title, artist, artistLink, duration, userRating, link, totalTracks }) => {
  const history = useHistory();

  const handleCardClick = useCallback(
    (event) => {
      if (link) {
        history.push(link);
      }
    },
    [link, history]
  );

  const handleLinkClick = useCallback((event) => {
    event.stopPropagation();
  }, []);

  // const albumRelease = releaseDate ? moment(releaseDate).format('YYYY') : null;

  return (
    <div className={style.card} onClick={handleCardClick}>
      <div className={style.thumb}>{thumb && <img src={thumb} alt={title} />}</div>
      <div className={style.body}>
        {title && <div className={style.title}>{title}</div>}

        {artist && !artistLink && <div className={style.subtitle}>{artist}</div>}
        {artist && artistLink && (
          <NavLink className={style.subtitle} to={artistLink} onClick={handleLinkClick}>
            {artist}
          </NavLink>
        )}

        {totalTracks && <div className={style.subtitle}>{totalTracks + ' tracks'}</div>}
        {duration && <div className={style.subtitle}>{durationToStringLong(duration)}</div>}

        {/* {albumRelease && <div className={style.subtitle}>{albumRelease}</div>} */}

        {userRating && (
          <div className={style.rating}>
            <StarRating rating={userRating} />
          </div>
        )}
      </div>
    </div>
  );
});

// ======================================================================
// EXPORT
// ======================================================================

export default ListCards;
