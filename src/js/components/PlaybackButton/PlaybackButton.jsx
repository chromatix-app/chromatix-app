// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import { Icon } from 'js/components';

import style from './PlaybackButton.module.scss';

// ======================================================================
// VARIANTS
// ======================================================================

const variants = {
  play: {
    getIcon: (isPlaying) => (isPlaying ? 'PauseFilledIcon' : 'PlayFilledIcon'),
    getLabel: (isPlaying, isLoaded) => (isPlaying ? 'Pause' : isLoaded ? 'Resume' : 'Play'),
    showLabel: true,
  },
  shuffle: {
    getIcon: () => 'ShuffleIcon',
    getLabel: () => 'Shuffle',
    stroke: true,
    strokeWidth: 1.4,
  },
};

// ======================================================================
// COMPONENT
// ======================================================================

export const PlaybackButton = ({ variant = 'play', isPlaying = false, isLoaded = false, onClick }) => {
  const key = variants[variant] ? variant : 'play';
  const entry = variants[key];
  const label = entry.getLabel(isPlaying, isLoaded);

  return (
    <button
      type="button"
      className={clsx(style.button, style[key])}
      onClick={onClick}
      aria-label={entry.showLabel ? undefined : label}
    >
      <span className={style.icon}>
        <Icon icon={entry.getIcon(isPlaying)} cover stroke={entry.stroke} strokeWidth={entry.strokeWidth} />
      </span>
      {entry.showLabel && <span>{label}</span>}
    </button>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaybackButton;
