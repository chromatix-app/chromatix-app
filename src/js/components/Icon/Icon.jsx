// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import style from './Icon.module.scss';

// General Icons
import { ReactComponent as AccessibilityIcon } from './icons/general/accessibility.svg';
import { ReactComponent as AlbumCollectionsIcon } from './icons/general/album-collections.svg';
import { ReactComponent as AlbumGenresIcon } from './icons/general/album-genres.svg';
import { ReactComponent as AlbumMoodsIcon } from './icons/general/album-moods.svg';
import { ReactComponent as AlbumStylesIcon } from './icons/general/album-styles.svg';
import { ReactComponent as AlbumTagsIcon } from './icons/general/album-tags.svg';
import { ReactComponent as ArrowDownIcon } from './icons/general/arrow-down.svg';
import { ReactComponent as ArrowDownLongIcon } from './icons/general/arrow-down-long.svg';
// import { ReactComponent as ArrowLeftIcon } from './icons/general/arrow-left.svg';
// import { ReactComponent as ArrowLeftLongIcon } from './icons/general/arrow-left-long.svg';
import { ReactComponent as ArrowRightIcon } from './icons/general/arrow-right.svg';
import { ReactComponent as ArrowRightLongIcon } from './icons/general/arrow-right-long.svg';
import { ReactComponent as ArrowsVerticalIcon } from './icons/general/arrows-vertical.svg';
import { ReactComponent as ArrowUpIcon } from './icons/general/arrow-up.svg';
import { ReactComponent as ArrowUpLongIcon } from './icons/general/arrow-up-long.svg';
import { ReactComponent as ArtistCollectionsIcon } from './icons/general/artist-collections.svg';
import { ReactComponent as ArtistGenresIcon } from './icons/general/artist-genres.svg';
import { ReactComponent as ArtistMoodsIcon } from './icons/general/artist-moods.svg';
import { ReactComponent as ArtistStylesIcon } from './icons/general/artist-styles.svg';
import { ReactComponent as ArtistTagsIcon } from './icons/general/artist-tags.svg';
import { ReactComponent as BlueskyIcon } from './icons/general/bluesky.svg';
import { ReactComponent as CheckCircleCheckedIcon } from './icons/general/check-circle-checked.svg';
import { ReactComponent as CheckCircleEmptyIcon } from './icons/general/check-circle-empty.svg';
import { ReactComponent as CheckCircleFilledIcon } from './icons/general/check-circle-filled.svg';
import { ReactComponent as CheckCircleMiddleIcon } from './icons/general/check-circle-middle.svg';
// import { ReactComponent as CheckIcon } from './icons/general/check.svg';
// import { ReactComponent as CheckSquareCheckedIcon } from './icons/general/check-square-checked.svg';
import { ReactComponent as CheckSquareEmptyIcon } from './icons/general/check-square-empty.svg';
import { ReactComponent as CheckSquareFilledIcon } from './icons/general/check-square-filled.svg';
import { ReactComponent as ClockRewindIcon } from './icons/general/clock-rewind.svg';
import { ReactComponent as CloudOfflineIcon } from './icons/general/cloud-offline.svg';
import { ReactComponent as CogIcon } from './icons/general/cog.svg';
import { ReactComponent as CollapseIcon } from './icons/general/collapse.svg';
// import { ReactComponent as ColumnsCircleIcon } from './icons/general/columns-circle.svg';
import { ReactComponent as ControlBarIcon } from './icons/general/control-bar.svg';
import { ReactComponent as CrossSmallIcon } from './icons/general/cross-small.svg';
import { ReactComponent as DiscIcon } from './icons/general/disc.svg';
import { ReactComponent as DownloadIcon } from './icons/general/download.svg';
import { ReactComponent as EllipsisCircleIcon } from './icons/general/ellipsis-circle.svg';
// import { ReactComponent as ExpandIcon } from './icons/general/expand.svg';
import { ReactComponent as ExpandSplitIcon } from './icons/general/expand-split.svg';
import { ReactComponent as ExternalLinkIcon } from './icons/general/external-link.svg';
import { ReactComponent as EyeIcon } from './icons/general/eye.svg';
import { ReactComponent as FastForwardIcon } from './icons/general/fast-forward.svg';
import { ReactComponent as FeaturebaseIcon } from './icons/general/feature-base.svg';
import { ReactComponent as FolderIcon } from './icons/general/folder.svg';
import { ReactComponent as GithubIcon } from './icons/general/github.svg';
import { ReactComponent as GridIcon } from './icons/general/grid-small.svg';
import { ReactComponent as HeartIcon } from './icons/general/heart.svg';
import { ReactComponent as InfoIcon } from './icons/general/info.svg';
import { ReactComponent as LastFMIcon } from './icons/general/lastfm.svg';
import { ReactComponent as ListIcon } from './icons/general/list-small.svg';
import { ReactComponent as LogoutIcon } from './icons/general/logout.svg';
import { ReactComponent as MailIcon } from './icons/general/mail.svg';
// import { ReactComponent as MailPlaneIcon } from './icons/general/mail-plane.svg';
import { ReactComponent as MegaphoneIcon } from './icons/general/megaphone.svg';
import { ReactComponent as MicrophoneIcon } from './icons/general/microphone.svg';
import { ReactComponent as MusicNoteDoubleIcon } from './icons/general/music-note-double.svg';
import { ReactComponent as MusicNoteSingleIcon } from './icons/general/music-note-single.svg';
import { ReactComponent as NextIcon } from './icons/general/next.svg';
import { ReactComponent as PaintPaletteIcon } from './icons/general/paint-palette.svg';
// import { ReactComponent as PauseCircleIcon } from './icons/general/pause-circle.svg';
import { ReactComponent as PauseFilledIcon } from './icons/general/pause-filled.svg';
import { ReactComponent as PauseIcon } from './icons/general/pause.svg';
import { ReactComponent as PencilIcon } from './icons/general/pencil.svg';
import { ReactComponent as PeopleIcon } from './icons/general/people.svg';
import { ReactComponent as PersonSquareIcon } from './icons/general/person-square.svg';
import { ReactComponent as PlayCircleIcon } from './icons/general/play-circle.svg';
import { ReactComponent as PlayFilledIcon } from './icons/general/play-filled.svg';
import { ReactComponent as PlayIcon } from './icons/general/play.svg';
import { ReactComponent as PlaylistIcon } from './icons/general/playlist.svg';
import { ReactComponent as PreviousIcon } from './icons/general/previous.svg';
import { ReactComponent as QueueIcon } from './icons/general/queue.svg';
import { ReactComponent as RedditIcon } from './icons/general/reddit.svg';
import { ReactComponent as RepeatAllIcon } from './icons/general/repeat-all.svg';
import { ReactComponent as RepeatOnceIcon } from './icons/general/repeat-once.svg';
import { ReactComponent as RewindIcon } from './icons/general/rewind.svg';
import { ReactComponent as SearchIcon } from './icons/general/search.svg';
import { ReactComponent as ServerIcon } from './icons/general/server.svg';
import { ReactComponent as ShuffleIcon } from './icons/general/shuffle.svg';
import { ReactComponent as SideBarIcon } from './icons/general/sidebar.svg';
import { ReactComponent as SkipBackIcon } from './icons/general/skip-back.svg';
import { ReactComponent as SkipForwardIcon } from './icons/general/skip-forward.svg';
import { ReactComponent as StarEmptyIcon } from './icons/general/star-empty.svg';
import { ReactComponent as StarFullIcon } from './icons/general/star-full.svg';
import { ReactComponent as StarHalfIcon } from './icons/general/star-half.svg';
// import { ReactComponent as VolDownIcon } from './icons/general/vol-down.svg';
import { ReactComponent as VolHighIcon } from './icons/general/vol-high.svg';
import { ReactComponent as VolLowIcon } from './icons/general/vol-low.svg';
// import { ReactComponent as VolMuteIcon } from './icons/general/vol-mute.svg';
// import { ReactComponent as VolOffIcon } from './icons/general/vol-off.svg';
// import { ReactComponent as VolUpIcon } from './icons/general/vol-up.svg';
import { ReactComponent as VolXIcon } from './icons/general/vol-x.svg';

// Site Custom Icons
import { ReactComponent as AppleSiteIcon } from './icons/site/apple.svg';
import { ReactComponent as FeaturebaseSiteIcon } from './icons/site/featurebase.svg';
import { ReactComponent as GithubSiteIcon } from './icons/site/github.svg';
import { ReactComponent as JellyfinSiteIcon } from './icons/site/jellyfin.svg';
import { ReactComponent as LinuxSiteIcon } from './icons/site/linux.svg';
import { ReactComponent as PlexSiteIcon } from './icons/site/plex.svg';
import { ReactComponent as RedditSiteIcon } from './icons/site/reddit.svg';
import { ReactComponent as WindowsSiteIcon } from './icons/site/windows.svg';

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

export const Icon = ({ icon, cover, stroke, strokeWidth = 1 }) => {
  const DisplayIcon = getIconComponent(icon);
  if (!DisplayIcon) return null;
  return (
    <span
      data-icon={icon}
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
