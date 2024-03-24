// ======================================================================
// IMPORTS
// ======================================================================

import { NavLink } from 'react-router-dom';

import style from './Card.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const Card = ({ thumb, title, artist, userRating, link }) => {
  const Component = link ? NavLink : 'div';

  return (
    <Component className={style.card} to={link}>
      <div className={style.thumb}>{thumb && <img src={thumb} alt={title} />}</div>
      <div className={style.body}>
        {title && <div className={style.title}>{title}</div>}
        {artist && <div className={style.subtitle}>{artist}</div>}
        {userRating && <div className={style.title}>{userRating}</div>}
      </div>
    </Component>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Card;
