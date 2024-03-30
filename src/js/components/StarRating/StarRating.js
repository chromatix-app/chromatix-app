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
  const stars = [];
  const halfRating = rating / 2;

  for (let i = 0; i < 5; i++) {
    if (halfRating >= i + 1) {
      stars.push(
        <div className={style.star} key={i}>
          <Icon icon="StarFullIcon" cover />
        </div>
      );
    } else if (halfRating > i && halfRating < i + 1) {
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
