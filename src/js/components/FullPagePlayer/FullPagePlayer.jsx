// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import platformFeatures from 'js/_config/platformFeatures';
import { ControlProgress, PrimaryControls, SecondaryControls } from 'js/components/ControlBar/ControlBar';
import { Favourite, Icon, StarRating } from 'js/components';
import LyricsPanel from 'js/components/LyricsPanel/LyricsPanel';
import { useKeyControl, useLyrics } from 'js/hooks';

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
    <div className={style.wrap} data-allow-key-controls>
      <div className={style.topSpacer}></div>
      <div>
        <NowPlaying />
      </div>
      <div>
        <div className={style.progress}>
          <ControlProgress fullPageMode />
        </div>
        <div className={style.controls}>
          <div className={style.leftCol}></div>
          <div className={style.centerCol}>
            <PrimaryControls fullPageMode />
          </div>
          <div className={style.rightCol}>
            <SecondaryControls fullPageMode />
          </div>
        </div>
      </div>
    </div>
  );
};

const NowPlaying = () => {
  const dispatch = useDispatch();

  const fullPageArtist = useSelector(({ sessionModel }) => sessionModel.fullPageArtist);
  const fullPageAlbum = useSelector(({ sessionModel }) => sessionModel.fullPageAlbum);
  const fullPageIsFavourite = useSelector(({ sessionModel }) => sessionModel.fullPageIsFavourite);
  const fullPageUserRating = useSelector(({ sessionModel }) => sessionModel.fullPageUserRating);
  const fullPageCodec = useSelector(({ sessionModel }) => sessionModel.fullPageCodec);
  const fullPageBitrate = useSelector(({ sessionModel }) => sessionModel.fullPageBitrate);
  // const fullPageTheme = useSelector(({ sessionModel }) => sessionModel.fullPageTheme);

  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);
  const playingLink = useSelector(({ sessionModel }) => sessionModel.playingLink);

  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  const trackCurrent = playingTrackList?.[playingTrackKeys[playingTrackIndex]];

  const thumbSrc = trackCurrent?.thumbMd || trackCurrent?.thumbSm;

  const { timed, lines } = useLyrics();
  const lyricsVisible = useSelector(({ sessionModel }) => sessionModel.lyricsVisible);
  const hasLyrics = platformOpts.enableLyrics && lines.length > 0;
  const showLyrics = hasLyrics && lyricsVisible;

  // console.log(trackCurrent);

  return (
    <div className={clsx(style.nowPlaying, { [style.nowPlayingLyrics]: showLyrics })}>
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
      <div className={clsx(style.details, { [style.detailsLyrics]: showLyrics })}>
        {trackCurrent && (
          <>
            {trackCurrent.title && <div className={clsx(style.title, 'text-trim')}>{trackCurrent.title}</div>}

            {fullPageArtist && trackCurrent.artist && trackCurrent.artistLink && (
              <div className={clsx(style.artist, 'text-trim')}>
                <NavLink to={trackCurrent.artistLink}>{trackCurrent.artist}</NavLink>
              </div>
            )}

            {fullPageArtist && trackCurrent.artist && !trackCurrent.artistLink && (
              <div className={clsx(style.artist, 'text-trim')}>{trackCurrent.artist}</div>
            )}

            {fullPageAlbum && trackCurrent.album && trackCurrent.albumLink && (
              <div className={clsx(style.album, 'text-trim')}>
                <NavLink to={trackCurrent.albumLink}>{trackCurrent.album}</NavLink>
              </div>
            )}

            {fullPageAlbum && trackCurrent.album && !trackCurrent.albumLink && (
              <div className={clsx(style.album, 'text-trim')}>{trackCurrent.album}</div>
            )}

            {fullPageIsFavourite && platformOpts.enableIsFavourite && (
              <div className={style.favourite}>
                <Favourite
                  type="track"
                  itemId={trackCurrent.trackId}
                  isFavourite={trackCurrent.isFavourite}
                  size={20}
                  editable
                />
              </div>
            )}

            {fullPageUserRating && platformOpts.enableUserRating && (
              <div className={style.rating}>
                <StarRating
                  variant="fullpage"
                  type="track"
                  ratingKey={trackCurrent.trackId}
                  rating={trackCurrent.userRating}
                  size={16}
                  editable
                />
              </div>
            )}

            {((fullPageCodec && trackCurrent.codec) || (fullPageBitrate && trackCurrent.bitrate)) && (
              <div className={clsx(style.specs, 'text-trim')}>
                {fullPageCodec && trackCurrent.codec && trackCurrent.codec}
                {fullPageCodec && fullPageBitrate && trackCurrent.codec && trackCurrent.bitrate && ' • '}
                {fullPageBitrate && trackCurrent.bitrate && `${trackCurrent.bitrate}kbps`}
              </div>
            )}

            {showLyrics && <LyricsPanel lines={lines} timed={timed} className={style.lyricsScroll} />}
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
