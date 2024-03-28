// ======================================================================
// IMPORTS
// ======================================================================

import { NavLink } from 'react-router-dom';

import { StarRating } from 'js/components';

import style from './Card.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const Card = ({ thumb, title, artist, userRating, link, totalTracks }) => {
  const Component = link ? NavLink : 'div';

  return (
    <Component className={style.card} to={link}>
      <div className={style.thumb}>{thumb && <img src={thumb} alt={title} />}</div>
      <div className={style.body}>
        {title && <div className={style.title}>{title}</div>}
        {artist && <div className={style.subtitle}>{artist}</div>}
        {totalTracks && <div className={style.subtitle}>{totalTracks + ' tracks'}</div>}
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
