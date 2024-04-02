// ======================================================================
// IMPORTS
// ======================================================================

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { Icon, StarRating } from 'js/components';
import { durationToStringShort } from 'js/utils';

import style from './ListTracks.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ListTracks = ({ variant, albumId, playlistId, entries }) => {
  const dispatch = useDispatch();

  const playerPlaying = useSelector(({ appModel }) => appModel.playerPlaying);
  const scrollToPlaying = useSelector(({ appModel }) => appModel.scrollToPlaying);

  const playingVariant = useSelector(({ sessionModel }) => sessionModel.playingVariant);
  const playingAlbumId = useSelector(({ sessionModel }) => sessionModel.playingAlbumId);
  const playingPlaylistId = useSelector(({ sessionModel }) => sessionModel.playingPlaylistId);
  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);

  const trackDetail = playingTrackList?.[playingTrackIndex];

  const currentServer = useSelector(({ sessionModel }) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);

  const currentServerId = currentServer?.serverId;
  const currentLibraryId = currentLibrary?.libraryId;

  const totalDiscs = useMemo(() => {
    if (variant === 'album') {
      return entries.reduce((acc, entry) => {
        return Math.max(acc, entry.discNumber);
      }, 0);
    }
    return 1;
  }, [variant, entries]);

  // scroll to playing track, if required
  useEffect(() => {
    if (scrollToPlaying) {
      const playingElement = document.getElementById(trackDetail?.trackId);
      if (playingElement) {
        playingElement.scrollIntoView({ block: 'center' });
      }
      dispatch.appModel.setAppState({ scrollToPlaying: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToPlaying]);

  let currentDisc = 0;

  if (entries) {
    return (
      <div className={clsx(style.wrap, style['wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1)])}>
        {variant === 'album' && (
          <div className={style.header}>
            <div>
              <span className={style.minCenter}>#</span>
            </div>
            <div>Title</div>
            <div>Artist</div>
            <div className={style.headerRating}>Rating</div>
            <div>Duration</div>
          </div>
        )}

        {variant === 'playlist' && (
          <div className={style.header}>
            <div>
              <span className={style.minCenter}>#</span>
            </div>
            <div>Title</div>
            <div></div>
            <div>Artist</div>
            <div>Album</div>
            <div className={style.headerRating}></div>
            <div>Duration</div>
          </div>
        )}

        <div className={style.entries}>
          {entries.map((entry, index) => {
            const trackNumber = variant === 'playlist' ? index + 1 : entry.trackNumber;

            const showDisc = totalDiscs > 1 && currentDisc !== entry.discNumber;
            currentDisc = entry.discNumber;

            const isCurrentlyPlaying =
              playingVariant === variant &&
              (playingAlbumId === albumId || (!playingAlbumId && !albumId)) &&
              (playingPlaylistId === playlistId || (!playingPlaylistId && !playlistId)) &&
              trackDetail.trackId === entry.trackId;

            const doPlay = (restart) => {
              if (restart) {
                dispatch.appModel.playerLoadList({
                  playingVariant: variant,
                  playingServerId: currentServerId,
                  playingLibraryId: currentLibraryId,
                  playingAlbumId: albumId,
                  playingPlaylistId: playlistId,
                  playingTrackList: entries,
                  playingTrackCount: entries.length,
                  playingTrackIndex: index,
                  playingTrackProgress: 0,
                });
              } else {
                dispatch.appModel.playerPlay();
              }
            };

            return (
              <ListEntry
                key={index}
                entry={entry}
                trackNumber={trackNumber}
                showDisc={showDisc}
                isCurrentlyPlaying={isCurrentlyPlaying}
                playerPlaying={playerPlaying}
                doPlay={doPlay}
                variant={variant}
              />
            );
          })}
        </div>
      </div>
    );
  }
};

const ListEntry = React.memo(({ entry, trackNumber, showDisc, isCurrentlyPlaying, playerPlaying, doPlay, variant }) => {
  const dispatch = useDispatch();

  return (
    <>
      {showDisc && (
        <div className={style.disc}>
          <div className={style.discIcon}>
            <Icon icon="DiscIcon" cover stroke />
          </div>
          <div className={style.discNumber}>Disc {entry.discNumber}</div>
        </div>
      )}

      <div
        id={entry.trackId}
        className={clsx(style.entry, {
          [style.entryPlaying]: isCurrentlyPlaying,
        })}
        onDoubleClick={() => {
          doPlay(true);
        }}
      >
        {!isCurrentlyPlaying && (
          <div className={style.trackNumber}>
            <span className={style.minCenter}>{trackNumber}</span>
          </div>
        )}

        {isCurrentlyPlaying && (
          <div className={style.playingIcon}>
            <Icon icon="VolHighIcon" cover stroke />
          </div>
        )}

        {!(isCurrentlyPlaying && playerPlaying) && (
          <div
            className={style.playIcon}
            onClick={() => {
              doPlay(!isCurrentlyPlaying);
            }}
          >
            <Icon icon="PlayFilledIcon" cover />
          </div>
        )}
        {isCurrentlyPlaying && playerPlaying && (
          <div className={style.pauseIcon} onClick={dispatch.appModel.playerPause}>
            <Icon icon="PauseFilledIcon" cover />
          </div>
        )}

        {variant === 'playlist' && entry.thumb && (
          <div className={style.thumb}>
            <img src={entry.thumb} alt={entry.title} />
          </div>
        )}
        <div className={style.title}>{entry.title}</div>
        <div className={style.artist}>
          <NavLink to={entry.artistLink}>{entry.artist}</NavLink>
        </div>
        {variant === 'playlist' && (
          <div className={style.album}>
            <NavLink to={entry.albumLink}>{entry.album} </NavLink>
          </div>
        )}
        <div className={style.userRating}>{entry.userRating && <StarRating rating={entry.userRating} />}</div>
        <div className={style.duration}>{durationToStringShort(entry.duration)}</div>
      </div>
    </>
  );
});

// ======================================================================
// EXPORT
// ======================================================================

export default ListTracks;
