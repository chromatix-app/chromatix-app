// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import { Icon } from 'js/components';

import style from './StarRating.module.scss';

// ======================================================================
// RENDER
// ======================================================================

const StarRating = ({ type, ratingKey, rating, inline, size = 14 }) => {
  if (typeof rating === 'number' && rating > 0) {
    const stars = [];
    const halfRating = rating / 2;

    for (let i = 0; i < 5; i++) {
      if (halfRating >= i + 1) {
        stars.push(
          <div
            key={i}
            className={style.star}
            style={{
              width: size,
              height: size,
            }}
          >
            <Icon icon="StarFullIcon" cover />
          </div>
        );
      } else if (halfRating > i && halfRating < i + 1) {
        stars.push(
          <div
            key={i}
            className={style.star}
            style={{
              width: size,
              height: size,
            }}
          >
            <Icon icon="StarHalfIcon" cover />
          </div>
        );
      } else {
        stars.push(
          <div
            key={i}
            className={style.star}
            style={{
              width: size,
              height: size,
            }}
          >
            <Icon icon="StarEmptyIcon" cover />
          </div>
        );
      }
    }

    return (
      <div
        className={clsx(style.wrap, {
          [style.wrapInline]: inline,
        })}
      >
        <div className={style.flex}>
          {stars}
          {/* {type} {ratingKey} */}
        </div>
      </div>
    );
  }
};

// ======================================================================
// EXPORT
// ======================================================================

export default StarRating;
