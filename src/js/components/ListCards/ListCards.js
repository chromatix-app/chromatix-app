// ======================================================================
// IMPORTS
// ======================================================================

import React, { useCallback } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import moment from 'moment';
import clsx from 'clsx';

import { Icon, StarRating } from 'js/components';
// import { durationToStringLong } from 'js/utils';

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
      <div className={clsx(style.wrap)}>
        {entries.map((entry, index) => {
          const isCurrentlyLoaded =
            playingVariant === variant &&
            (playingAlbumId === entry.albumId || (!playingAlbumId && !entry.albumId)) &&
            (playingPlaylistId === entry.playlistId || (!playingPlaylistId && !entry.playlistId));

          const entryKey =
            // prioritise track id
            entry.trackId ||
            entry.folderId ||
            entry.collectionId ||
            entry.genreId ||
            entry.moodId ||
            entry.playlistId ||
            entry.styleId ||
            // lastly, use album / artist, as these may be present in multiple variants
            entry.albumId ||
            entry.artistId ||
            // fallback to index
            index;

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
    variant,
    thumb,
    title,
    albumId,
    artist,
    artistId,
    artistLink,
    collectionId,
    playlistId,
    trackId,
    userRating,
    link,
    // duration,
    // totalTracks,
    // addedAt,
    // lastPlayed,
    // releaseDate,
    isCurrentlyLoaded,
    isCurrentlyPlaying,
  }) => {
    const history = useHistory();
    const dispatch = useDispatch();

    const { optionShowFullTitles, optionShowStarRatings } = useSelector(({ sessionModel }) => sessionModel);

    // Open card link on click
    const handleCardClick = useCallback(
      (event) => {
        if (link) {
          history.push(link);
        }
      },
      [link, history]
    );

    // Open card link on enter key
    const handleKeyDown = useCallback(
      (event) => {
        if (event.key === 'Enter') {
          handleCardClick(event);
        }
      },
      [handleCardClick]
    );

    // Allow nested links without triggering parent link
    const handleLinkClick = useCallback((event) => {
      event.stopPropagation();
    }, []);

    // Play button handler
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

    // Pause button handler
    const handlePause = useCallback(
      (event) => {
        event.stopPropagation();
        dispatch.playerModel.playerPause();
      },
      [dispatch]
    );

    // Ratings
    const ratingKeyMap = {
      albums: albumId,
      artists: artistId,
      playlists: playlistId,
      collections: collectionId,
    };
    const ratingKey = ratingKeyMap[variant] || null;

    // Icons
    const iconImageMap = {
      folders: 'FolderIcon',
      artistGenres: 'ArtistGenresIcon',
      artistMoods: 'ArtistMoodsIcon',
      artistStyles: 'ArtistStylesIcon',
      albumGenres: 'AlbumGenresIcon',
      albumMoods: 'AlbumMoodsIcon',
      albumStyles: 'AlbumStylesIcon',
    };
    const iconImage = (!thumb && iconImageMap[variant]) || null;
    const isIconCard = iconImage && !thumb;
    const isSquareCard = !isIconCard || variant === 'folders';

    // const albumRelease = releaseDate ? moment(releaseDate).format('YYYY') : null;

    return (
      <div
        className={clsx(style.card, { [style.cardCurrent]: isCurrentlyLoaded, [style.cardLink]: link })}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Thumbnail */}
        <div className={clsx(style.thumb, { [style.thumbSquare]: isSquareCard, [style.thumbWithIcon]: isIconCard })}>
          {/* Artwork */}
          {thumb && <img src={thumb} alt={title} loading="lazy" />}

          {/* Icon */}
          {iconImage && (
            <div className={style.icon}>
              <Icon icon={iconImage} cover stroke strokeWidth={1.6} />
            </div>
          )}

          {/* Play / Pause Button */}
          {(variant === 'albums' || variant === 'playlists' || (variant === 'folders' && trackId)) && (
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

        {/* Text */}
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

          {/* {totalTracks && <div className={style.subtitle}>{totalTracks + ' tracks'}</div>} */}

          {/* {duration && <div className={style.subtitle}>{durationToStringLong(duration)}</div>} */}

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
