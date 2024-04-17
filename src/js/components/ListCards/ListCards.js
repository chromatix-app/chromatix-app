// ======================================================================
// IMPORTS
// ======================================================================

import React, { useCallback } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';

import { Icon, StarRating } from 'js/components';
import { durationToStringLong } from 'js/utils';

import style from './ListCards.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ListCards = ({ entries, variant }) => {
  const playingVariant = useSelector(({ sessionModel }) => sessionModel.playingVariant);
  const playingAlbumId = useSelector(({ sessionModel }) => sessionModel.playingAlbumId);
  const playingPlaylistId = useSelector(({ sessionModel }) => sessionModel.playingPlaylistId);
  const playerPlaying = useSelector(({ appModel }) => appModel.playerPlaying);

  if (entries) {
    return (
      <div className={clsx(style.wrap, style['wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1)])}>
        {entries.map((entry, index) => {
          const isCurrentlyLoaded =
            playingVariant === variant &&
            (playingAlbumId === entry.albumId || (!playingAlbumId && !entry.albumId)) &&
            (playingPlaylistId === entry.playlistId || (!playingPlaylistId && !entry.playlistId));

          return (
            <ListEntry
              key={index}
              variant={variant}
              isCurrentlyLoaded={isCurrentlyLoaded}
              isCurrentlyPlaying={playerPlaying}
              {...entry}
            />
          );
        })}
      </div>
    );
  }
};

const ListEntry = React.memo(
  ({
    thumb,
    title,
    albumId,
    artist,
    artistLink,
    playlistId,
    duration,
    userRating,
    link,
    totalTracks,
    variant,
    isCurrentlyLoaded,
    isCurrentlyPlaying,
  }) => {
    const history = useHistory();
    const dispatch = useDispatch();

    const { optionGridEllipsis, optionGridRatings } = useSelector(({ sessionModel }) => sessionModel);

    const handleCardClick = useCallback(
      (event) => {
        if (link) {
          history.push(link);
        }
      },
      [link, history]
    );

    const handleLinkClick = useCallback((event) => {
      event.stopPropagation();
    }, []);

    const handlePlay = useCallback(
      (event) => {
        event.stopPropagation();
        if (isCurrentlyLoaded) {
          dispatch.appModel.playerPlay();
        } else {
          if (variant === 'albums') {
            dispatch.appModel.playerLoadAlbum({ albumId });
          } else if (variant === 'playlists') {
            dispatch.appModel.playerLoadPlaylist({ playlistId });
          }
        }
      },
      [variant, albumId, playlistId, isCurrentlyLoaded, dispatch]
    );

    const handlePause = useCallback(
      (event) => {
        event.stopPropagation();
        dispatch.appModel.playerPause();
      },
      [dispatch]
    );

    // const albumRelease = releaseDate ? moment(releaseDate).format('YYYY') : null;

    return (
      <div className={clsx(style.card, { [style.cardCurrent]: isCurrentlyLoaded })} onClick={handleCardClick}>
        <div className={style.thumb}>
          {thumb && <img src={thumb} alt={title} loading="lazy" />}

          {(variant === 'genres' || variant === 'styles' || variant === 'moods') && (
            <div className={style.icon}>
              <Icon icon="MusicNoteIcon" cover stroke strokeWidth={2} />
            </div>
          )}

          {(variant === 'albums' || variant === 'playlists') && (
            <div className={style.controlButtonWrap}>
              {isCurrentlyLoaded && isCurrentlyPlaying && (
                <button className={style.pauseButton} onClick={handlePause}>
                  <Icon icon="PauseFilledIcon" cover />
                </button>
              )}
              {!(isCurrentlyLoaded && isCurrentlyPlaying) && (
                <button className={style.playButton} onClick={handlePlay}>
                  <Icon icon="PlayFilledIcon" cover />
                </button>
              )}
            </div>
          )}
        </div>

        <div className={style.body}>
          {title && <div className={clsx(style.title, { 'text-trim': optionGridEllipsis })}>{title}</div>}

          {artist && !artistLink && (
            <div className={clsx(style.subtitle, { 'text-trim': optionGridEllipsis })}>{artist}</div>
          )}

          {artist && artistLink && (
            <NavLink
              className={clsx(style.subtitle, { 'text-trim': optionGridEllipsis })}
              to={artistLink}
              onClick={handleLinkClick}
            >
              {artist}
            </NavLink>
          )}

          {totalTracks && <div className={style.subtitle}>{totalTracks + ' tracks'}</div>}

          {duration && <div className={style.subtitle}>{durationToStringLong(duration)}</div>}

          {/* {albumRelease && <div className={style.subtitle}>{albumRelease}</div>} */}

          {optionGridRatings && userRating && (
            <div className={style.rating}>
              <StarRating rating={userRating} />
            </div>
          )}
        </div>
      </div>
    );
  }
);

// ======================================================================
// EXPORT
// ======================================================================

export default ListCards;
