// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import clsx from 'clsx';

import * as playerX from 'js/services/player';

import style from './LyricsPanel.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

/**
 * Shared lyrics display. Handles active-line tracking, auto-scroll and
 * click-to-seek. Pass `className` to override the scroll-container class
 * so callers can control font size / padding.
 */
const LyricsPanel = ({ lines, timed, className }) => {
  const dispatch = useDispatch();

  // Poll currentTime directly at 200ms for sub-second LRC precision.
  // usePlayerProgress rounds to the nearest second (up to ±1s lag) so we
  // bypass it here and read the float value straight from the audio element.
  const [nowMs, setNowMs] = useState(() => playerX.getCurrentProgress() * 1000);
  useEffect(() => {
    const id = setInterval(() => setNowMs(playerX.getCurrentProgress() * 1000), 200);
    return () => clearInterval(id);
  }, []);

  const containerRef = useRef(null);
  const activeRef = useRef(null);

  const activeIndex = useMemo(() => {
    if (!timed) return -1;
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= nowMs) idx = i;
      else break;
    }
    return idx;
  }, [timed, lines, nowMs]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);

  const handleLineClick = (line) => {
    if (!timed) return;
    playerX.setProgress(line.time);
    dispatch.playerModel.playerProgress(line.time);
  };

  return (
    <div className={clsx(style.scroll, className)} ref={containerRef}>
      {lines.map((line, i) => (
        <div
          key={i}
          ref={i === activeIndex ? activeRef : null}
          className={clsx(style.line, {
            [style.active]: i === activeIndex,
            [style.timed]: timed,
          })}
          onClick={() => handleLineClick(line)}
        >
          {timed ? line.text : line}
        </div>
      ))}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default LyricsPanel;
