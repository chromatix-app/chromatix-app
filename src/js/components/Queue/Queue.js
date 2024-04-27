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
  const playingVariant = useSelector(({ sessionModel }) => sessionModel.playingVariant);
  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);

  const totalTracksRemaining = playingTrackKeys.length - playingTrackIndex;

  return (
    <div className={style.wrap}>
      {playingTrackKeys.map((value, index) => {
        const entry = playingTrackList[value];

        if (index < playingTrackIndex) return null;

        const isCurrentlyPlaying = index === playingTrackIndex;

        return (
          <QueueEntry
            key={index}
            index={index}
            entry={entry}
            isCurrentlyPlaying={isCurrentlyPlaying}
            optionShowFullTitles={optionShowFullTitles}
            playingVariant={playingVariant}
            totalTracksRemaining={totalTracksRemaining}
          />
        );
      })}
    </div>
  );
};

const QueueEntry = ({
  entry,
  index,
  isCurrentlyPlaying,
  optionShowFullTitles,
  playingVariant,
  totalTracksRemaining,
}) => {
  const dispatch = useDispatch();

  const doPlay = () => {
    if (!isCurrentlyPlaying) {
      dispatch.playerModel.playerLoadIndex({ index: index, play: true });
    }
  };

  return (
    <>
      {isCurrentlyPlaying && <div className={style.section}>Now playing</div>}

      <div
        className={clsx(style.entry, 'text-trim', { [style.entryCurrent]: isCurrentlyPlaying })}
        onDoubleClick={() => {
          doPlay(true);
        }}
      >
        {playingVariant === 'playlists' && entry.thumb && (
          <div className={style.thumb}>
            <img src={entry.thumb} alt={entry.title} loading="lazy" />
          </div>
        )}

        <div className={clsx(style.content, { 'text-trim': !optionShowFullTitles })}>
          <div className={clsx(style.title, { 'text-trim': !optionShowFullTitles })}>{entry.title}</div>
          <div className={clsx(style.artist, { 'text-trim': !optionShowFullTitles })}>
            <NavLink to={entry.artistLink}>{entry.artist}</NavLink>
          </div>
        </div>
      </div>

      {/* {isCurrentlyPlaying && totalTracksRemaining > 1 && <div className={style.section}>Next in queue</div>} */}

      {isCurrentlyPlaying && totalTracksRemaining > 1 && <div className={style.section}>Coming up</div>}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Queue;
