// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as bridge from 'js/services/bridge';

// ======================================================================
// TYPES
// ======================================================================

export interface TimedLine {
  time: number; // ms
  text: string;
}

export interface LyricsState {
  loading: boolean;
  timed: boolean;
  lines: TimedLine[] | string[];
}

// ======================================================================
// HELPERS
// ======================================================================

const parseLRC = (content: string): TimedLine[] =>
  content
    .split('\n')
    .map((line) => {
      const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (!match) return null;
      const time = (parseInt(match[1]) * 60 + parseInt(match[2])) * 1000 + parseInt(match[3].padEnd(3, '0'));
      return { time, text: match[4].trim() };
    })
    .filter((l): l is TimedLine => l !== null && l.text !== '');

// ======================================================================
// HOOK
// ======================================================================

const useLyrics = (): LyricsState => {
  const [state, setState] = useState<LyricsState>({ loading: false, timed: false, lines: [] });

  const playingTrackList = useSelector(({ sessionModel }: any) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }: any) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }: any) => sessionModel.playingTrackKeys);
  const currentServer = useSelector(({ sessionModel }: any) => sessionModel.currentServer);
  const serverBaseUrl = useSelector(({ appModel }: any) => appModel.serverBaseUrl);

  const trackId = playingTrackList?.[playingTrackKeys?.[playingTrackIndex]]?.trackId;

  useEffect(() => {
    if (!trackId) {
      setState({ loading: false, timed: false, lines: [] });
      return;
    }

    let cancelled = false;
    setState({ loading: true, timed: false, lines: [] });

    bridge.getLyrics({ trackId }).then((result: { timed: boolean; content: string } | null) => {
      if (cancelled) return;
      if (!result) {
        setState({ loading: false, timed: false, lines: [] });
        return;
      }
      const lines = result.timed
        ? parseLRC(result.content)
        : result.content.split('\n').filter((l: string) => l.trim() !== '');
      setState({ loading: false, timed: result.timed, lines });
    });

    return () => {
      cancelled = true;
    };
  }, [trackId, currentServer, serverBaseUrl]);

  return state;
};

export default useLyrics;
