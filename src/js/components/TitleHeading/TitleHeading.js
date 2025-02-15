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

const TitleHeading = ({ title, subtitle, detail, thumb, icon, showPlay, handlePlay, filters, padding = true }) => {
  const triggerRef = useRef(null);
  const isNearTop = useNearTop(triggerRef, 90);

  const titleSize = title.length <= 10 ? 'xl' : title.length <= 30 ? 'lg' : title.length <= 40 ? 'md' : 'sm';

  return (
    <>
      <div
        className={clsx(style.stickyWrap, { [style.stickyWrapVisible]: isNearTop, [style.stickyWrapPadding]: padding })}
      >
        <div className={style.stickyContent}>{title && <h1 className={clsx(style.stickyTitle)}>{title}</h1>}</div>
      </div>
      <div className={clsx(style.wrap, { [style.wrapPadding]: padding })}>
        {thumb && (
          <div className={style.thumb}>
            <img src={thumb} alt={title} draggable="false" />
          </div>
        )}
        {icon && (
          <div className={style.thumbBg}>
            <div className={style.thumbIcon}>
              <Icon icon={icon} cover stroke strokeWidth={1.6} />
            </div>
          </div>
        )}
        <div className={style.content}>
          {title && <h1 className={clsx(style.title, style[titleSize])}>{title}</h1>}
          {subtitle && <h2 className={style.subtitle}>{subtitle}</h2>}
          {detail && <div className={style.detail}>{detail}</div>}
          {showPlay && (
            <div className={style.buttons}>
              <button className={style.playButton} onClick={() => handlePlay && handlePlay(false)}>
                <span className={style.playIcon}>
                  <Icon icon="PlayFilledIcon" cover />
                </span>
                <span className={style.playText}>Play</span>
              </button>
              <button className={style.shuffleButton} onClick={() => handlePlay && handlePlay(true)}>
                <span className={style.shuffleIcon}>
                  <Icon icon="ShuffleIcon" cover stroke strokeWidth={1.4} />
                </span>
                <span className={style.shuffleText}>Shuffle</span>
              </button>
            </div>
          )}
          {filters && <div className={style.filters}>{filters}</div>}
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
