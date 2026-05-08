// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import style from './Icon.module.scss';

// General Icons
import AccessibilityIcon from './icons/general-compressed/accessibility.svg?react';
import AlbumCollectionsIcon from './icons/general-compressed/album-collections.svg?react';
import AlbumGenresIcon from './icons/general-compressed/album-genres.svg?react';
import AlbumMoodsIcon from './icons/general-compressed/album-moods.svg?react';
import AlbumStylesIcon from './icons/general-compressed/album-styles.svg?react';
import AlbumTagsIcon from './icons/general-compressed/album-tags.svg?react';
import ArrowDownIcon from './icons/general-compressed/arrow-down.svg?react';
import ArrowDownLongIcon from './icons/general-compressed/arrow-down-long.svg?react';
// import ArrowLeftIcon from './icons/general-compressed/arrow-left.svg?react';
// import ArrowLeftLongIcon from './icons/general-compressed/arrow-left-long.svg?react';
import ArrowRightIcon from './icons/general-compressed/arrow-right.svg?react';
import ArrowRightLongIcon from './icons/general-compressed/arrow-right-long.svg?react';
import ArrowsVerticalIcon from './icons/general-compressed/arrows-vertical.svg?react';
import ArrowUpIcon from './icons/general-compressed/arrow-up.svg?react';
import ArrowUpLongIcon from './icons/general-compressed/arrow-up-long.svg?react';
import ArtistCollectionsIcon from './icons/general-compressed/artist-collections.svg?react';
import ArtistGenresIcon from './icons/general-compressed/artist-genres.svg?react';
import ArtistMoodsIcon from './icons/general-compressed/artist-moods.svg?react';
import ArtistStylesIcon from './icons/general-compressed/artist-styles.svg?react';
import ArtistTagsIcon from './icons/general-compressed/artist-tags.svg?react';
import BlueskyIcon from './icons/general-compressed/bluesky.svg?react';
import CheckCircleCheckedIcon from './icons/general-compressed/check-circle-checked.svg?react';
import CheckCircleEmptyIcon from './icons/general-compressed/check-circle-empty.svg?react';
import CheckCircleFilledIcon from './icons/general-compressed/check-circle-filled.svg?react';
import CheckCircleMiddleIcon from './icons/general-compressed/check-circle-middle.svg?react';
// import CheckIcon from './icons/general-compressed/check.svg?react';
// import CheckSquareCheckedIcon from './icons/general-compressed/check-square-checked.svg?react';
import CheckSquareEmptyIcon from './icons/general-compressed/check-square-empty.svg?react';
import CheckSquareFilledIcon from './icons/general-compressed/check-square-filled.svg?react';
import ClockRewindIcon from './icons/general-compressed/clock-rewind.svg?react';
import CloudOfflineIcon from './icons/general-compressed/cloud-offline.svg?react';
import CogIcon from './icons/general-compressed/cog.svg?react';
import CollapseIcon from './icons/general-compressed/collapse.svg?react';
// import ColumnsCircleIcon from './icons/general-compressed/columns-circle.svg?react';
import ControlBarIcon from './icons/general-compressed/control-bar.svg?react';
import CrossSmallIcon from './icons/general-compressed/cross-small.svg?react';
import CrownIcon from './icons/general-compressed/crown.svg?react';
import DiscIcon from './icons/general-compressed/disc.svg?react';
import DownloadIcon from './icons/general-compressed/download.svg?react';
import EllipsisCircleIcon from './icons/general-compressed/ellipsis-circle.svg?react';
// import ExpandIcon from './icons/general-compressed/expand.svg?react';
import ExpandSplitIcon from './icons/general-compressed/expand-split.svg?react';
import ExternalLinkIcon from './icons/general-compressed/external-link.svg?react';
import EyeIcon from './icons/general-compressed/eye.svg?react';
import FastForwardIcon from './icons/general-compressed/fast-forward.svg?react';
import FeaturebaseIcon from './icons/general-compressed/feature-base.svg?react';
import FolderIcon from './icons/general-compressed/folder.svg?react';
import GithubIcon from './icons/general-compressed/github.svg?react';
import GridIcon from './icons/general-compressed/grid-small.svg?react';
import HeartIcon from './icons/general-compressed/heart.svg?react';
import InfoIcon from './icons/general-compressed/info.svg?react';
import LastFMIcon from './icons/general-compressed/lastfm.svg?react';
import ListIcon from './icons/general-compressed/list-small.svg?react';
import LogoutIcon from './icons/general-compressed/logout.svg?react';
import MailIcon from './icons/general-compressed/mail.svg?react';
// import MailPlaneIcon from './icons/general-compressed/mail-plane.svg?react';
import MegaphoneIcon from './icons/general-compressed/megaphone.svg?react';
import MicrophoneIcon from './icons/general-compressed/microphone.svg?react';
import MusicNoteDoubleIcon from './icons/general-compressed/music-note-double.svg?react';
import MusicNoteSingleIcon from './icons/general-compressed/music-note-single.svg?react';
import NextIcon from './icons/general-compressed/next.svg?react';
import PadlockIcon from './icons/general-compressed/padlock.svg?react';
import PaintPaletteIcon from './icons/general-compressed/paint-palette.svg?react';
// import PauseCircleIcon from './icons/general-compressed/pause-circle.svg?react';
import PauseFilledIcon from './icons/general-compressed/pause-filled.svg?react';
import PauseIcon from './icons/general-compressed/pause.svg?react';
import PencilIcon from './icons/general-compressed/pencil.svg?react';
import PeopleIcon from './icons/general-compressed/people.svg?react';
import PersonSquareIcon from './icons/general-compressed/person-square.svg?react';
import PlayCircleIcon from './icons/general-compressed/play-circle.svg?react';
import PlayFilledIcon from './icons/general-compressed/play-filled.svg?react';
import PlayIcon from './icons/general-compressed/play.svg?react';
import PlaylistIcon from './icons/general-compressed/playlist.svg?react';
import PreviousIcon from './icons/general-compressed/previous.svg?react';
import QueueIcon from './icons/general-compressed/queue.svg?react';
import RedditIcon from './icons/general-compressed/reddit.svg?react';
import RepeatAllIcon from './icons/general-compressed/repeat-all.svg?react';
import RepeatOnceIcon from './icons/general-compressed/repeat-once.svg?react';
import RewindIcon from './icons/general-compressed/rewind.svg?react';
import SearchIcon from './icons/general-compressed/search.svg?react';
import ServerIcon from './icons/general-compressed/server.svg?react';
import ShuffleIcon from './icons/general-compressed/shuffle.svg?react';
import SideBarIcon from './icons/general-compressed/sidebar.svg?react';
import SkipBackIcon from './icons/general-compressed/skip-back.svg?react';
import SkipForwardIcon from './icons/general-compressed/skip-forward.svg?react';
import StarEmptyIcon from './icons/general-original/star-empty.svg?react';
import StarFullIcon from './icons/general-original/star-full.svg?react';
import StarHalfIcon from './icons/general-original/star-half.svg?react';
import VanishedCircleIcon from './icons/general-compressed/vanished-circle.svg?react';
// import VolDownIcon from './icons/general-compressed/vol-down.svg?react';
import VolHighIcon from './icons/general-compressed/vol-high.svg?react';
import VolLowIcon from './icons/general-compressed/vol-low.svg?react';
// import VolMuteIcon from './icons/general-compressed/vol-mute.svg?react';
// import VolOffIcon from './icons/general-compressed/vol-off.svg?react';
// import VolUpIcon from './icons/general-compressed/vol-up.svg?react';
import VolXIcon from './icons/general-compressed/vol-x.svg?react';

// Site Custom Icons
import AppleSiteIcon from './icons/site-compressed/apple.svg?react';
import FeaturebaseSiteIcon from './icons/site-compressed/featurebase.svg?react';
import GithubSiteIcon from './icons/site-compressed/github.svg?react';
import JellyfinSiteIcon from './icons/site-original/jellyfin.svg?react';
import LinuxSiteIcon from './icons/site-compressed/linux.svg?react';
import PlexSiteIcon from './icons/site-compressed/plex.svg?react';
import RedditSiteIcon from './icons/site-original/reddit.svg?react';
import WindowsSiteIcon from './icons/site-compressed/windows.svg?react';

// ======================================================================
// COMPONENT
// ======================================================================

export const generalIcons = {
  AccessibilityIcon,
  AlbumCollectionsIcon,
  AlbumGenresIcon,
  AlbumMoodsIcon,
  AlbumStylesIcon,
  AlbumTagsIcon,
  ArrowDownIcon,
  ArrowDownLongIcon,
  // ArrowLeftIcon,
  // ArrowLeftLongIcon,
  ArrowRightIcon,
  ArrowRightLongIcon,
  ArrowsVerticalIcon,
  ArrowUpIcon,
  ArrowUpLongIcon,
  ArtistCollectionsIcon,
  ArtistGenresIcon,
  ArtistMoodsIcon,
  ArtistStylesIcon,
  ArtistTagsIcon,
  BlueskyIcon,
  CheckCircleCheckedIcon,
  CheckCircleEmptyIcon,
  CheckCircleFilledIcon,
  CheckCircleMiddleIcon,
  // CheckIcon,
  // CheckSquareCheckedIcon,
  CheckSquareEmptyIcon,
  CheckSquareFilledIcon,
  ClockRewindIcon,
  CloudOfflineIcon,
  CogIcon,
  CollapseIcon,
  // ColumnsCircleIcon,
  ControlBarIcon,
  CrownIcon,
  CrossSmallIcon,
  DiscIcon,
  DownloadIcon,
  EllipsisCircleIcon,
  // ExpandIcon,
  ExpandSplitIcon,
  ExternalLinkIcon,
  EyeIcon,
  FastForwardIcon,
  FeaturebaseIcon,
  FolderIcon,
  GithubIcon,
  GridIcon,
  HeartIcon,
  InfoIcon,
  LastFMIcon,
  ListIcon,
  LogoutIcon,
  MailIcon,
  // MailPlaneIcon,
  MegaphoneIcon,
  MicrophoneIcon,
  MusicNoteDoubleIcon,
  MusicNoteSingleIcon,
  NextIcon,
  PadlockIcon,
  PaintPaletteIcon,
  // PauseCircleIcon,
  PauseFilledIcon,
  PauseIcon,
  PencilIcon,
  PeopleIcon,
  PersonSquareIcon,
  PlayCircleIcon,
  PlayFilledIcon,
  PlayIcon,
  PlaylistIcon,
  PreviousIcon,
  QueueIcon,
  RedditIcon,
  RepeatAllIcon,
  RepeatOnceIcon,
  RewindIcon,
  SearchIcon,
  ServerIcon,
  ShuffleIcon,
  SideBarIcon,
  SkipBackIcon,
  SkipForwardIcon,
  StarEmptyIcon,
  StarFullIcon,
  StarHalfIcon,
  VanishedCircleIcon,
  // VolDownIcon,
  VolHighIcon,
  VolLowIcon,
  // VolMuteIcon,
  // VolOffIcon,
  // VolUpIcon,
  VolXIcon,
};

export const siteIcons = {
  AppleSiteIcon,
  FeaturebaseSiteIcon,
  GithubSiteIcon,
  JellyfinSiteIcon,
  LinuxSiteIcon,
  PlexSiteIcon,
  RedditSiteIcon,
  WindowsSiteIcon,
};

const getIconComponent = (icon) => {
  if (generalIcons[icon]) {
    return generalIcons[icon];
  } else if (siteIcons[icon]) {
    return siteIcons[icon];
  } else {
    return null;
  }
};

export const Icon = ({ icon, cover, dashed, stroke, strokeAndFill, strokeWidth = 1 }) => {
  const DisplayIcon = getIconComponent(icon);
  if (!DisplayIcon) return null;
  return (
    <span
      data-icon={icon}
      className={clsx(style.icon, {
        [style.iconCover]: cover,
        [style.iconStroke]: stroke,
        [style.iconStrokeAndFill]: strokeAndFill,
        [style.iconDashed]: dashed,
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
