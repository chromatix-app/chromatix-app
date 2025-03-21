// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import style from './Icon.module.scss';

// custom
import { ReactComponent as AccessibilityIcon } from './icons/music/accessibility.svg';
import { ReactComponent as AlbumCollectionsIcon } from './icons/music/album-collections.svg';
import { ReactComponent as AlbumGenresIcon } from './icons/music/album-genres.svg';
import { ReactComponent as AlbumMoodsIcon } from './icons/music/album-moods.svg';
import { ReactComponent as AlbumStylesIcon } from './icons/music/album-styles.svg';
import { ReactComponent as ArrowDownIcon } from './icons/music/arrow-down.svg';
import { ReactComponent as ArrowDownLongIcon } from './icons/music/arrow-down-long.svg';
import { ReactComponent as ArrowLeftIcon } from './icons/music/arrow-left.svg';
import { ReactComponent as ArrowRightIcon } from './icons/music/arrow-right.svg';
import { ReactComponent as ArrowUpIcon } from './icons/music/arrow-up.svg';
import { ReactComponent as ArrowUpLongIcon } from './icons/music/arrow-up-long.svg';
import { ReactComponent as ArrowsVerticalIcon } from './icons/music/arrows-vertical.svg';
import { ReactComponent as ArtistCollectionsIcon } from './icons/music/artist-collections.svg';
import { ReactComponent as ArtistGenresIcon } from './icons/music/artist-genres.svg';
import { ReactComponent as ArtistMoodsIcon } from './icons/music/artist-moods.svg';
import { ReactComponent as ArtistStylesIcon } from './icons/music/artist-styles.svg';
import { ReactComponent as BlueskyIcon } from './icons/music/bluesky.svg';
import { ReactComponent as CheckIcon } from './icons/music/check.svg';
import { ReactComponent as CheckCircleIcon } from './icons/music/check-circle.svg';
import { ReactComponent as ClockRewindIcon } from './icons/music/clock-rewind.svg';
import { ReactComponent as CloudOfflineIcon } from './icons/music/cloud-offline.svg';
import { ReactComponent as CogIcon } from './icons/music/cog.svg';
import { ReactComponent as CollapseIcon } from './icons/music/collapse.svg';
import { ReactComponent as ColumnsCircleIcon } from './icons/music/columns-circle.svg';
import { ReactComponent as CrossSmallIcon } from './icons/music/cross-small.svg';
import { ReactComponent as DiscIcon } from './icons/music/disc.svg';
import { ReactComponent as DownloadIcon } from './icons/music/download.svg';
import { ReactComponent as EllipsisCircleIcon } from './icons/music/ellipsis-circle.svg';
import { ReactComponent as ExpandIcon } from './icons/music/expand.svg';
import { ReactComponent as ExternalLinkIcon } from './icons/music/external-link.svg';
import { ReactComponent as FastForwardIcon } from './icons/music/fast-forward.svg';
import { ReactComponent as FolderIcon } from './icons/music/folder.svg';
import { ReactComponent as GithubIcon } from './icons/music/github.svg';
import { ReactComponent as GridIcon } from './icons/music/grid.svg';
import { ReactComponent as InfoIcon } from './icons/music/info.svg';
import { ReactComponent as LastFMIcon } from './icons/music/lastfm.svg';
import { ReactComponent as ListIcon } from './icons/music/list.svg';
import { ReactComponent as LogoutIcon } from './icons/music/logout.svg';
import { ReactComponent as MailIcon } from './icons/music/mail.svg';
import { ReactComponent as MailPlaneIcon } from './icons/music/mail-plane.svg';
import { ReactComponent as MicrophoneIcon } from './icons/music/microphone.svg';
import { ReactComponent as MusicNoteDoubleIcon } from './icons/music/music-note-double.svg';
import { ReactComponent as MusicNoteSingleIcon } from './icons/music/music-note-single.svg';
import { ReactComponent as NextIcon } from './icons/music/next.svg';
import { ReactComponent as PaintPaletteIcon } from './icons/music/paint-palette.svg';
import { ReactComponent as PauseIcon } from './icons/music/pause.svg';
import { ReactComponent as PauseCircleIcon } from './icons/music/pause-circle.svg';
import { ReactComponent as PauseFilledIcon } from './icons/music/pause-filled.svg';
import { ReactComponent as PencilIcon } from './icons/music/pencil.svg';
import { ReactComponent as PeopleIcon } from './icons/music/people.svg';
import { ReactComponent as PlayIcon } from './icons/music/play.svg';
import { ReactComponent as PlayCircleIcon } from './icons/music/play-circle.svg';
import { ReactComponent as PlayFilledIcon } from './icons/music/play-filled.svg';
import { ReactComponent as PlaylistIcon } from './icons/music/playlist.svg';
import { ReactComponent as PreviousIcon } from './icons/music/previous.svg';
import { ReactComponent as QueueIcon } from './icons/music/queue.svg';
import { ReactComponent as RedditIcon } from './icons/music/reddit.svg';
import { ReactComponent as RepeatIcon } from './icons/music/repeat.svg';
import { ReactComponent as RewindIcon } from './icons/music/rewind.svg';
import { ReactComponent as SearchIcon } from './icons/music/search.svg';
import { ReactComponent as ServerIcon } from './icons/music/server.svg';
import { ReactComponent as ShuffleIcon } from './icons/music/shuffle.svg';
import { ReactComponent as SideBarSmallIcon } from './icons/music/side-bar-small.svg';
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

import { ReactComponent as AppleSiteIcon } from './icons/site/apple.svg';
import { ReactComponent as GithubSiteIcon } from './icons/site/github.svg';
import { ReactComponent as LinuxSiteIcon } from './icons/site/linux.svg';
import { ReactComponent as RedditSiteIcon } from './icons/site/reddit.svg';
import { ReactComponent as WindowsSiteIcon } from './icons/site/windows.svg';

// ======================================================================
// COMPONENT
// ======================================================================

const customIcons = {
  AccessibilityIcon,
  AlbumCollectionsIcon,
  AlbumGenresIcon,
  AlbumMoodsIcon,
  AlbumStylesIcon,
  ArrowDownIcon,
  ArrowDownLongIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowUpLongIcon,
  ArrowsVerticalIcon,
  ArtistCollectionsIcon,
  ArtistGenresIcon,
  ArtistMoodsIcon,
  ArtistStylesIcon,
  BlueskyIcon,
  CheckIcon,
  CheckCircleIcon,
  ClockRewindIcon,
  CloudOfflineIcon,
  CogIcon,
  CollapseIcon,
  ColumnsCircleIcon,
  CrossSmallIcon,
  DiscIcon,
  DownloadIcon,
  EllipsisCircleIcon,
  ExpandIcon,
  ExternalLinkIcon,
  FastForwardIcon,
  FolderIcon,
  GithubIcon,
  GridIcon,
  InfoIcon,
  LastFMIcon,
  ListIcon,
  LogoutIcon,
  MailIcon,
  MailPlaneIcon,
  MicrophoneIcon,
  MusicNoteDoubleIcon,
  MusicNoteSingleIcon,
  NextIcon,
  PaintPaletteIcon,
  PauseIcon,
  PauseCircleIcon,
  PauseFilledIcon,
  PencilIcon,
  PeopleIcon,
  PlayIcon,
  PlayCircleIcon,
  PlayFilledIcon,
  PlaylistIcon,
  PreviousIcon,
  QueueIcon,
  RedditIcon,
  RepeatIcon,
  RewindIcon,
  SearchIcon,
  ServerIcon,
  ShuffleIcon,
  SideBarSmallIcon,
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

  AppleSiteIcon,
  GithubSiteIcon,
  LinuxSiteIcon,
  RedditSiteIcon,
  WindowsSiteIcon,
};

const getIconComponent = (icon) => {
  if (customIcons[icon]) {
    return customIcons[icon];
  } else {
    return null;
  }
};

export const Icon = ({ icon, cover, stroke, strokeWidth = 1 }) => {
  const DisplayIcon = getIconComponent(icon);
  if (!DisplayIcon) return null;
  return (
    <span
      className={clsx(style.icon, {
        [style.iconCover]: cover,
        [style.iconStroke]: stroke,
        [style['iconStrokeWidth' + parseFloat(strokeWidth) * 10]]: strokeWidth,
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
