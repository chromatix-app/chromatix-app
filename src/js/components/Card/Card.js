// ======================================================================
// IMPORTS
// ======================================================================

import { NavLink, useHistory } from 'react-router-dom';
// import moment from 'moment';

import { StarRating } from 'js/components';
import { durationToStringLong } from 'js/utils';

import style from './Card.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const Card = ({ thumb, title, artist, artistLink, duration, userRating, link, releaseDate, totalTracks }) => {
  const history = useHistory();

  const handleCardClick = (event) => {
    if (link) {
      history.push(link);
    }
  };

  const handleLinkClick = (event) => {
    event.stopPropagation();
  };

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
};

// ======================================================================
// EXPORT
// ======================================================================

export default Card;
