// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import style from './Icon.module.scss';

// custom
import { ReactComponent as FastForwardIcon } from './icons/music/fast-forward.svg';
import { ReactComponent as GridIcon } from './icons/music/grid.svg';
import { ReactComponent as ListIcon } from './icons/music/list.svg';
import { ReactComponent as PauseIcon } from './icons/music/pause.svg';
import { ReactComponent as PauseFilledIcon } from './icons/music/pause-filled.svg';
import { ReactComponent as PlayIcon } from './icons/music/play.svg';
import { ReactComponent as PlayFilledIcon } from './icons/music/play-filled.svg';
import { ReactComponent as QueueIcon } from './icons/music/queue.svg';
import { ReactComponent as RepeatIcon } from './icons/music/repeat.svg';
import { ReactComponent as RewindIcon } from './icons/music/rewind.svg';
import { ReactComponent as SearchIcon } from './icons/music/search.svg';
import { ReactComponent as ShuffleIcon } from './icons/music/shuffle.svg';
import { ReactComponent as SkipBackIcon } from './icons/music/skip-back.svg';
import { ReactComponent as SkipForwardIcon } from './icons/music/skip-forward.svg';
import { ReactComponent as VolDownIcon } from './icons/music/vol-down.svg';
import { ReactComponent as VolHighIcon } from './icons/music/vol-high.svg';
import { ReactComponent as VolLowIcon } from './icons/music/vol-low.svg';
import { ReactComponent as VolMuteIcon } from './icons/music/vol-mute.svg';
import { ReactComponent as VolOffIcon } from './icons/music/vol-off.svg';
import { ReactComponent as VolUpIcon } from './icons/music/vol-up.svg';
import { ReactComponent as VolXIcon } from './icons/music/vol-x.svg';

// ======================================================================
// COMPONENT
// ======================================================================

const customIcons = {
  FastForwardIcon,
  GridIcon,
  ListIcon,
  PauseIcon,
  PauseFilledIcon,
  PlayIcon,
  PlayFilledIcon,
  QueueIcon,
  RepeatIcon,
  RewindIcon,
  SearchIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VolDownIcon,
  VolHighIcon,
  VolLowIcon,
  VolMuteIcon,
  VolOffIcon,
  VolUpIcon,
  VolXIcon,
};

const getIconComponent = (icon) => {
  if (customIcons[icon]) {
    return customIcons[icon];
  } else {
    return null;
  }
};

export const Icon = ({ icon, cover, stroke }) => {
  const DisplayIcon = getIconComponent(icon);
  return (
    <span
      className={clsx(style.icon, {
        [style.iconCover]: cover,
        [style.iconStroke]: stroke,
      })}
    >
      <DisplayIcon />
    </span>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Icon;
