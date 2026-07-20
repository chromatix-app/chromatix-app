// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';
import { useSelector } from 'react-redux';

import platformFeatures from 'js/_config/platformFeatures';
import LyricsPanel from 'js/components/LyricsPanel/LyricsPanel';
import { useLyrics } from 'js/hooks';

import style from './LyricsSidebar.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const LyricsSidebar = () => {
  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);
  const trackCurrent = playingTrackList?.[playingTrackKeys?.[playingTrackIndex]];

  const { timed, lines, loading } = useLyrics();

  if (!platformOpts.enableLyrics) return null;

  return (
    <div className={style.wrap}>
      {trackCurrent && (
        <div className={style.header}>
          <div className={clsx(style.title, 'text-trim')}>{trackCurrent.title}</div>
          {trackCurrent.artist && (
            <div className={clsx(style.artist, 'text-trim')}>{trackCurrent.artist}</div>
          )}
        </div>
      )}

      {loading && (
        <div className={style.state}>Loading lyrics…</div>
      )}

      {!loading && lines.length === 0 && (
        <div className={style.state}>No lyrics available</div>
      )}

      {!loading && lines.length > 0 && (
        <LyricsPanel lines={lines} timed={timed} className={style.panel} />
      )}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default LyricsSidebar;
