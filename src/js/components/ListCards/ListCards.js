// ======================================================================
// IMPORTS
// ======================================================================

import React, { useCallback } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import moment from 'moment';
import clsx from 'clsx';

import { Icon, StarRating } from 'js/components';
import { durationToStringLong } from 'js/utils';

import style from './ListCards.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

// const isLocal = process.env.REACT_APP_ENV === 'local';

const ListCards = ({ entries, variant }) => {
  const playingVariant = useSelector(({ sessionModel }) => sessionModel.playingVariant);
  const playingAlbumId = useSelector(({ sessionModel }) => sessionModel.playingAlbumId);
  const playingPlaylistId = useSelector(({ sessionModel }) => sessionModel.playingPlaylistId);
  const playerPlaying = useSelector(({ playerModel }) => playerModel.playerPlaying);

  if (entries) {
    return (
      <div className={clsx(style.wrap, style['wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1)])}>
        {entries.map((entry, index) => {
          const isCurrentlyLoaded =
            playingVariant === variant &&
            (playingAlbumId === entry.albumId || (!playingAlbumId && !entry.albumId)) &&
            (playingPlaylistId === entry.playlistId || (!playingPlaylistId && !entry.playlistId));

          const entryKey = entry.albumId || entry.artistId || entry.playlistId || entry.collectionId || index;

          return (
            <ListEntry
              key={entryKey}
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
    artistId,
    artistLink,
    collectionId,
    playlistId,
    duration,
    userRating,
    link,
    totalTracks,
    variant,
    // addedAt,
    // lastPlayed,
    // releaseDate,
    isCurrentlyLoaded,
    isCurrentlyPlaying,
  }) => {
    const history = useHistory();
    const dispatch = useDispatch();

    const ratingKey =
      variant === 'albums'
        ? albumId
        : variant === 'artists'
        ? artistId
        : variant === 'playlists'
        ? playlistId
        : variant === 'collections'
        ? collectionId
        : null;

    const { optionShowFullTitles, optionShowStarRatings } = useSelector(({ sessionModel }) => sessionModel);

    const handleCardClick = useCallback(
      (event) => {
        if (link) {
          history.push(link);
        }
      },
      [link, history]
    );

    const handleKeyDown = useCallback(
      (event) => {
        if (event.key === 'Enter') {
          handleCardClick(event);
        }
      },
      [handleCardClick]
    );

    const handleLinkClick = useCallback((event) => {
      event.stopPropagation();
    }, []);

    const handlePlay = useCallback(
      (event) => {
        event.stopPropagation();
        if (isCurrentlyLoaded) {
          dispatch.playerModel.playerPlay();
        } else {
          if (variant === 'albums') {
            dispatch.playerModel.playerLoadAlbum({ albumId });
          } else if (variant === 'playlists') {
            dispatch.playerModel.playerLoadPlaylist({ playlistId });
          }
        }
      },
      [variant, albumId, playlistId, isCurrentlyLoaded, dispatch]
    );

    const handlePause = useCallback(
      (event) => {
        event.stopPropagation();
        dispatch.playerModel.playerPause();
      },
      [dispatch]
    );

    // const albumRelease = releaseDate ? moment(releaseDate).format('YYYY') : null;

    return (
      <div
        className={clsx(style.card, { [style.cardCurrent]: isCurrentlyLoaded })}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className={style.thumb}>
          {thumb && <img src={thumb} alt={title} loading="lazy" />}

          {variant === 'artistGenres' && (
            <div className={style.icon}>
              <Icon icon="ArtistGenresIcon" cover stroke strokeWidth={1.6} />
            </div>
          )}

          {variant === 'artistMoods' && (
            <div className={style.icon}>
              <Icon icon="ArtistMoodsIcon" cover stroke strokeWidth={1.6} />
            </div>
          )}

          {variant === 'artistStyles' && (
            <div className={style.icon}>
              <Icon icon="ArtistStylesIcon" cover stroke strokeWidth={1.6} />
            </div>
          )}

          {variant === 'albumGenres' && (
            <div className={style.icon}>
              <Icon icon="AlbumGenresIcon" cover stroke strokeWidth={1.6} />
            </div>
          )}

          {variant === 'albumMoods' && (
            <div className={style.icon}>
              <Icon icon="AlbumMoodsIcon" cover stroke strokeWidth={1.6} />
            </div>
          )}

          {variant === 'albumStyles' && (
            <div className={style.icon}>
              <Icon icon="AlbumStylesIcon" cover stroke strokeWidth={1.6} />
            </div>
          )}

          {(variant === 'albums' || variant === 'playlists') && (
            <div className={style.controlButtonWrap}>
              {isCurrentlyLoaded && isCurrentlyPlaying && (
                <button className={style.pauseButton} onClick={handlePause} tabIndex={-1}>
                  <Icon icon="PauseFilledIcon" cover />
                </button>
              )}
              {!(isCurrentlyLoaded && isCurrentlyPlaying) && (
                <button className={style.playButton} onClick={handlePlay} tabIndex={-1}>
                  <Icon icon="PlayFilledIcon" cover />
                </button>
              )}
            </div>
          )}
        </div>

        <div className={style.body}>
          {title && <div className={clsx(style.title, { 'text-trim': !optionShowFullTitles })}>{title}</div>}

          {artist && !artistLink && (
            <div className={clsx(style.subtitle, { 'text-trim': !optionShowFullTitles })}>{artist}</div>
          )}

          {artist && artistLink && (
            <NavLink
              className={clsx(style.subtitle, { 'text-trim': !optionShowFullTitles })}
              to={artistLink}
              onClick={handleLinkClick}
              tabIndex={-1}
            >
              {artist}
            </NavLink>
          )}

          {totalTracks && <div className={style.subtitle}>{totalTracks + ' tracks'}</div>}

          {duration && <div className={style.subtitle}>{durationToStringLong(duration)}</div>}

          {/* {albumRelease && <div className={style.subtitle}>{albumRelease}</div>} */}

          {/* {isLocal && (
            <div className={style.subtitle}>{releaseDate ? moment(releaseDate).format('YY-MM-DD') : '-'}</div>
          )} */}

          {/* {isLocal && <div className={style.subtitle}>{addedAt ? moment(addedAt * 1000).format('YY-MM-DD') : '-'}</div>} */}

          {/* {isLocal && (
            <div className={style.subtitle}>{lastPlayed ? moment(lastPlayed * 1000).format('YY-MM-DD') : '-'}</div>
          )} */}

          {optionShowStarRatings && typeof userRating !== 'undefined' && (
            <div className={style.rating}>
              <StarRating type={variant} ratingKey={ratingKey} rating={userRating} />
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
