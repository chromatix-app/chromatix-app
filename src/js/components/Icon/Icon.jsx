// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import style from './Icon.module.scss';

// General Icons
import { ReactComponent as AccessibilityIcon } from './icons/general-original/accessibility.svg';
import { ReactComponent as AlbumCollectionsIcon } from './icons/general-original/album-collections.svg';
import { ReactComponent as AlbumGenresIcon } from './icons/general-original/album-genres.svg';
import { ReactComponent as AlbumMoodsIcon } from './icons/general-original/album-moods.svg';
import { ReactComponent as AlbumStylesIcon } from './icons/general-original/album-styles.svg';
import { ReactComponent as AlbumTagsIcon } from './icons/general-original/album-tags.svg';
import { ReactComponent as ArrowDownIcon } from './icons/general-original/arrow-down.svg';
import { ReactComponent as ArrowDownLongIcon } from './icons/general-original/arrow-down-long.svg';
// import { ReactComponent as ArrowLeftIcon } from './icons/general-original/arrow-left.svg';
// import { ReactComponent as ArrowLeftLongIcon } from './icons/general-original/arrow-left-long.svg';
import { ReactComponent as ArrowRightIcon } from './icons/general-original/arrow-right.svg';
import { ReactComponent as ArrowRightLongIcon } from './icons/general-original/arrow-right-long.svg';
import { ReactComponent as ArrowsVerticalIcon } from './icons/general-original/arrows-vertical.svg';
import { ReactComponent as ArrowUpIcon } from './icons/general-original/arrow-up.svg';
import { ReactComponent as ArrowUpLongIcon } from './icons/general-original/arrow-up-long.svg';
import { ReactComponent as ArtistCollectionsIcon } from './icons/general-original/artist-collections.svg';
import { ReactComponent as ArtistGenresIcon } from './icons/general-original/artist-genres.svg';
import { ReactComponent as ArtistMoodsIcon } from './icons/general-original/artist-moods.svg';
import { ReactComponent as ArtistStylesIcon } from './icons/general-original/artist-styles.svg';
import { ReactComponent as ArtistTagsIcon } from './icons/general-original/artist-tags.svg';
import { ReactComponent as BlueskyIcon } from './icons/general-original/bluesky.svg';
import { ReactComponent as CheckCircleCheckedIcon } from './icons/general-original/check-circle-checked.svg';
import { ReactComponent as CheckCircleEmptyIcon } from './icons/general-original/check-circle-empty.svg';
import { ReactComponent as CheckCircleFilledIcon } from './icons/general-original/check-circle-filled.svg';
import { ReactComponent as CheckCircleMiddleIcon } from './icons/general-original/check-circle-middle.svg';
// import { ReactComponent as CheckIcon } from './icons/general-original/check.svg';
// import { ReactComponent as CheckSquareCheckedIcon } from './icons/general-original/check-square-checked.svg';
import { ReactComponent as CheckSquareEmptyIcon } from './icons/general-original/check-square-empty.svg';
import { ReactComponent as CheckSquareFilledIcon } from './icons/general-original/check-square-filled.svg';
import { ReactComponent as ClockRewindIcon } from './icons/general-original/clock-rewind.svg';
import { ReactComponent as CloudOfflineIcon } from './icons/general-original/cloud-offline.svg';
import { ReactComponent as CogIcon } from './icons/general-original/cog.svg';
import { ReactComponent as CollapseIcon } from './icons/general-original/collapse.svg';
// import { ReactComponent as ColumnsCircleIcon } from './icons/general-original/columns-circle.svg';
import { ReactComponent as ControlBarIcon } from './icons/general-original/control-bar.svg';
import { ReactComponent as CrossSmallIcon } from './icons/general-original/cross-small.svg';
import { ReactComponent as DiscIcon } from './icons/general-original/disc.svg';
import { ReactComponent as DownloadIcon } from './icons/general-original/download.svg';
import { ReactComponent as EllipsisCircleIcon } from './icons/general-original/ellipsis-circle.svg';
// import { ReactComponent as ExpandIcon } from './icons/general-original/expand.svg';
import { ReactComponent as ExpandSplitIcon } from './icons/general-original/expand-split.svg';
import { ReactComponent as ExternalLinkIcon } from './icons/general-original/external-link.svg';
import { ReactComponent as EyeIcon } from './icons/general-original/eye.svg';
import { ReactComponent as FastForwardIcon } from './icons/general-original/fast-forward.svg';
import { ReactComponent as FeaturebaseIcon } from './icons/general-original/feature-base.svg';
import { ReactComponent as FolderIcon } from './icons/general-original/folder.svg';
import { ReactComponent as GithubIcon } from './icons/general-original/github.svg';
import { ReactComponent as GridIcon } from './icons/general-original/grid-small.svg';
import { ReactComponent as HeartIcon } from './icons/general-original/heart.svg';
import { ReactComponent as InfoIcon } from './icons/general-original/info.svg';
import { ReactComponent as LastFMIcon } from './icons/general-original/lastfm.svg';
import { ReactComponent as ListIcon } from './icons/general-original/list-small.svg';
import { ReactComponent as LogoutIcon } from './icons/general-original/logout.svg';
import { ReactComponent as MailIcon } from './icons/general-original/mail.svg';
// import { ReactComponent as MailPlaneIcon } from './icons/general-original/mail-plane.svg';
import { ReactComponent as MegaphoneIcon } from './icons/general-original/megaphone.svg';
import { ReactComponent as MicrophoneIcon } from './icons/general-original/microphone.svg';
import { ReactComponent as MusicNoteDoubleIcon } from './icons/general-original/music-note-double.svg';
import { ReactComponent as MusicNoteSingleIcon } from './icons/general-original/music-note-single.svg';
import { ReactComponent as NextIcon } from './icons/general-original/next.svg';
import { ReactComponent as PaintPaletteIcon } from './icons/general-original/paint-palette.svg';
// import { ReactComponent as PauseCircleIcon } from './icons/general-original/pause-circle.svg';
import { ReactComponent as PauseFilledIcon } from './icons/general-original/pause-filled.svg';
import { ReactComponent as PauseIcon } from './icons/general-original/pause.svg';
import { ReactComponent as PencilIcon } from './icons/general-original/pencil.svg';
import { ReactComponent as PeopleIcon } from './icons/general-original/people.svg';
import { ReactComponent as PersonSquareIcon } from './icons/general-original/person-square.svg';
import { ReactComponent as PlayCircleIcon } from './icons/general-original/play-circle.svg';
import { ReactComponent as PlayFilledIcon } from './icons/general-original/play-filled.svg';
import { ReactComponent as PlayIcon } from './icons/general-original/play.svg';
import { ReactComponent as PlaylistIcon } from './icons/general-original/playlist.svg';
import { ReactComponent as PreviousIcon } from './icons/general-original/previous.svg';
import { ReactComponent as QueueIcon } from './icons/general-original/queue.svg';
import { ReactComponent as RedditIcon } from './icons/general-original/reddit.svg';
import { ReactComponent as RepeatAllIcon } from './icons/general-original/repeat-all.svg';
import { ReactComponent as RepeatOnceIcon } from './icons/general-original/repeat-once.svg';
import { ReactComponent as RewindIcon } from './icons/general-original/rewind.svg';
import { ReactComponent as SearchIcon } from './icons/general-original/search.svg';
import { ReactComponent as ServerIcon } from './icons/general-original/server.svg';
import { ReactComponent as ShuffleIcon } from './icons/general-original/shuffle.svg';
import { ReactComponent as SideBarIcon } from './icons/general-original/sidebar.svg';
import { ReactComponent as SkipBackIcon } from './icons/general-original/skip-back.svg';
import { ReactComponent as SkipForwardIcon } from './icons/general-original/skip-forward.svg';
import { ReactComponent as StarEmptyIcon } from './icons/general-original/star-empty.svg';
import { ReactComponent as StarFullIcon } from './icons/general-original/star-full.svg';
import { ReactComponent as StarHalfIcon } from './icons/general-original/star-half.svg';
import { ReactComponent as VanishedCircleIcon } from './icons/general-original/vanished-circle.svg';
// import { ReactComponent as VolDownIcon } from './icons/general-original/vol-down.svg';
import { ReactComponent as VolHighIcon } from './icons/general-original/vol-high.svg';
import { ReactComponent as VolLowIcon } from './icons/general-original/vol-low.svg';
// import { ReactComponent as VolMuteIcon } from './icons/general-original/vol-mute.svg';
// import { ReactComponent as VolOffIcon } from './icons/general-original/vol-off.svg';
// import { ReactComponent as VolUpIcon } from './icons/general-original/vol-up.svg';
import { ReactComponent as VolXIcon } from './icons/general-original/vol-x.svg';

// Site Custom Icons
import { ReactComponent as AppleSiteIcon } from './icons/site-original/apple.svg';
import { ReactComponent as FeaturebaseSiteIcon } from './icons/site-original/featurebase.svg';
import { ReactComponent as GithubSiteIcon } from './icons/site-original/github.svg';
import { ReactComponent as JellyfinSiteIcon } from './icons/site-original/jellyfin.svg';
import { ReactComponent as LinuxSiteIcon } from './icons/site-original/linux.svg';
import { ReactComponent as PlexSiteIcon } from './icons/site-original/plex.svg';
import { ReactComponent as RedditSiteIcon } from './icons/site-original/reddit.svg';
import { ReactComponent as WindowsSiteIcon } from './icons/site-original/windows.svg';

// ======================================================================
// COMPONENT
// ======================================================================

export const customIcons = {
  // General Icons
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

  // Site Custom Icons
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
  if (customIcons[icon]) {
    return customIcons[icon];
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
