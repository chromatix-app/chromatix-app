import { useCallback } from 'react';
import clsx from 'clsx';

import { Icon } from 'js/components';
import * as bridge from 'js/services/bridge';

import style from './Favourite.module.scss';

const Favourite = ({ editable = false, isFavourite, itemId, type, variant }) => {
  const variantClassName = 'wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1);

  const toggleFavourite = useCallback(
    (event) => {
      if (!editable) return;
      event.preventDefault();
      event.stopPropagation();
      bridge.toggleFavourite(type, itemId, !isFavourite);
    },
    [editable, isFavourite, itemId, type]
  );

  return (
    <span className={clsx(style.wrap, style[variantClassName], { [style.wrapEditable]: editable })}>
      <span className={style.outer} onClick={toggleFavourite}>
        <span className={style.inner} onClick={toggleFavourite}>
          {isFavourite ? <Icon icon="HeartIcon" cover /> : <Icon icon="HeartIcon" cover stroke />}
        </span>
      </span>
    </span>
  );
};

export default Favourite;
