// ======================================================================
// IMPORTS
// ======================================================================

import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';

import { Icon } from 'js/components';
import { useGetQueuedTracks } from 'js/hooks';
import { analyticsEvent } from 'js/utils';

import style from './Queue.module.scss';

// ======================================================================
// OPTIONS
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

const virtualThreshold = !isLocal ? 150 : 150;

// ======================================================================
// COMPONENT
// ======================================================================

const Queue = () => {
  const outerRef = useRef(null);
  const scrollPositionRef = useRef(0);

  const queueExpandArtwork = useSelector(({ sessionModel }) => sessionModel.queueExpandArtwork);

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

  // In a non-virtual list, we need to track the scroll position
  // to restore it if the list is re-rendered as a virtual list
  useEffect(() => {
    if (outerRef.current) {
      const currentOuterRef = outerRef.current;
      const handleScroll = () => {
        scrollPositionRef.current = currentOuterRef.scrollTop;
      };
      currentOuterRef.addEventListener('scroll', handleScroll);
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
        {playingTrackKeys && (
          <QueueComponent
            entries={allEntries}
            playingShuffle={playingShuffle}
            upcomingTracks={upcomingTracks.length}
            queueExpandArtwork={queueExpandArtwork}
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
const nowPlayingLargeHeight = 369;
const nowPlayingSmallHeight = 92;
const labelHeight = 42;
const trackHeight = 50;

const QueueVirtual = ({ entries, playingShuffle, upcomingTracks, queueExpandArtwork, initialOffset, outerRef }) => {
  // Hacky workaround to force a re-render if queueExpandArtwork changes
  const extraRows = queueExpandArtwork ? 1 : 0;

  // Helper to determine row heights
  const getItemSize = useCallback(
    (index) => {
      const entry = entries[index];
      if (!entry) {
        return 0;
      } else if (entry.rowType === 'playing') {
        return queueExpandArtwork ? nowPlayingLargeHeight : nowPlayingSmallHeight;
      } else if (entry.rowType.endsWith('Label')) {
        return labelHeight;
      } else {
        return trackHeight;
      }
    },
    [entries, queueExpandArtwork]
  );

  // Setup the virtualizer
  const rowVirtualizer = useVirtualizer({
    count: entries.length + extraRows,
    getScrollElement: () => outerRef.current,
    initialOffset: initialOffset,
    estimateSize: getItemSize,
    overscan: 3,
  });

  return (
    <div
      className={style.scrollableInner}
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
        const entry = entries[virtualRow.index];

        // Catch missing entries
        if (!entry) {
          return null;
        }

        // Now playing
        else if (entry.rowType === 'playing') {
          if (queueExpandArtwork) {
            return <NowPlayingLarge key={index} entry={entry} virtualRow={virtualRow} />;
          } else {
            return <NowPlayingSmall key={index} entry={entry} virtualRow={virtualRow} />;
          }
        }

        // Label - Upcoming
        else if (entry.rowType === 'upcomingLabel') {
          return <LabelEntry key={index} text="Coming up" playingShuffle={playingShuffle} virtualRow={virtualRow} />;
        }

        // Label - Repeat
        else if (entry.rowType === 'repeatLabel') {
          return (
            <LabelEntry
              key={index}
              text="Repeating"
              playingShuffle={playingShuffle && !upcomingTracks}
              virtualRow={virtualRow}
            />
          );
        }

        // Label - Empty
        else if (entry.rowType === 'emptyLabel') {
          return <LabelEntry key={index} text="No tracks in queue" virtualRow={virtualRow} />;
        }

        // Tracks
        else {
          return <TrackEntry key={index} entry={entry} virtualRow={virtualRow} />;
        }
      })}
    </div>
  );
};

// ======================================================================
// NOW PLAYING - LARGE
// ======================================================================

const NowPlayingLarge = ({ entry, virtualRow }) => {
  const dispatch = useDispatch();

  const playingLink = useSelector(({ sessionModel }) => sessionModel.playingLink);

  const collapseArtwork = () => {
    dispatch.sessionModel.setSessionState({ queueExpandArtwork: false });
  };

  return (
    <div
      className={style.expandedEntry}
      style={{
        ...(virtualRow && {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`,
        }),
      }}
    >
      <div className={style.expandedThumb}>
        {(entry.thumbMedium || entry.thumb) && (
          <img
            src={entry.thumbMedium ? entry.thumbMedium : entry.thumb}
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
        <button className={style.expandedCollapse} onClick={collapseArtwork}>
          <span>
            <span>
              <Icon icon="CollapseIcon" cover stroke strokeWidth={1.5} />
            </span>
          </span>
        </button>
      </div>

      <div className={clsx(style.expandedTitle, 'text-trim')}>{entry.title}</div>

      <div className={clsx(style.expandedArtist, 'text-trim')}>
        {entry.artistLink && (
          <NavLink draggable="false" to={entry.artistLink} tabIndex={-1}>
            {entry.artist}
          </NavLink>
        )}
        {!entry.artistLink && entry.artist}
      </div>
    </div>
  );
};

// ======================================================================
// NOW PLAYING - SMALL
// ======================================================================

const NowPlayingSmall = ({ entry, virtualRow }) => {
  const dispatch = useDispatch();

  const expandArtwork = () => {
    dispatch.sessionModel.setSessionState({ queueExpandArtwork: true });
  };

  return (
    <div
      style={{
        ...(virtualRow && {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`,
        }),
      }}
    >
      <button className={style.label} onClick={expandArtwork}>
        Now playing
        <span className={style.expandIcon}>
          <Icon icon="ExpandIcon" cover stroke strokeWidth={1.4} />
        </span>
      </button>
      <TrackEntry entry={entry} isCurrentlyPlaying={true} />
    </div>
  );
};

// ======================================================================
// TRACK ENTRY
// ======================================================================

const TrackEntry = ({ entry, isCurrentlyPlaying = false, virtualRow }) => {
  const dispatch = useDispatch();

  const doPlay = () => {
    dispatch.playerModel.playerLoadIndex({ index: entry.playIndex, play: true });
  };

  return (
    <div
      className={clsx(style.trackEntry, 'text-trim', {
        [style.trackEntryCurrent]: isCurrentlyPlaying,
      })}
      style={{
        ...(virtualRow && {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`,
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
        {entry.thumb && <img src={entry.thumb} alt={entry.title} loading="lazy" draggable="false" />}
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
  );
};

// ======================================================================
// LABEL ENTRY
// ======================================================================

const LabelEntry = ({ text, playingShuffle, virtualRow }) => {
  return (
    <div
      className={style.label}
      style={{
        ...(virtualRow && {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`,
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
//         ...(virtualRow && {
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: '100%',
//           transform: `translateY(${virtualRow.start}px)`,
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
