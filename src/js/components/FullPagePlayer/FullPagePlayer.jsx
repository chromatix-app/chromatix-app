// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import platformFeatures from 'js/_config/platformFeatures';
import { ControlProgress, PrimaryControls, SecondaryControls } from 'js/components/ControlBar/ControlBar';
import { Favourite, StarRating } from 'js/components';
import { useKeyControl } from 'js/hooks';
import { analyticsEvent } from 'js/utils';

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
  const dispatch = useDispatch();

  const currentService = useSelector(({ appModel }) => appModel.currentService);

  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);
  const playingLink = useSelector(({ sessionModel }) => sessionModel.playingLink);

  const trackCurrent = playingTrackList?.[playingTrackKeys[playingTrackIndex]];

  const platformOpts = platformFeatures[currentService] || {};

  const thumbSrc = trackCurrent?.thumbMedium || trackCurrent?.thumb;

  // console.log(trackCurrent);

  return (
    <div className={style.nowPlaying}>
      <div className={clsx(style.cover, { [style.coverPlaceholder]: !trackCurrent || !thumbSrc })}>
        {trackCurrent && (
          <>
            {thumbSrc && (
              <div className={style.coverArtwork}>
                <img src={thumbSrc} alt={trackCurrent.title} draggable="false" />
              </div>
            )}

            {playingLink && (
              <NavLink
                to={playingLink}
                className={style.coverLink}
                onClick={() => {
                  dispatch.appModel.setAppState({ scrollToPlaying: true });
                  analyticsEvent('Navigate to Playing');
                }}
                tabIndex={-1}
              ></NavLink>
            )}
          </>
        )}
      </div>
      <div className={style.details}>
        {trackCurrent && (
          <>
            {trackCurrent.title && <div className={clsx(style.title, 'text-trim')}>{trackCurrent.title}</div>}

            {trackCurrent.artist && trackCurrent.artistLink && (
              <div className={clsx(style.artist, 'text-trim')}>
                <NavLink to={trackCurrent.artistLink}>{trackCurrent.artist}</NavLink>
              </div>
            )}

            {trackCurrent.artist && !trackCurrent.artistLink && (
              <div className={clsx(style.artist, 'text-trim')}>{trackCurrent.artist}</div>
            )}

            {trackCurrent.album && trackCurrent.albumLink && (
              <div className={clsx(style.album, 'text-trim')}>
                <NavLink to={trackCurrent.albumLink}>{trackCurrent.album}</NavLink>
              </div>
            )}

            {trackCurrent.album && !trackCurrent.albumLink && (
              <div className={clsx(style.album, 'text-trim')}>{trackCurrent.album}</div>
            )}

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

            {(trackCurrent.codec || trackCurrent.bitrate) && (
              <div className={clsx(style.specs, 'text-trim')}>
                {trackCurrent.codec && trackCurrent.codec}
                {trackCurrent.codec && trackCurrent.bitrate && ' • '}
                {trackCurrent.bitrate && `${trackCurrent.bitrate}kbps`}
              </div>
            )}
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
