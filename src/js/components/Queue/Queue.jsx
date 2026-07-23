// ======================================================================
// IMPORTS
// ======================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';

import platformFeatures from 'js/_config/platformFeatures';
import { Favourite, Icon, PopoverMenu, StarRating, ContextMenuTracks } from 'js/components';
import { useGetQueuedTracks, useWindowSize } from 'js/hooks';
import { analyticsEvent } from 'js/utils';

import style from './Queue.module.scss';

// ======================================================================
// OPTIONS
// ======================================================================

const isLocal = import.meta.env.VITE_ENV === 'local';

const virtualThreshold = !isLocal ? 150 : 50;

// ======================================================================
// COMPONENT
// ======================================================================

const Queue = () => {
  const outerRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const [isRefReady, setIsRefReady] = useState(false);

  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const queueExpandArtwork = useSelector(({ sessionModel }) => sessionModel.queueExpandArtwork);
  const queueArtist = useSelector(({ sessionModel }) => sessionModel.queueArtist);
  const queueAlbum = useSelector(({ sessionModel }) => sessionModel.queueAlbum);
  const queueCodec = useSelector(({ sessionModel }) => sessionModel.queueCodec);
  const queueBitrate = useSelector(({ sessionModel }) => sessionModel.queueBitrate);
  const queueIsFavourite = useSelector(({ sessionModel }) => sessionModel.queueIsFavourite);
  const queueUserRating = useSelector(({ sessionModel }) => sessionModel.queueUserRating);

  const {
    playingTrackIndex,
    playingTrackKeys,
    playingRepeatAny,
    playingShuffle,

    queueCurrent,
    queueUpcoming,
    queueRepeat,
  } = useGetQueuedTracks();

  // Build an array of queue entries to display

  const currentTrack = { rowType: 'playing', playIndex: playingTrackIndex, ...queueCurrent };
  const upcomingTracks = queueUpcoming.map((entry, index) => {
    return { rowType: 'upcoming', playIndex: index + playingTrackIndex + 1, ...entry };
  });
  const repeatTracks = queueRepeat.map((entry, index) => {
    return { rowType: 'repeat', playIndex: index, ...entry };
  });

  const showUpcomingLabel = queueUpcoming.length > 0;
  const showRepeatLabel = playingRepeatAny;
  const showEmptyLabel = queueUpcoming.length < 1 && !playingRepeatAny;

  const upcomingLabel = showUpcomingLabel ? [{ rowType: 'upcomingLabel' }] : [];
  const repeatLabel = showRepeatLabel ? [{ rowType: 'repeatLabel' }] : [];
  const emptyLabel = showEmptyLabel ? [{ rowType: 'emptyLabel' }] : [];

  const allEntries = [
    currentTrack,
    ...upcomingLabel,
    ...upcomingTracks,
    ...repeatLabel,
    ...repeatTracks,
    ...emptyLabel,
  ];

  // Determine if we should use a virtual list or a static list
  const isVirtual = allEntries.length > virtualThreshold;
  const QueueComponent = isVirtual ? QueueVirtual : QueueStatic;

  // Hacky workaround to force a re-render, because sometimes outerRef.current
  // doesn't seem to exist when <QueueComponent> is mounted
  useEffect(() => {
    if (outerRef.current && !isRefReady) {
      setIsRefReady(true);
    }
  }, [isRefReady]);

  // In a non-virtual list, we need to track the scroll position
  // to restore it if the list is re-rendered as a virtual list
  useEffect(() => {
    if (outerRef.current) {
      const currentOuterRef = outerRef.current;
      const handleScroll = () => {
        scrollPositionRef.current = currentOuterRef.scrollTop;
      };
      currentOuterRef.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        currentOuterRef.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isVirtual, allEntries.length]);

  return (
    <div className={style.wrap}>
      <div
        ref={outerRef}
        className={clsx(style.scrollableOuter, 'u-scrollbars', { [style.scrollableOuterVirtual]: isVirtual })}
      >
        {!playingTrackKeys && <QueueEmpty />}
        {playingTrackKeys && outerRef.current && (
          <QueueComponent
            entries={allEntries}
            playingShuffle={playingShuffle}
            upcomingTracks={upcomingTracks.length}
            currentService={currentService}
            queueExpandArtwork={queueExpandArtwork}
            queueArtist={queueArtist}
            queueAlbum={queueAlbum}
            queueCodec={queueCodec}
            queueBitrate={queueBitrate}
            queueIsFavourite={queueIsFavourite}
            queueUserRating={queueUserRating}
            outerRef={outerRef}
            {...(isVirtual && {
              initialOffset: scrollPositionRef.current,
            })}
          />
        )}
      </div>
    </div>
  );
};

// ======================================================================
// QUEUE - EMPTY
// ======================================================================

const QueueEmpty = () => {
  return (
    <div className={style.scrollableInner}>
      <div className={style.label}>No tracks in queue</div>
    </div>
  );
};

// ======================================================================
// QUEUE - STATIC
// ======================================================================

const QueueStatic = ({ entries, playingShuffle, upcomingTracks, queueExpandArtwork }) => {
  return (
    <div className={style.scrollableInner}>
      {entries.map((entry, index) => {
        // Catch missing entries
        if (!entry) {
          return null;
        }

        // Now playing
        else if (entry.rowType === 'playing') {
          if (queueExpandArtwork) {
            return <NowPlayingLarge key={index} entry={entry} />;
          } else {
            return <NowPlayingSmall key={index} entry={entry} />;
          }
        }

        // Label - Upcoming
        else if (entry.rowType === 'upcomingLabel') {
          return <LabelEntry key={index} text="Coming up" playingShuffle={playingShuffle} />;
        }

        // Label - Repeat
        else if (entry.rowType === 'repeatLabel') {
          return <LabelEntry key={index} text="Repeating" playingShuffle={playingShuffle && !upcomingTracks} />;
        }

        // Label - Empty
        else if (entry.rowType === 'emptyLabel') {
          return <LabelEntry key={index} text="No tracks in queue" />;
        }

        // Tracks
        else {
          return <TrackEntry key={index} entry={entry} />;
        }
      })}
    </div>
  );
};

// ======================================================================
// QUEUE - VIRTUAL
// ======================================================================

// Config
const nowPlayingSmallHeight = 92;
const nowPlayingLargeHeight1 = 312;
const nowPlayingLargeHeight2 = 352;
const nowPlayingArtistHeight = 23;
const nowPlayingAlbumHeight = 21;
const nowPlayingSpecsHeight = 19;
const nowPlayingFavouriteHeight = 25;
const nowPlayingRatingHeight = 26;
const labelHeight = 42;
const trackHeight = 50;

const QueueVirtual = ({
  entries,
  playingShuffle,
  upcomingTracks,
  currentService,
  queueExpandArtwork,
  queueArtist,
  queueAlbum,
  queueCodec,
  queueBitrate,
  queueIsFavourite,
  queueUserRating,
  initialOffset,
  outerRef,
}) => {
  const platformOpts = platformFeatures[currentService] || {};
  const { windowWidth } = useWindowSize();

  // Hacky workaround to force a re-render if certain props change
  const extraRows = [
    queueExpandArtwork ? 1 : 0,
    queueArtist ? 1 : 0,
    queueAlbum ? 1 : 0,
    queueCodec || queueBitrate ? 1 : 0,
    queueIsFavourite ? 1 : 0,
    queueUserRating ? 1 : 0,
    windowWidth >= 1024 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Helper to determine row heights
  const estimateSize = useCallback(
    (index) => {
      const entry = entries[index];
      if (!entry) {
        return 0;
      } else if (entry.rowType === 'playing') {
        if (queueExpandArtwork) {
          return (
            (windowWidth < 1024 ? nowPlayingLargeHeight1 : 0) +
            (windowWidth >= 1024 ? nowPlayingLargeHeight2 : 0) +
            (queueArtist ? nowPlayingArtistHeight : 0) +
            (queueAlbum ? nowPlayingAlbumHeight : 0) +
            (queueCodec || queueBitrate ? nowPlayingSpecsHeight : 0) +
            (queueIsFavourite && platformOpts.enableIsFavourite ? nowPlayingFavouriteHeight : 0) +
            (queueUserRating && platformOpts.enableUserRating ? nowPlayingRatingHeight : 0)
          );
        } else {
          return nowPlayingSmallHeight;
        }
      } else if (entry.rowType.endsWith('Label')) {
        return labelHeight;
      } else {
        return trackHeight;
      }
    },
    [
      entries,
      queueExpandArtwork,
      queueArtist,
      queueAlbum,
      queueCodec,
      queueBitrate,
      queueIsFavourite,
      queueUserRating,
      platformOpts.enableIsFavourite,
      platformOpts.enableUserRating,
      windowWidth,
    ]
  );

  // Setup the virtualizer
  const rowVirtualizer = useVirtualizer({
    count: entries.length + extraRows,
    getScrollElement: () => outerRef.current,
    overscan: 3,
    estimateSize,
    initialOffset,
  });

  return (
    <div
      className={style.scrollableInner}
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualEntry, index) => {
        const entry = entries[virtualEntry.index];

        // Catch missing entries
        if (!entry) {
          return null;
        }

        // Now playing
        else if (entry.rowType === 'playing') {
          if (queueExpandArtwork) {
            return <NowPlayingLarge key={virtualEntry.index} entry={entry} virtualEntry={virtualEntry} />;
          } else {
            return <NowPlayingSmall key={virtualEntry.index} entry={entry} virtualEntry={virtualEntry} />;
          }
        }

        // Label - Upcoming
        else if (entry.rowType === 'upcomingLabel') {
          return (
            <LabelEntry
              key={virtualEntry.index}
              text="Coming up"
              playingShuffle={playingShuffle}
              virtualEntry={virtualEntry}
            />
          );
        }

        // Label - Repeat
        else if (entry.rowType === 'repeatLabel') {
          return (
            <LabelEntry
              key={virtualEntry.index}
              text="Repeating"
              playingShuffle={playingShuffle && !upcomingTracks}
              virtualEntry={virtualEntry}
            />
          );
        }

        // Label - Empty
        else if (entry.rowType === 'emptyLabel') {
          return <LabelEntry key={virtualEntry.index} text="No tracks in queue" virtualEntry={virtualEntry} />;
        }

        // Tracks
        else {
          return <TrackEntry key={virtualEntry.index} entry={entry} virtualEntry={virtualEntry} />;
        }
      })}
    </div>
  );
};

// ======================================================================
// NOW PLAYING - LARGE
// ======================================================================

const NowPlayingLarge = ({ entry, virtualEntry }) => {
  const dispatch = useDispatch();

  const queueArtist = useSelector(({ sessionModel }) => sessionModel.queueArtist);
  const queueAlbum = useSelector(({ sessionModel }) => sessionModel.queueAlbum);
  const queueIsFavourite = useSelector(({ sessionModel }) => sessionModel.queueIsFavourite);
  const queueUserRating = useSelector(({ sessionModel }) => sessionModel.queueUserRating);
  const queueCodec = useSelector(({ sessionModel }) => sessionModel.queueCodec);
  const queueBitrate = useSelector(({ sessionModel }) => sessionModel.queueBitrate);

  const playingLink = useSelector(({ sessionModel }) => sessionModel.playingLink);

  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  const collapseArtwork = () => {
    dispatch.sessionModel.setSessionState({ queueExpandArtwork: false });
  };

  return (
    <ContextMenuTracks track={entry}>
      <div
        className={style.expandedEntry}
        style={{
          ...(virtualEntry && {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualEntry.start}px)`,
          }),
        }}
      >
        <div className={style.expandedThumb}>
          {(entry.thumbMd || entry.thumbSm) && (
            <img
              src={entry.thumbMd ? entry.thumbMd : entry.thumbSm}
              alt={entry.title}
              draggable="false"
              loading="lazy"
            />
          )}
          {playingLink && (
            <NavLink
              to={playingLink}
              className={style.expandedLink}
              onClick={() => {
                dispatch.appModel.setAppState({ scrollToPlaying: true });
                analyticsEvent('Navigate to Playing');
              }}
              tabIndex={-1}
            ></NavLink>
          )}
          <button type="button" className={style.expandedCollapse} onClick={collapseArtwork}>
            <span>
              <span>
                <Icon icon="CollapseIcon" cover stroke strokeWidth={1.5} />
              </span>
            </span>
          </button>
        </div>

        <div className={style.expandedDetails}>
          <div className={style.expandedDetailsMain}>
            {entry.title && <div className={clsx(style.expandedTitle, 'text-trim')}>{entry.title}</div>}

            {queueArtist && entry.artist && entry.artistLink && (
              <div className={clsx(style.expandedArtist, 'text-trim')}>
                <NavLink draggable="false" to={entry.artistLink} tabIndex={-1}>
                  {entry.artist}
                </NavLink>
              </div>
            )}

            {queueArtist && entry.artist && !entry.artistLink && (
              <div className={clsx(style.expandedArtist, 'text-trim')}>{entry.artist}</div>
            )}

            {queueAlbum && entry.album && entry.albumLink && (
              <div className={clsx(style.expandedAlbum, 'text-trim')}>
                <NavLink to={entry.albumLink} tabIndex={-1}>
                  {entry.album}
                </NavLink>
              </div>
            )}

            {queueAlbum && entry.album && !entry.albumLink && (
              <div className={clsx(style.expandedAlbum, 'text-trim')}>{entry.album}</div>
            )}

            {((queueCodec && entry.codec) || (queueBitrate && entry.bitrate)) && (
              <div className={clsx(style.expandedSpecs, 'text-trim')}>
                {queueCodec && entry.codec && entry.codec}
                {queueCodec && queueBitrate && entry.codec && entry.bitrate && ' • '}
                {queueBitrate && entry.bitrate && `${entry.bitrate}kbps`}
              </div>
            )}

            {queueIsFavourite && platformOpts.enableIsFavourite && (
              <div className={style.expandedFavourite}>
                <Favourite
                  variant="queue"
                  type="track"
                  itemId={entry.trackId}
                  isFavourite={entry.isFavourite}
                  size={16}
                  editable
                />
              </div>
            )}

            {queueUserRating && platformOpts.enableUserRating && (
              <div className={style.expandedRating}>
                <StarRating
                  variant="queue"
                  type="track"
                  ratingKey={entry.trackId}
                  rating={entry.userRating}
                  size={15}
                  editable
                />
              </div>
            )}
          </div>
          <div className={style.expandedDetailsButton}>
            <NowPlayingMenu />
          </div>
        </div>
      </div>
    </ContextMenuTracks>
  );
};

const NowPlayingMenu = () => {
  const dispatch = useDispatch();

  const queueArtist = useSelector(({ sessionModel }) => sessionModel.queueArtist);
  const queueAlbum = useSelector(({ sessionModel }) => sessionModel.queueAlbum);
  const queueIsFavourite = useSelector(({ sessionModel }) => sessionModel.queueIsFavourite);
  const queueUserRating = useSelector(({ sessionModel }) => sessionModel.queueUserRating);
  const queueCodec = useSelector(({ sessionModel }) => sessionModel.queueCodec);
  const queueBitrate = useSelector(({ sessionModel }) => sessionModel.queueBitrate);

  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  const optionsSetter = (key, value) => {
    dispatch.sessionModel.setSessionState({
      [key]: value,
    });
  };

  return (
    <PopoverMenu
      setter={optionsSetter}
      appearance="tertiary"
      side="bottom"
      align="end"
      top={-22}
      entries={[
        {
          label: 'Title',
          disabled: true,
          checked: true,
        },
        {
          label: 'Artist',
          attr: 'queueArtist',
          checked: queueArtist,
        },
        {
          label: 'Album',
          attr: 'queueAlbum',
          checked: queueAlbum,
        },
        {
          label: 'Audio codec',
          attr: 'queueCodec',
          checked: queueCodec,
        },
        {
          label: 'Bitrate',
          attr: 'queueBitrate',
          checked: queueBitrate,
        },
        ...(platformOpts?.enableIsFavourite
          ? [
              {
                label: 'Favourites',
                attr: 'queueIsFavourite',
                checked: queueIsFavourite,
              },
            ]
          : []),
        ...(platformOpts?.enableUserRating
          ? [
              {
                label: 'Rating',
                attr: 'queueUserRating',
                checked: queueUserRating,
              },
            ]
          : []),
      ]}
    >
      <span className={style.expandedSettings}>
        <Icon icon="CogIcon" cover stroke />
      </span>
    </PopoverMenu>
  );
};

// ======================================================================
// NOW PLAYING - SMALL
// ======================================================================

const NowPlayingSmall = ({ entry, virtualEntry }) => {
  const dispatch = useDispatch();

  const expandArtwork = () => {
    dispatch.sessionModel.setSessionState({ queueExpandArtwork: true });
  };

  return (
    <div
      style={{
        ...(virtualEntry && {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualEntry.start}px)`,
        }),
      }}
    >
      <button type="button" className={style.label} onClick={expandArtwork}>
        Now playing
        <span className={style.expandIcon}>
          <Icon icon="ExpandSplitIcon" cover stroke strokeWidth={1.4} />
        </span>
      </button>
      <TrackEntry entry={entry} isCurrentlyPlaying={true} />
    </div>
  );
};

// ======================================================================
// TRACK ENTRY
// ======================================================================

const TrackEntry = ({ entry, isCurrentlyPlaying = false, virtualEntry }) => {
  const dispatch = useDispatch();

  const doPlay = () => {
    dispatch.playerModel.playerLoadIndex({ index: entry.playIndex, play: true });
  };

  return (
    <ContextMenuTracks track={entry}>
      <div
        className={clsx(style.trackEntry, 'text-trim', {
          [style.trackEntryCurrent]: isCurrentlyPlaying,
        })}
        style={{
          ...(virtualEntry && {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualEntry.start}px)`,
          }),
        }}
        onDoubleClick={() => {
          doPlay(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            doPlay(true);
          }
        }}
        tabIndex={0}
      >
        <div className={style.trackThumb}>
          {entry.thumbSm && <img src={entry.thumbSm} alt={entry.title} loading="lazy" draggable="false" />}
        </div>

        <div className={clsx(style.trackContent, 'text-trim')}>
          <div className={clsx(style.trackTitle, 'text-trim')}>{entry.title}</div>
          <div className={clsx(style.trackArtist, 'text-trim')}>
            {entry.artistLink && (
              <NavLink to={entry.artistLink} tabIndex={-1} draggable="false">
                {entry.artist}
              </NavLink>
            )}
            {!entry.artistLink && entry.artist}
          </div>
        </div>
      </div>
    </ContextMenuTracks>
  );
};

// ======================================================================
// LABEL ENTRY
// ======================================================================

const LabelEntry = ({ text, playingShuffle, virtualEntry }) => {
  return (
    <div
      className={style.label}
      style={{
        ...(virtualEntry && {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualEntry.start}px)`,
        }),
      }}
    >
      {text}
      {playingShuffle && (
        <span className={style.shuffleLabel}>
          &nbsp;&nbsp;•&nbsp; Shuffle is on{' '}
          <span className={style.shuffleIcon}>
            <Icon icon="ShuffleIcon" cover stroke />
          </span>
        </span>
      )}
    </div>
  );
};

// ======================================================================
// LABEL - REPEAT
// ======================================================================

// const LabelRepeat = (props) => {
//   return (
//     <div
//       className={style.repeat}
//       style={{
//         ...(virtualEntry && {
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: '100%',
//           transform: `translateY(${virtualEntry.start}px)`,
//         }),
//       }}
//     >
//       <span>Repeating</span>
//     </div>
//   );
// };

// ======================================================================
// EXPORT
// ======================================================================

export default Queue;
