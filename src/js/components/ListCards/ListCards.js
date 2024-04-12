// ======================================================================
// IMPORTS
// ======================================================================

import React, { useCallback } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import clsx from 'clsx';

import { Icon, StarRating } from 'js/components';
import { durationToStringLong } from 'js/utils';

import style from './ListCards.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ListCards = ({ entries, variant }) => {
  if (entries) {
    return (
      <div className={clsx(style.wrap, style['wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1)])}>
        {entries.map((entry, index) => (
          <ListEntry key={index} variant={variant} {...entry} />
        ))}
      </div>
    );
  }
};

const ListEntry = React.memo(
  ({ thumb, title, artist, artistLink, duration, userRating, link, totalTracks, variant }) => {
    const history = useHistory();

    const { optionGridEllipsis, optionGridRatings } = useSelector(({ sessionModel }) => sessionModel);

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
        <div className={style.thumb}>
          {thumb && <img src={thumb} alt={title} loading="lazy" />}

          {(variant === 'genres' || variant === 'styles') && (
            <div className={style.icon}>
              <Icon icon="MusicNoteIcon" cover stroke strokeWidth={2} />
            </div>
          )}
        </div>

        <div className={style.body}>
          {title && <div className={clsx(style.title, { 'text-trim': optionGridEllipsis })}>{title}</div>}

          {artist && !artistLink && (
            <div className={clsx(style.subtitle, { 'text-trim': optionGridEllipsis })}>{artist}</div>
          )}

          {artist && artistLink && (
            <NavLink
              className={clsx(style.subtitle, { 'text-trim': optionGridEllipsis })}
              to={artistLink}
              onClick={handleLinkClick}
            >
              {artist}
            </NavLink>
          )}

          {totalTracks && <div className={style.subtitle}>{totalTracks + ' tracks'}</div>}

          {duration && <div className={style.subtitle}>{durationToStringLong(duration)}</div>}

          {/* {albumRelease && <div className={style.subtitle}>{albumRelease}</div>} */}

          {optionGridRatings && userRating && (
            <div className={style.rating}>
              <StarRating rating={userRating} />
            </div>
          )}
        </div>
      </div>
    );
  }
);

// ======================================================================
// EXPORT
// ======================================================================

export default ListCards;
