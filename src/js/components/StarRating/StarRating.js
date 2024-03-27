// ======================================================================
// IMPORTS
// ======================================================================

// import clsx from 'clsx';

import { Icon } from 'js/components';

import style from './StarRating.module.scss';

// ======================================================================
// RENDER
// ======================================================================

const StarRating = ({ rating }) => {
  // based on a rating from 0-10, render a 5 star rating using the StarFullIcon, StarHalfIcon, and StarEmptyIcon components

  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (rating >= i + 1) {
      stars.push(
        <div className={style.star} key={i}>
          <Icon icon="StarFullIcon" cover />
        </div>
      );
    } else if (rating > i) {
      stars.push(
        <div className={style.star} key={i}>
          <Icon icon="StarHalfIcon" cover />
        </div>
      );
    } else {
      stars.push(
        <div className={style.star} key={i}>
          <Icon icon="StarEmptyIcon" cover />
        </div>
      );
    }
  }

  return <div className={style.wrap}>{stars}</div>;
};

// ======================================================================
// EXPORT
// ======================================================================

export default StarRating;
