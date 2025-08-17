import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';

import { Icon } from 'js/components';
import * as bridge from 'js/services/bridge';

import style from './StarRating.module.scss';

const StarRating = ({
  variant,
  type,
  ratingKey,
  rating = 0,
  inline,
  size = 13,
  editable = false,
  showIfZero = true,
  onlyShowOnHover = false,
}) => {
  const [displayRating, setDisplayRating] = useState(null);
  const useHalfStars = useSelector((state) => state.sessionModel.optionUseHalfStars);

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
      bridge.setStarRating(type, ratingKey, parseInt(e.target.dataset.value));
    },
    [type, ratingKey]
  );

  if (!showIfZero && (!rating || rating === null || rating <= 0)) {
    return null;
  }

  const variantClassName = 'wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1);
  const actualRating = displayRating ? displayRating : rating;
  const starValue = actualRating / 2;

  const stars = Array.from({ length: 5 }, (_, i) => {
    let icon;
    if (starValue >= i + 1) {
      icon = 'StarFullIcon';
    } else if (starValue > i) {
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
        {/* {(!onlyShowOnHover || displayRating || rating > 0) && <Icon icon={icon} cover />} */}
        <Icon icon={icon} cover />
      </div>
    );
  });

  return (
    <div
      className={clsx(style.wrap, style[variantClassName], {
        [style.wrapInline]: inline,
        [style.wrapZero]: !displayRating && rating <= 0,
        [style.wrapShowOnHover]: onlyShowOnHover && !displayRating && rating <= 0,
      })}
      style={{
        width: size * 5 + 8,
        height: size,
      }}
    >
      <div className={style.stars}>{stars}</div>
      {editable && (
        <div className={style.editor} onMouseLeave={handleMouseLeave}>
          {(() => {
            const editorValues = useHalfStars ? Array.from({ length: 11 }, (_, i) => i) : [0, 2, 4, 6, 8, 10];
            return editorValues.map((value) => (
              <button
                key={value}
                className={style.edit}
                onClick={handleEdit}
                onMouseEnter={handleMouseEnter}
                data-value={value}
                tabIndex={-1}
              />
            ));
          })()}
        </div>
      )}
    </div>
  );
};

export default StarRating;
