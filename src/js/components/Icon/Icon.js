// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import style from './Icon.module.scss';

// custom
import { ReactComponent as CheckCircleIcon } from './icons/music/check-circle.svg';
import { ReactComponent as CogIcon } from './icons/music/cog.svg';
import { ReactComponent as DiscIcon } from './icons/music/disc.svg';
import { ReactComponent as FastForwardIcon } from './icons/music/fast-forward.svg';
import { ReactComponent as GridIcon } from './icons/music/grid.svg';
import { ReactComponent as ListIcon } from './icons/music/list.svg';
import { ReactComponent as LogoutIcon } from './icons/music/logout.svg';
import { ReactComponent as MusicNoteIcon } from './icons/music/music-note.svg';
import { ReactComponent as NextIcon } from './icons/music/next.svg';
import { ReactComponent as PauseIcon } from './icons/music/pause.svg';
import { ReactComponent as PauseFilledIcon } from './icons/music/pause-filled.svg';
import { ReactComponent as PencilIcon } from './icons/music/pencil.svg';
import { ReactComponent as PlayIcon } from './icons/music/play.svg';
import { ReactComponent as PlayFilledIcon } from './icons/music/play-filled.svg';
import { ReactComponent as PreviousIcon } from './icons/music/previous.svg';
import { ReactComponent as QueueIcon } from './icons/music/queue.svg';
import { ReactComponent as RepeatIcon } from './icons/music/repeat.svg';
import { ReactComponent as RewindIcon } from './icons/music/rewind.svg';
import { ReactComponent as SearchIcon } from './icons/music/search.svg';
import { ReactComponent as ServerIcon } from './icons/music/server.svg';
import { ReactComponent as ShuffleIcon } from './icons/music/shuffle.svg';
import { ReactComponent as SkipBackIcon } from './icons/music/skip-back.svg';
import { ReactComponent as SkipForwardIcon } from './icons/music/skip-forward.svg';
import { ReactComponent as StarEmptyIcon } from './icons/music/star-empty.svg';
import { ReactComponent as StarFullIcon } from './icons/music/star-full.svg';
import { ReactComponent as StarHalfIcon } from './icons/music/star-half.svg';
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
  CheckCircleIcon,
  CogIcon,
  DiscIcon,
  FastForwardIcon,
  GridIcon,
  ListIcon,
  LogoutIcon,
  MusicNoteIcon,
  NextIcon,
  PauseIcon,
  PauseFilledIcon,
  PencilIcon,
  PlayIcon,
  PlayFilledIcon,
  PreviousIcon,
  QueueIcon,
  RepeatIcon,
  RewindIcon,
  SearchIcon,
  ServerIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  StarEmptyIcon,
  StarFullIcon,
  StarHalfIcon,
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
  if (!DisplayIcon) return null;
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
