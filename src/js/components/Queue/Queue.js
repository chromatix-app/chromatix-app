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
// COMPONENT
// ======================================================================

const Queue = () => {
  const optionShowFullTitles = useSelector(({ sessionModel }) => sessionModel.optionShowFullTitles);
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
    totalTracksRemaining,
  } = useGetQueuedTracks();

  return (
    <div className={style.wrap}>
      {!playingTrackKeys && <QueueEmpty />}
      {playingTrackKeys && (
        <QueueList
          entries={upcomingEntries}
          initialIndex={playingTrackIndex}
          isRepeat={false}
          optionShowFullTitles={optionShowFullTitles}
          playingShuffle={playingShuffle}
          queueExpandArtwork={queueExpandArtwork}
          totalTracksRemaining={totalTracksRemaining}
        />
      )}
      {playingRepeat && (
        <>
          <QueueList
            entries={repeatEntries}
            initialIndex={0}
            isRepeat={true}
            optionShowFullTitles={optionShowFullTitles}
            totalTracksRemaining={totalTracksRemaining}
          />
          <div className={style.repeat}>
            <span>Repeating</span>
          </div>
        </>
      )}
    </div>
  );
};

const QueueEmpty = () => {
  return <div className={style.section}>No tracks in queue</div>;
};

const QueueList = ({
  entries,
  initialIndex = 0,
  isRepeat,
  optionShowFullTitles,
  playingShuffle,
  queueExpandArtwork,
  totalTracksRemaining,
}) => {
  return entries.map((entry, index) => {
    const isCurrentlyPlaying = index === 0;

    return (
      <QueueEntry
        key={entry.trackId}
        index={index + initialIndex}
        entry={entry}
        isRepeat={isRepeat}
        isCurrentlyPlaying={isCurrentlyPlaying}
        totalTracksRemaining={totalTracksRemaining}
        optionShowFullTitles={optionShowFullTitles}
        queueExpandArtwork={queueExpandArtwork}
        playingShuffle={playingShuffle}
      />
    );
  });
};

const QueueEntry = ({
  entry,
  index,
  isRepeat,
  isCurrentlyPlaying,
  optionShowFullTitles,
  playingShuffle,
  queueExpandArtwork = false,
  totalTracksRemaining,
}) => {
  const dispatch = useDispatch();

  const doPlay = () => {
    if (!isCurrentlyPlaying) {
      dispatch.playerModel.playerLoadIndex({ index: index, play: true });
    }
  };

  const expandArtwork = () => {
    dispatch.sessionModel.setSessionState({ queueExpandArtwork: true });
  };

  return (
    <>
      {!isRepeat && isCurrentlyPlaying && (
        <>
          {queueExpandArtwork && <QueueEntryExpanded entry={entry} optionShowFullTitles={optionShowFullTitles} />}
          {!queueExpandArtwork && (
            <button className={style.section} onClick={expandArtwork}>
              Now playing
              <span className={style.expandIcon}>
                <Icon icon="ExpandIcon" cover stroke strokeWidth={1.4} />
              </span>
            </button>
          )}
        </>
      )}

      {(!isCurrentlyPlaying || !queueExpandArtwork) && (
        <div
          className={clsx(style.entry, {
            [style.entryCurrent]: !isRepeat && isCurrentlyPlaying,
            'text-trim': !optionShowFullTitles,
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

          <div className={clsx(style.content, { 'text-trim': !optionShowFullTitles })}>
            <div className={clsx(style.title, { 'text-trim': !optionShowFullTitles })}>{entry.title}</div>
            <div className={clsx(style.artist, { 'text-trim': !optionShowFullTitles })}>
              {entry.artistLink && (
                <NavLink to={entry.artistLink} tabIndex={-1} draggable="false">
                  {entry.artist}
                </NavLink>
              )}
              {!entry.artistLink && entry.artist}
            </div>
          </div>
        </div>
      )}

      {!isRepeat && isCurrentlyPlaying && totalTracksRemaining > 1 && (
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
      )}
    </>
  );
};

const QueueEntryExpanded = ({ entry, optionShowFullTitles }) => {
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

      <div className={clsx(style.expandedTitle, { 'text-trim': !optionShowFullTitles })}>{entry.title}</div>

      <div className={clsx(style.expandedArtist, { 'text-trim': !optionShowFullTitles })}>
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
// EXPORT
// ======================================================================

export default Queue;
