import { useState, useCallback } from 'react';
import clsx from 'clsx';

import { Icon } from 'js/components';
import * as plex from 'js/services/plex';

import style from './StarRating.module.scss';

const StarRating = ({ type, ratingKey, rating = 0, inline, size = 14, editable = false, alwaysVisible = false }) => {
  const [displayRating, setDisplayRating] = useState(null);

  const actualRating = displayRating ? displayRating : rating;
  const halfRating = actualRating / 2;

  const handleMouseEnter = useCallback((e) => {
    setDisplayRating(e.target.dataset.value);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setDisplayRating(null);
  }, []);

  const handleEdit = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      plex.setStarRating(type, ratingKey, parseInt(e.target.dataset.value));
    },
    [type, ratingKey]
  );

  if (!editable && (!rating || rating === null || rating <= 0)) {
    return null;
  }

  const stars = Array.from({ length: 5 }, (_, i) => {
    let icon;
    if (halfRating >= i + 1) {
      icon = 'StarFullIcon';
    } else if (halfRating > i && halfRating < i + 1) {
      icon = 'StarHalfIcon';
    } else {
      icon = 'StarEmptyIcon';
    }

    return (
      <div
        key={i}
        className={style.star}
        style={{
          width: size,
          height: size,
        }}
      >
        {(displayRating || alwaysVisible || rating > 0) && <Icon icon={icon} cover />}
      </div>
    );
  });

  return (
    <div
      className={clsx(style.wrap, {
        [style.wrapInline]: inline,
        [style.wrapZero]: rating <= 0 && !displayRating,
      })}
      style={{
        width: size * 5,
      }}
    >
      <div className={style.stars}>{stars}</div>
      {editable && (
        <div className={style.editor} onMouseLeave={handleMouseLeave}>
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              className={style.edit}
              onClick={handleEdit}
              onMouseEnter={handleMouseEnter}
              data-value={i}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StarRating;
