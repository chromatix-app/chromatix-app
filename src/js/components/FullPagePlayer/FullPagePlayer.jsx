// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';

import platformFeatures from 'js/_config/platformFeatures';
import { ControlProgress, PrimaryControls, SecondaryControls } from 'js/components/ControlBar/ControlBar';
import { Favourite, StarRating } from 'js/components';
import { useKeyControl } from 'js/hooks';

import style from './FullPagePlayer.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const FullPagePlayer = () => {
  const dispatch = useDispatch();

  // Disable full page mode on escape
  useKeyControl('Escape', () => {
    dispatch.appModel.fullPageOff();
  });

  return (
    <div className={style.wrap}>
      <div className={style.topSpacer}></div>
      <div>
        <NowPlaying />
      </div>
      <div>
        <div className={style.progress}>
          <ControlProgress fullPage />
        </div>
        <div className={style.controls}>
          <div className={style.leftCol}></div>
          <div className={style.centerCol}>
            <PrimaryControls fullPage />
          </div>
          <div className={style.rightCol}>
            <SecondaryControls fullPage />
          </div>
        </div>
      </div>
    </div>
  );
};

const NowPlaying = () => {
  const currentService = useSelector(({ appModel }) => appModel.currentService);

  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);

  const trackCurrent = playingTrackList?.[playingTrackKeys[playingTrackIndex]];

  const platformOpts = platformFeatures[currentService] || {};

  return (
    <div className={style.nowPlaying}>
      <div className={clsx(style.cover, { [style.coverPlaceholder]: !trackCurrent || !trackCurrent?.thumb })}>
        {trackCurrent && (
          <>
            {(trackCurrent.thumbMedium || trackCurrent.thumb) && (
              <div className={style.coverArtwork}>
                <img src={trackCurrent.thumbMedium || trackCurrent.thumb} alt={trackCurrent.title} draggable="false" />
              </div>
            )}
          </>
        )}
      </div>
      <div className={style.details}>
        {trackCurrent && (
          <>
            <div className={clsx(style.title, 'text-trim')}>{trackCurrent.title}</div>
            <div className={clsx(style.artist, 'text-trim')}>{trackCurrent.artist}</div>
            <div className={clsx(style.album, 'text-trim')}>{trackCurrent.album}</div>
            {platformOpts.enableIsFavourite && (
              <div className={style.favourite}>
                <Favourite
                  variant="fullpage"
                  type="track"
                  itemId={trackCurrent.trackId}
                  isFavourite={trackCurrent.isFavourite}
                  editable
                />
              </div>
            )}
            {platformOpts.enableUserRating && (
              <div className={style.rating}>
                <StarRating
                  variant="fullpage"
                  type="track"
                  ratingKey={trackCurrent.trackId}
                  rating={trackCurrent.userRating}
                  size={14}
                  editable
                />
              </div>
            )}
            <div className={clsx(style.specs, 'text-trim')}>
              {trackCurrent.codec} • {trackCurrent.bitrate}kbps
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default FullPagePlayer;
