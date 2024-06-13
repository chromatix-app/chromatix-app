// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import style from './Queue.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const Queue = () => {
  const optionShowFullTitles = useSelector(({ sessionModel }) => sessionModel.optionShowFullTitles);
  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);
  const playingRepeat = useSelector(({ sessionModel }) => sessionModel.playingRepeat);

  const upcomingTrackKeys = playingTrackKeys ? playingTrackKeys.filter((_, index) => index >= playingTrackIndex) : [];
  const upcomingEntries = upcomingTrackKeys.map((key) => playingTrackList[key]);

  const repeatEntries = playingRepeat && playingTrackKeys ? playingTrackKeys.map((key) => playingTrackList[key]) : [];

  const totalTracksRemaining = playingTrackKeys ? playingTrackKeys.length - playingTrackIndex : 0;

  return (
    <div className={style.wrap}>
      {!playingTrackKeys && <QueueEmpty />}
      {playingTrackKeys && (
        <QueueList
          entries={upcomingEntries}
          initialIndex={playingTrackIndex}
          isRepeat={false}
          optionShowFullTitles={optionShowFullTitles}
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

const QueueList = ({ entries, initialIndex = 0, isRepeat, optionShowFullTitles, totalTracksRemaining }) => {
  return entries.map((entry, index) => {
    const isCurrentlyPlaying = index === 0;

    return (
      <QueueEntry
        key={entry.trackId}
        index={index + initialIndex}
        entry={entry}
        isRepeat={isRepeat}
        isCurrentlyPlaying={isCurrentlyPlaying}
        optionShowFullTitles={optionShowFullTitles}
        totalTracksRemaining={totalTracksRemaining}
      />
    );
  });
};

const QueueEntry = ({ entry, index, isRepeat, isCurrentlyPlaying, optionShowFullTitles, totalTracksRemaining }) => {
  const dispatch = useDispatch();

  const doPlay = () => {
    if (!isCurrentlyPlaying) {
      dispatch.playerModel.playerLoadIndex({ index: index, play: true });
    }
  };

  return (
    <>
      {!isRepeat && isCurrentlyPlaying && <div className={style.section}>Now playing</div>}

      <div
        className={clsx(style.entry, {
          [style.entryCurrent]: !isRepeat && isCurrentlyPlaying,
          'text-trim': !optionShowFullTitles,
        })}
        onDoubleClick={() => {
          doPlay(true);
        }}
      >
        <div className={style.thumb}>
          <img src={entry.thumb} alt={entry.title} loading="lazy" />
        </div>

        <div className={clsx(style.content, { 'text-trim': !optionShowFullTitles })}>
          <div className={clsx(style.title, { 'text-trim': !optionShowFullTitles })}>{entry.title}</div>
          <div className={clsx(style.artist, { 'text-trim': !optionShowFullTitles })}>
            <NavLink to={entry.artistLink}>{entry.artist}</NavLink>
          </div>
        </div>
      </div>

      {!isRepeat && isCurrentlyPlaying && totalTracksRemaining > 1 && <div className={style.section}>Coming up</div>}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Queue;
