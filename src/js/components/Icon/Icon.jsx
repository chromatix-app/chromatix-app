// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import style from './Icon.module.scss';

// General Icons
import { ReactComponent as AccessibilityIcon } from './icons/general-compressed/accessibility.svg';
import { ReactComponent as AlbumCollectionsIcon } from './icons/general-compressed/album-collections.svg';
import { ReactComponent as AlbumGenresIcon } from './icons/general-compressed/album-genres.svg';
import { ReactComponent as AlbumMoodsIcon } from './icons/general-compressed/album-moods.svg';
import { ReactComponent as AlbumStylesIcon } from './icons/general-compressed/album-styles.svg';
import { ReactComponent as AlbumTagsIcon } from './icons/general-compressed/album-tags.svg';
import { ReactComponent as ArrowDownIcon } from './icons/general-compressed/arrow-down.svg';
import { ReactComponent as ArrowDownLongIcon } from './icons/general-compressed/arrow-down-long.svg';
// import { ReactComponent as ArrowLeftIcon } from './icons/general-compressed/arrow-left.svg';
// import { ReactComponent as ArrowLeftLongIcon } from './icons/general-compressed/arrow-left-long.svg';
import { ReactComponent as ArrowRightIcon } from './icons/general-compressed/arrow-right.svg';
import { ReactComponent as ArrowRightLongIcon } from './icons/general-compressed/arrow-right-long.svg';
import { ReactComponent as ArrowsVerticalIcon } from './icons/general-compressed/arrows-vertical.svg';
import { ReactComponent as ArrowUpIcon } from './icons/general-compressed/arrow-up.svg';
import { ReactComponent as ArrowUpLongIcon } from './icons/general-compressed/arrow-up-long.svg';
import { ReactComponent as ArtistCollectionsIcon } from './icons/general-compressed/artist-collections.svg';
import { ReactComponent as ArtistGenresIcon } from './icons/general-compressed/artist-genres.svg';
import { ReactComponent as ArtistMoodsIcon } from './icons/general-compressed/artist-moods.svg';
import { ReactComponent as ArtistStylesIcon } from './icons/general-compressed/artist-styles.svg';
import { ReactComponent as ArtistTagsIcon } from './icons/general-compressed/artist-tags.svg';
import { ReactComponent as BlueskyIcon } from './icons/general-compressed/bluesky.svg';
import { ReactComponent as CheckCircleCheckedIcon } from './icons/general-compressed/check-circle-checked.svg';
import { ReactComponent as CheckCircleEmptyIcon } from './icons/general-compressed/check-circle-empty.svg';
import { ReactComponent as CheckCircleFilledIcon } from './icons/general-compressed/check-circle-filled.svg';
import { ReactComponent as CheckCircleMiddleIcon } from './icons/general-compressed/check-circle-middle.svg';
// import { ReactComponent as CheckIcon } from './icons/general-compressed/check.svg';
// import { ReactComponent as CheckSquareCheckedIcon } from './icons/general-compressed/check-square-checked.svg';
import { ReactComponent as CheckSquareEmptyIcon } from './icons/general-compressed/check-square-empty.svg';
import { ReactComponent as CheckSquareFilledIcon } from './icons/general-compressed/check-square-filled.svg';
import { ReactComponent as ClockRewindIcon } from './icons/general-compressed/clock-rewind.svg';
import { ReactComponent as CloudOfflineIcon } from './icons/general-compressed/cloud-offline.svg';
import { ReactComponent as CogIcon } from './icons/general-compressed/cog.svg';
import { ReactComponent as CollapseIcon } from './icons/general-compressed/collapse.svg';
// import { ReactComponent as ColumnsCircleIcon } from './icons/general-compressed/columns-circle.svg';
import { ReactComponent as ControlBarIcon } from './icons/general-compressed/control-bar.svg';
import { ReactComponent as CrossSmallIcon } from './icons/general-compressed/cross-small.svg';
import { ReactComponent as DiscIcon } from './icons/general-compressed/disc.svg';
import { ReactComponent as DownloadIcon } from './icons/general-compressed/download.svg';
import { ReactComponent as EllipsisCircleIcon } from './icons/general-compressed/ellipsis-circle.svg';
// import { ReactComponent as ExpandIcon } from './icons/general-compressed/expand.svg';
import { ReactComponent as ExpandSplitIcon } from './icons/general-compressed/expand-split.svg';
import { ReactComponent as ExternalLinkIcon } from './icons/general-compressed/external-link.svg';
import { ReactComponent as EyeIcon } from './icons/general-compressed/eye.svg';
import { ReactComponent as FastForwardIcon } from './icons/general-compressed/fast-forward.svg';
import { ReactComponent as FeaturebaseIcon } from './icons/general-compressed/feature-base.svg';
import { ReactComponent as FolderIcon } from './icons/general-compressed/folder.svg';
import { ReactComponent as GithubIcon } from './icons/general-compressed/github.svg';
import { ReactComponent as GridIcon } from './icons/general-compressed/grid-small.svg';
import { ReactComponent as HeartIcon } from './icons/general-compressed/heart.svg';
import { ReactComponent as InfoIcon } from './icons/general-compressed/info.svg';
import { ReactComponent as LastFMIcon } from './icons/general-compressed/lastfm.svg';
import { ReactComponent as ListIcon } from './icons/general-compressed/list-small.svg';
import { ReactComponent as LogoutIcon } from './icons/general-compressed/logout.svg';
import { ReactComponent as MailIcon } from './icons/general-compressed/mail.svg';
// import { ReactComponent as MailPlaneIcon } from './icons/general-compressed/mail-plane.svg';
import { ReactComponent as MegaphoneIcon } from './icons/general-compressed/megaphone.svg';
import { ReactComponent as MicrophoneIcon } from './icons/general-compressed/microphone.svg';
import { ReactComponent as MusicNoteDoubleIcon } from './icons/general-compressed/music-note-double.svg';
import { ReactComponent as MusicNoteSingleIcon } from './icons/general-compressed/music-note-single.svg';
import { ReactComponent as NextIcon } from './icons/general-compressed/next.svg';
import { ReactComponent as PaintPaletteIcon } from './icons/general-compressed/paint-palette.svg';
// import { ReactComponent as PauseCircleIcon } from './icons/general-compressed/pause-circle.svg';
import { ReactComponent as PauseFilledIcon } from './icons/general-compressed/pause-filled.svg';
import { ReactComponent as PauseIcon } from './icons/general-compressed/pause.svg';
import { ReactComponent as PencilIcon } from './icons/general-compressed/pencil.svg';
import { ReactComponent as PeopleIcon } from './icons/general-compressed/people.svg';
import { ReactComponent as PersonSquareIcon } from './icons/general-compressed/person-square.svg';
import { ReactComponent as PlayCircleIcon } from './icons/general-compressed/play-circle.svg';
import { ReactComponent as PlayFilledIcon } from './icons/general-compressed/play-filled.svg';
import { ReactComponent as PlayIcon } from './icons/general-compressed/play.svg';
import { ReactComponent as PlaylistIcon } from './icons/general-compressed/playlist.svg';
import { ReactComponent as PreviousIcon } from './icons/general-compressed/previous.svg';
import { ReactComponent as QueueIcon } from './icons/general-compressed/queue.svg';
import { ReactComponent as RedditIcon } from './icons/general-compressed/reddit.svg';
import { ReactComponent as RepeatAllIcon } from './icons/general-compressed/repeat-all.svg';
import { ReactComponent as RepeatOnceIcon } from './icons/general-compressed/repeat-once.svg';
import { ReactComponent as RewindIcon } from './icons/general-compressed/rewind.svg';
import { ReactComponent as SearchIcon } from './icons/general-compressed/search.svg';
import { ReactComponent as ServerIcon } from './icons/general-compressed/server.svg';
import { ReactComponent as ShuffleIcon } from './icons/general-compressed/shuffle.svg';
import { ReactComponent as SideBarIcon } from './icons/general-compressed/sidebar.svg';
import { ReactComponent as SkipBackIcon } from './icons/general-compressed/skip-back.svg';
import { ReactComponent as SkipForwardIcon } from './icons/general-compressed/skip-forward.svg';
import { ReactComponent as StarEmptyIcon } from './icons/general-compressed/star-empty.svg';
import { ReactComponent as StarFullIcon } from './icons/general-compressed/star-full.svg';
import { ReactComponent as StarHalfIcon } from './icons/general-compressed/star-half.svg';
import { ReactComponent as VanishedCircleIcon } from './icons/general-compressed/vanished-circle.svg';
// import { ReactComponent as VolDownIcon } from './icons/general-compressed/vol-down.svg';
import { ReactComponent as VolHighIcon } from './icons/general-compressed/vol-high.svg';
import { ReactComponent as VolLowIcon } from './icons/general-compressed/vol-low.svg';
// import { ReactComponent as VolMuteIcon } from './icons/general-compressed/vol-mute.svg';
// import { ReactComponent as VolOffIcon } from './icons/general-compressed/vol-off.svg';
// import { ReactComponent as VolUpIcon } from './icons/general-compressed/vol-up.svg';
import { ReactComponent as VolXIcon } from './icons/general-compressed/vol-x.svg';

// Site Custom Icons
import { ReactComponent as AppleSiteIcon } from './icons/site-compressed/apple.svg';
import { ReactComponent as FeaturebaseSiteIcon } from './icons/site-compressed/featurebase.svg';
import { ReactComponent as GithubSiteIcon } from './icons/site-compressed/github.svg';
import { ReactComponent as JellyfinSiteIcon } from './icons/site-original/jellyfin.svg';
import { ReactComponent as LinuxSiteIcon } from './icons/site-compressed/linux.svg';
import { ReactComponent as PlexSiteIcon } from './icons/site-compressed/plex.svg';
import { ReactComponent as RedditSiteIcon } from './icons/site-original/reddit.svg';
import { ReactComponent as WindowsSiteIcon } from './icons/site-compressed/windows.svg';

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
