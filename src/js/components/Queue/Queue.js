// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { Icon } from 'js/components';
import { useGetQueuedTracks } from 'js/hooks';

import style from './Queue.module.scss';

// ======================================================================
// OPTIONS
// ======================================================================

// const isLocal = process.env.REACT_APP_ENV === 'local';

// const virtualThreshold = !isLocal ? 150 : 150;

// ======================================================================
// COMPONENT
// ======================================================================

const Queue = () => {
  const queueExpandArtwork = useSelector(({ sessionModel }) => sessionModel.queueExpandArtwork);

  const {
    // playingTrackList,
    playingTrackIndex,
    playingTrackKeys,
    playingRepeat,
    playingShuffle,

    // upcomingTrackKeys,
    upcomingEntries,

    repeatEntries,
    // totalTracksRemaining,
  } = useGetQueuedTracks();

  const currentTrack = { rowType: 'playing', playIndex: playingTrackIndex, ...upcomingEntries[0] };
  const upcomingTracks = upcomingEntries
    .filter((entry, index) => index > 0)
    .map((entry, index) => {
      return { rowType: 'upcoming', playIndex: index + playingTrackIndex + 1, ...entry };
    });
  const repeatTracks = repeatEntries.map((entry, index) => {
    return { rowType: 'repeat', playIndex: index, ...entry };
  });
  const upcomingLabel = upcomingTracks.length > 0 || repeatTracks.length > 0 ? [{ rowType: 'upcomingLabel' }] : [];
  const repeatLabel = playingRepeat ? [{ rowType: 'repeatLabel' }] : [];

  const allEntries = [currentTrack, ...upcomingLabel, ...upcomingTracks, ...repeatTracks, ...repeatLabel];

  return (
    <div className={style.wrap}>
      <div className={style.inner}>
        {!playingTrackKeys && <QueueEmpty />}
        {playingTrackKeys && (
          <QueueStatic entries={allEntries} playingShuffle={playingShuffle} queueExpandArtwork={queueExpandArtwork} />
        )}
      </div>
    </div>
  );
};

// ======================================================================
// QUEUE - EMPTY
// ======================================================================

const QueueEmpty = () => {
  return <div className={style.section}>No tracks in queue</div>;
};

// ======================================================================
// QUEUE - STATIC
// ======================================================================

const QueueStatic = ({ entries, playingShuffle, queueExpandArtwork }) => {
  return (
    <>
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
          return <LabelUpcoming key={index} playingShuffle={playingShuffle} />;
        }

        // Label - Repeat
        else if (entry.rowType === 'repeatLabel') {
          return <LabelRepeat key={index} />;
        }

        // Tracks
        else {
          return <TrackEntry key={index} entry={entry} />;
        }
      })}
    </>
  );
};

// ======================================================================
// NOW PLAYING - LARGE
// ======================================================================

const NowPlayingLarge = ({ entry }) => {
  const dispatch = useDispatch();

  const collapseArtwork = () => {
    dispatch.sessionModel.setSessionState({ queueExpandArtwork: false });
  };

  return (
    <div className={style.expandedEntry}>
      <div className={style.expandedThumb}>
        {(entry.thumbMedium || entry.thumb) && (
          <img
            src={entry.thumbMedium ? entry.thumbMedium : entry.thumb}
            alt={entry.title}
            draggable="false"
            loading="lazy"
          />
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

const NowPlayingSmall = ({ entry }) => {
  const dispatch = useDispatch();

  const expandArtwork = () => {
    dispatch.sessionModel.setSessionState({ queueExpandArtwork: true });
  };

  return (
    <>
      <button className={style.section} onClick={expandArtwork}>
        Now playing
        <span className={style.expandIcon}>
          <Icon icon="ExpandIcon" cover stroke strokeWidth={1.4} />
        </span>
      </button>
      <TrackEntry entry={entry} isCurrentlyPlaying={true} />
    </>
  );
};

// ======================================================================
// TRACK ENTRY
// ======================================================================

const TrackEntry = ({ entry, isCurrentlyPlaying = false }) => {
  const dispatch = useDispatch();

  const doPlay = () => {
    dispatch.playerModel.playerLoadIndex({ index: entry.playIndex, play: true });
  };

  return (
    <>
      <div
        className={clsx(style.entry, 'text-trim', {
          [style.entryCurrent]: isCurrentlyPlaying,
        })}
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
        <div className={style.thumb}>
          {entry.thumb && <img src={entry.thumb} alt={entry.title} loading="lazy" draggable="false" />}
        </div>

        <div className={clsx(style.content, 'text-trim')}>
          <div className={clsx(style.title, 'text-trim')}>{entry.title}</div>
          <div className={clsx(style.artist, 'text-trim')}>
            {entry.artistLink && (
              <NavLink to={entry.artistLink} tabIndex={-1} draggable="false">
                {entry.artist}
              </NavLink>
            )}
            {!entry.artistLink && entry.artist}
          </div>
        </div>
      </div>
    </>
  );
};

// ======================================================================
// LABEL - UPCOMING
// ======================================================================

const LabelUpcoming = ({ playingShuffle }) => {
  return (
    <div className={style.section}>
      Coming up
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

const LabelRepeat = () => {
  return (
    <div className={style.repeat}>
      <span>Repeating</span>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Queue;
