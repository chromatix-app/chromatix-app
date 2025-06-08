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

import style from './ListCardsV2.module.scss';

// ======================================================================
// OPTIONS
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

const virtualThreshold = !isLocal ? 150 : 1;

// ======================================================================
// COMPONENT
// ======================================================================

const ListCardsV2 = ({ children, variant, folderId, entries, playingOrder, sortKey, showRatings = false }) => {
  const playerPlaying = useSelector(({ playerModel }) => playerModel.playerPlaying);

  const playingVariant = useSelector(({ sessionModel }) => sessionModel.playingVariant);
  const playingAlbumId = useSelector(({ sessionModel }) => sessionModel.playingAlbumId);
  const playingPlaylistId = useSelector(({ sessionModel }) => sessionModel.playingPlaylistId);
  const playingFolderId = useSelector(({ sessionModel }) => sessionModel.playingFolderId);

  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);

  const trackDetail = playingTrackList?.[playingTrackKeys[playingTrackIndex]];

  const iconImage = lookupIcons[variant];

  const isCurrentlyLoaded = useCallback(
    (entryVariant, entryId) => {
      return (
        playingVariant === entryVariant &&
        ((playingVariant === 'albums' && playingAlbumId === entryId) ||
          (playingVariant === 'playlists' && playingPlaylistId === entryId) ||
          (playingVariant === 'folders' && playingFolderId === folderId && trackDetail.trackId === entryId))
      );
    },
    [folderId, playingAlbumId, playingFolderId, playingPlaylistId, playingVariant, trackDetail]
  );

  if (entries) {
    const ListBodyComponent = entries.length <= virtualThreshold ? ListBodyStatic : ListBodyVirtual;

    return (
      <div className={clsx(style.wrap)}>
        <ListBodyComponent
          entries={entries}
          folderId={folderId}
          iconImage={iconImage}
          isCurrentlyLoaded={isCurrentlyLoaded}
          playerPlaying={playerPlaying}
          playingOrder={playingOrder}
          sortKey={sortKey}
          showRatings={showRatings}
          titleBlock={children}
          variant={variant}
        />
      </div>
    );
  }
};

// ======================================================================
// LIST BODY - STATIC
// ======================================================================

const ListBodyStatic = ({
  entries,
  folderId,
  iconImage,
  isCurrentlyLoaded,
  playerPlaying,
  playingOrder,
  sortKey,
  showRatings,
  titleBlock,
  variant,
}) => {
  useScrollToTrack();

  let trackNumber = 0;

  return (
    <div id="scrollable" className={clsx(style.scrollableOuter, style.scrollableOuterStatic)}>
      <div id="scrollable-inner" className={style.scrollableInner}>
        {titleBlock}

        {entries.map((entry, index) => {
          if (entry.kind === 'track') {
            trackNumber++;
          }

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
              showRatings={showRatings}
              isCurrentlyLoaded={isCurrentlyLoaded(variant, entryKey)}
              isCurrentlyPlaying={playerPlaying}
              {...entry}
            />
          );
        })}
      </div>
    </div>
  );
};

// ======================================================================
// LIST BODY - VIRTUAL
// ======================================================================

const ListBodyVirtual = ({}) => {};

// ======================================================================
// ENTRY
// ======================================================================

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
    showRatings,

    isCurrentlyLoaded,
    isCurrentlyPlaying,
  }) => {
    const history = useHistory();
    const dispatch = useDispatch();

    const optionShowFullTitles_Deprecated = useSelector(
      ({ sessionModel }) => sessionModel.optionShowFullTitles_Deprecated
    );

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
      (_event) => {
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
    const isIconCard = iconImage && !thumb && !trackId;
    const isSquareCard = !isIconCard || variant === 'folders';

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
          {thumb && <img src={thumb} alt={title} draggable="false" loading="lazy" />}

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

        {/* Body */}
        <div className={style.body}>
          {title && <div className={clsx(style.title, { 'text-trim': !optionShowFullTitles_Deprecated })}>{title}</div>}

          {artist && !artistLink && (
            <div className={clsx(style.subtitle, { 'text-trim': !optionShowFullTitles_Deprecated })}>{artist}</div>
          )}

          {artist && artistLink && (
            <NavLink
              className={clsx(style.subtitle, { 'text-trim': !optionShowFullTitles_Deprecated })}
              to={artistLink}
              onClick={handleLinkClick}
              tabIndex={-1}
              draggable="false"
            >
              {artist}
            </NavLink>
          )}

          {showRatings && typeof userRating !== 'undefined' && userRating > 0 && (
            <div className={style.rating}>
              <StarRating variant="card" type={variant} ratingKey={ratingKey} rating={userRating} />
            </div>
          )}
        </div>
      </div>
    );
  }
);

// ======================================================================
// HELPERS
// ======================================================================

const lookupIcons = {
  folders: 'FolderIcon',
  artistGenres: 'ArtistGenresIcon',
  artistMoods: 'ArtistMoodsIcon',
  artistStyles: 'ArtistStylesIcon',
  albumGenres: 'AlbumGenresIcon',
  albumMoods: 'AlbumMoodsIcon',
  albumStyles: 'AlbumStylesIcon',
};

// ======================================================================
// EXPORT
// ======================================================================

export default ListCardsV2;
