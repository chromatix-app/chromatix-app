// ======================================================================
// IMPORTS
// ======================================================================

import React from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';

import { Icon, StarRating } from 'js/components';
import { durationToStringShort } from 'js/utils';

import style from './ListSet.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ListSet = ({ variant, albumId, playlistId, entries }) => {
  const dispatch = useDispatch();

  const playingVariant = useSelector(({ appModel }) => appModel.playingVariant);
  const playingAlbumId = useSelector(({ appModel }) => appModel.playingAlbumId);
  const playingPlaylistId = useSelector(({ appModel }) => appModel.playingPlaylistId);
  const playingTrackList = useSelector(({ appModel }) => appModel.playingTrackList);
  const playingTrackIndex = useSelector(({ appModel }) => appModel.playingTrackIndex);

  const trackDetail = playingTrackList?.[playingTrackIndex];

  const currentServer = useSelector(({ sessionModel }) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);

  const currentServerId = currentServer?.serverId;
  const currentLibraryId = currentLibrary?.libraryId;

  const totalDiscs =
    variant === 'album'
      ? entries.reduce((acc, entry) => {
          return Math.max(acc, entry.discNumber);
        }, 0)
      : 1;

  let currentDisc = 0;

  if (entries) {
    return (
      <div className={clsx(style.wrap, style['wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1)])}>
        {entries.map((entry, index) => {
          const trackNumber = variant === 'playlist' ? index + 1 : entry.trackNumber;

          const showDisc = totalDiscs > 1 && currentDisc !== entry.discNumber;
          currentDisc = entry.discNumber;

          const isCurrentlyPlaying =
            playingVariant === variant &&
            playingAlbumId === albumId &&
            playingPlaylistId === playlistId &&
            trackDetail.trackId === entry.trackId;

          return (
            <React.Fragment key={index}>
              {showDisc && (
                <div className={style.disc}>
                  <div className={style.discIcon}>
                    <Icon icon="DiscIcon" cover stroke />
                  </div>
                  <div className={style.discNumber}>Disc {entry.discNumber}</div>
                </div>
              )}

              <div
                className={style.entry}
                onDoubleClick={() => {
                  dispatch.appModel.playerLoadList({
                    playingVariant: variant,
                    playingServerId: currentServerId,
                    playingLibraryId: currentLibraryId,
                    playingAlbumId: albumId,
                    playingPlaylistId: playlistId,
                    playingTrackList: entries,
                    playingTrackCount: entries.length,
                    playingTrackIndex: index,
                  });
                }}
              >
                {isCurrentlyPlaying && (
                  <div className={style.playingIcon}>
                    <Icon icon="VolHighIcon" cover stroke />
                  </div>
                )}
                {!isCurrentlyPlaying && <div className={style.trackNumber}>{trackNumber}</div>}
                {variant === 'playlist' && entry.thumb && (
                  <div className={style.thumb}>
                    <img src={entry.thumb} alt={entry.title} />
                  </div>
                )}
                <div className={style.title}>{entry.title}</div>
                <div className={style.artist}>{entry.artist}</div>
                {variant === 'playlist' && <div className={style.album}>{entry.album}</div>}
                <div className={style.userRating}>{entry.userRating && <StarRating rating={entry.userRating} />}</div>
                <div className={style.duration}>{durationToStringShort(entry.duration)}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  }
};

// ======================================================================
// EXPORT
// ======================================================================

export default ListSet;
