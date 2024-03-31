// ======================================================================
// IMPORTS
// ======================================================================

import { NavLink } from 'react-router-dom';
// import moment from 'moment';

import { StarRating } from 'js/components';
import { durationToStringLong } from 'js/utils';

import style from './Card.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const Card = ({ thumb, title, artist, duration, userRating, link, releaseDate, totalTracks }) => {
  const Component = link ? NavLink : 'div';

  // const albumRelease = releaseDate ? moment(releaseDate).format('YYYY') : null;

  return (
    <Component className={style.card} to={link}>
      <div className={style.thumb}>{thumb && <img src={thumb} alt={title} />}</div>
      <div className={style.body}>
        {title && <div className={style.title}>{title}</div>}
        {artist && <div className={style.subtitle}>{artist}</div>}

        {totalTracks && <div className={style.subtitle}>{totalTracks + ' tracks'}</div>}
        {duration && <div className={style.subtitle}>{durationToStringLong(duration)}</div>}

        {/* {albumRelease && <div className={style.subtitle}>{albumRelease}</div>} */}

        {userRating && (
          <div className={style.rating}>
            <StarRating rating={userRating} />
          </div>
        )}
      </div>
    </Component>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Card;
