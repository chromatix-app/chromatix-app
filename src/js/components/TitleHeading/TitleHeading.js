// ======================================================================
// IMPORTS
// ======================================================================

import { useRef } from 'react';
import clsx from 'clsx';

import { Icon } from 'js/components';
import { useNearTop } from 'js/hooks';

import style from './TitleHeading.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const TitleHeading = ({ title, subtitle, detail, thumb, handlePlay }) => {
  const triggerRef = useRef(null);
  const isNearTop = useNearTop(triggerRef, 90);

  const titleSize = title.length <= 10 ? 'xl' : title.length <= 30 ? 'lg' : title.length <= 40 ? 'md' : 'sm';

  return (
    <>
      <div className={clsx(style.stickyWrap, { [style.stickyWrapVisible]: isNearTop })}>
        <div className={style.stickyContent}>{title && <h1 className={clsx(style.stickyTitle)}>{title}</h1>}</div>
      </div>
      <div className={style.wrap}>
        {thumb && (
          <div className={style.thumb}>
            <img src={thumb} alt={title} />
          </div>
        )}
        <div className={style.content}>
          {title && <h1 className={clsx(style.title, style[titleSize])}>{title}</h1>}
          {subtitle && <h2 className={style.subtitle}>{subtitle}</h2>}
          {detail && <div className={style.detail}>{detail}</div>}
          {handlePlay && (
            <div className={style.buttons}>
              <button className={style.playButton} onClick={() => handlePlay(false)}>
                <span className={style.playIcon}>
                  <Icon icon="PlayFilledIcon" cover />
                </span>
                <span className={style.playText}>Play</span>
              </button>
              <button className={style.shuffleButton} onClick={() => handlePlay(true)}>
                <span className={style.shuffleIcon}>
                  <Icon icon="ShuffleIcon" cover stroke strokeWidth={3} />
                </span>
                <span className={style.shuffleText}>Shuffle</span>
              </button>
            </div>
          )}
        </div>
        <div ref={triggerRef} className={style.stickyTrigger}></div>
      </div>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default TitleHeading;
