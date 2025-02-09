// ======================================================================
// IMPORTS
// ======================================================================

import React, { useCallback } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import moment from 'moment';
import clsx from 'clsx';

import { Icon, StarRating } from 'js/components';
import { useScrollToTrack } from 'js/hooks';
// import { durationToStringLong } from 'js/utils';

import style from './ListCards.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

// const isLocal = process.env.REACT_APP_ENV === 'local';

const iconImageMap = {
  folders: 'FolderIcon',
  artistGenres: 'ArtistGenresIcon',
  artistMoods: 'ArtistMoodsIcon',
  artistStyles: 'ArtistStylesIcon',
  albumGenres: 'AlbumGenresIcon',
  albumMoods: 'AlbumMoodsIcon',
  albumStyles: 'AlbumStylesIcon',
};

const ListCards = ({ variant, folderId, entries, playingOrder, sortKey }) => {
  const playerPlaying = useSelector(({ playerModel }) => playerModel.playerPlaying);

  const playingVariant = useSelector(({ sessionModel }) => sessionModel.playingVariant);
  const playingAlbumId = useSelector(({ sessionModel }) => sessionModel.playingAlbumId);
  const playingPlaylistId = useSelector(({ sessionModel }) => sessionModel.playingPlaylistId);
  const playingFolderId = useSelector(({ sessionModel }) => sessionModel.playingFolderId);

  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);

  const trackDetail = playingTrackList?.[playingTrackKeys[playingTrackIndex]];

  const iconImage = iconImageMap[variant];

  useScrollToTrack();

  let trackNumber = 0;

  if (entries) {
    return (
      <div className={clsx(style.wrap)}>
        {entries.map((entry, index) => {
          if (entry.kind === 'track') {
            trackNumber++;
          }

          const isCurrentlyLoaded =
            playingVariant === variant &&
            (((playingAlbumId === entry.albumId || (!playingAlbumId && !entry.albumId)) &&
              (playingPlaylistId === entry.playlistId || (!playingPlaylistId && !entry.playlistId))) ||
              (playingFolderId === folderId && trackDetail.trackId === entry.trackId));

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
              key={variant + '-' + entryKey}
              index={trackNumber - 1}
              variant={variant}
              iconImage={iconImage}
              folderId={folderId}
              playingOrder={playingOrder}
              sortKey={sortKey}
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
    index,
    variant,
    thumb,
    title,
    albumId,
    artist,
    artistId,
    artistLink,
    collectionId,
    folderId,
    iconImage,
    playlistId,
    trackId,
    userRating,
    link,

    playingOrder,
    sortKey,

    isCurrentlyLoaded,
    isCurrentlyPlaying,

    // duration,
    // totalTracks,
    // addedAt,
    // lastPlayed,
    // releaseDate,
  }) => {
    const history = useHistory();
    const dispatch = useDispatch();

    const optionShowFullTitles = useSelector(({ sessionModel }) => sessionModel.optionShowFullTitles);
    const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

    // Play button handler
    const handlePlay = useCallback(
      (event) => {
        event.stopPropagation();
        if (isCurrentlyLoaded) {
          dispatch.playerModel.playerResume();
        } else {
          if (variant === 'albums') {
            dispatch.playerModel.playerLoadAlbum({ albumId });
          } else if (variant === 'playlists') {
            dispatch.playerModel.playerLoadPlaylist({ playlistId });
          } else if (variant === 'folders') {
            // console.log(1111, index, folderId, playingOrder, sortKey);
            dispatch.playerModel.playerLoadTrackItem({
              playingVariant: 'folders',
              playingFolderId: folderId,
              playingOrder: sortKey ? playingOrder : null,
              playingTrackIndex: sortKey ? playingOrder[index] : index,
            });
          }
        }
      },
      [variant, index, albumId, folderId, playlistId, playingOrder, sortKey, isCurrentlyLoaded, dispatch]
    );

    // Handle card click
    const handleCardClick = useCallback(
      (event) => {
        if (link) {
          history.push(link);
        }
      },
      [link, history]
    );

    // Handle card double click
    const handleCardDoubleClick = useCallback(
      (event) => {
        if (variant === 'folders' && trackId) {
          handlePlay(event);
        }
      },
      [variant, trackId, handlePlay]
    );

    // Handle enter key when card is focused
    const handleKeyDown = useCallback(
      (event) => {
        if (event.key === 'Enter') {
          if (variant === 'folders' && trackId) {
            handlePlay(event);
          } else {
            handleCardClick(event);
          }
        }
      },
      [variant, trackId, handlePlay, handleCardClick]
    );

    // Allow nested links without triggering parent link
    const handleLinkClick = useCallback((event) => {
      event.stopPropagation();
    }, []);

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
    const isIconCard = iconImage && !thumb;
    const isSquareCard = !isIconCard || variant === 'folders';

    // const albumRelease = releaseDate ? moment(releaseDate).format('YYYY') : null;

    return (
      <div
        id={variant === 'folders' && trackId ? trackId : null}
        className={clsx(style.card, { [style.cardCurrent]: isCurrentlyLoaded, [style.cardLink]: link })}
        onClick={handleCardClick}
        onDoubleClick={handleCardDoubleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Thumbnail */}
        <div className={clsx(style.thumb, { [style.thumbSquare]: isSquareCard, [style.thumbWithIcon]: isIconCard })}>
          {/* Artwork */}
          {thumb && <img src={thumb} alt={title} loading="lazy" />}

          {/* Icon */}
          {isIconCard && (
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
