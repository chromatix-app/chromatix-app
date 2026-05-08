// ======================================================================
// IMPORTS
// ======================================================================

import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import clsx from 'clsx';

import { Icon } from 'js/components';
import { useNearTop } from 'js/hooks';

import style from './TitleHeading.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const TitleHeading = ({
  title,
  subtitle,
  detail,
  thumb,
  thumbExpand,
  icon,
  showPlay,
  optionsMenu,
  handlePlay,
  isLoaded = false,
  isPlaying = false,
  filters,
  padding = true,
}) => {
  const dispatch = useDispatch();

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
          <button
            className={style.thumb}
            onClick={() => {
              dispatch.dialogModel.showModal({
                modal: 'ImagePreview',
                data: { src: thumbExpand || thumb, title },
              });
            }}
          >
            <img src={thumb} alt={title} draggable="false" />
          </button>
        )}
        {icon && (
          <div className={style.thumbBg}>
            <div className={style.thumbIcon}>
              <Icon icon={icon} cover stroke strokeWidth={1.6} />
            </div>
          </div>
        )}
        {!icon && thumb === null && <div className={style.thumb}></div>}
        <div className={style.content}>
          {title && <h1 className={clsx(style.title, style[titleSize])}>{title}</h1>}
          {subtitle && <h2 className={style.subtitle}>{subtitle}</h2>}
          {detail && <div className={style.detail}>{detail}</div>}
          {(showPlay || optionsMenu) && (
            <div className={style.buttons}>
              {showPlay && (
                <>
                  <button
                    className={style.playButton}
                    onClick={() =>
                      isPlaying
                        ? dispatch.playerModel.playerPause()
                        : isLoaded
                          ? dispatch.playerModel.playerResume()
                          : handlePlay && handlePlay(false)
                    }
                  >
                    {!isPlaying ? (
                      <span className={style.playIcon}>
                        <Icon icon="PlayFilledIcon" cover />
                      </span>
                    ) : (
                      <span className={style.pauseIcon}>
                        <Icon icon="PauseFilledIcon" cover />
                      </span>
                    )}
                    <span className={style.playText}>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  <button
                    className={style.shuffleButton}
                    onClick={() => handlePlay && handlePlay(true)}
                    aria-label="Shuffle"
                  >
                    <span className={style.shuffleIcon}>
                      <Icon icon="ShuffleIcon" cover stroke strokeWidth={1.4} />
                    </span>
                    {/* <span className={style.shuffleText}>Shuffle</span> */}
                  </button>
                </>
              )}
              {optionsMenu && optionsMenu}
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
