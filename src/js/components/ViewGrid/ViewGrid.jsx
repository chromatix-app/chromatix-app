// ======================================================================
// IMPORTS
// ======================================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';

import {
  ContextMenuAlbums,
  ContextMenuArtists,
  ContextMenuCollections,
  ContextMenuPlaylists,
  ContextMenuTracks,
  Favourite,
  Icon,
  StarRating,
} from 'js/components';
import { useScrollToTrack, useScrollToVirtualTrack, useWindowSize } from 'js/hooks';
import { durationToStringMed, formatReleaseYear } from 'js/utils';
import platformFeatures from 'js/_config/platformFeatures';

import style from './ViewGrid.module.scss';

// ======================================================================
// OPTIONS
// ======================================================================

const isLocal = import.meta.env.VITE_ENV === 'local';

const virtualThreshold = !isLocal ? 200 : 20;

// ======================================================================
// COMPONENT
// ======================================================================

const ViewGrid = ({
  children,
  variant,
  groupBy,
  collectionId,
  folderId,
  entries,
  playingOrder,
  sortKey,
  showArtist = false,
  showDuration = false,
  showFavs = false,
  showRatings = false,
  showReleaseDate = false,
  showTotalItems = false,
  showTotalTracks = false,
}) => {
  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};
  if (!platformOpts.enableIsFavourite && showFavs) {
    showFavs = false;
  }
  if (!platformOpts.enableUserRating && showRatings) {
    showRatings = false;
  }

  const playerPlaying = useSelector(({ playerModel }) => playerModel.playerPlaying);

  const playingVariant = useSelector(({ sessionModel }) => sessionModel.playingVariant);
  const playingArtistId = useSelector(({ sessionModel }) => sessionModel.playingArtistId);
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
      entryVariant = lookupType[entryVariant] || entryVariant;
      return (
        playingVariant === entryVariant &&
        ((entryVariant === 'artists' && playingArtistId === entryId) ||
          (entryVariant === 'albums' && playingAlbumId === entryId) ||
          (entryVariant === 'playlists' && playingPlaylistId === entryId) ||
          (entryVariant === 'folders' && playingFolderId === folderId && trackDetail.trackId === entryId))
      );
    },
    [folderId, playingArtistId, playingAlbumId, playingFolderId, playingPlaylistId, playingVariant, trackDetail]
  );

  if (entries) {
    const ListBodyComponent = entries.length <= virtualThreshold || groupBy ? ListBodyStatic : ListBodyVirtual;

    let trackNumber = 0;
    const entriesWithTrackNumbers = entries.map((entry, index) => {
      if (entry.kind === 'track') {
        trackNumber++;
      }
      return {
        ...entry,
        trackNumber: trackNumber - 1, // Adjust to zero-based index
      };
    });

    return (
      <div className={clsx(style.wrap)}>
        <ListBodyComponent
          entries={entriesWithTrackNumbers}
          collectionId={collectionId}
          folderId={folderId}
          groupBy={groupBy}
          iconImage={iconImage}
          isCurrentlyLoaded={isCurrentlyLoaded}
          playerPlaying={playerPlaying}
          playingOrder={playingOrder}
          sortKey={sortKey}
          showArtist={showArtist}
          showDuration={showDuration}
          showFavs={showFavs}
          showRatings={showRatings}
          showReleaseDate={showReleaseDate}
          showTotalItems={showTotalItems}
          showTotalTracks={showTotalTracks}
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
  collectionId,
  folderId,
  groupBy,
  iconImage,
  isCurrentlyLoaded,
  playerPlaying,
  playingOrder,
  sortKey,
  showArtist,
  showDuration,
  showFavs,
  showRatings,
  showReleaseDate,
  showTotalItems,
  showTotalTracks,
  titleBlock,
  variant,
}) => {
  useScrollToTrack();

  // If items are grouped, we need to add a group row before each group
  const entriesWithGroups = !groupBy
    ? entries
    : entries.reduce((acc, entry) => {
        if (entry[groupBy] && acc[acc.length - 1]?.[groupBy] !== entry[groupBy]) {
          acc.push({ kind: 'group', groupName: entry[groupBy] });
        }
        acc.push(entry);
        return acc;
      }, []);

  return (
    <div id="scrollable" className={clsx(style.scrollableOuter, style.scrollableOuterStatic)}>
      <div id="scrollable-inner" className={style.scrollableInner}>
        {titleBlock}

        {entriesWithGroups.map((entry, index) => {
          const entryKey = getEntryKey(entry, index);

          if (entry.kind === 'group') {
            return <GroupRow key={index} entry={entry} />;
          } else {
            return (
              <ListEntry
                key={variant + '-' + entryKey}
                variant={variant}
                collectionId={collectionId}
                iconImage={iconImage}
                folderId={folderId}
                playingOrder={playingOrder}
                sortKey={sortKey}
                showArtist={showArtist}
                showDuration={showDuration}
                showFavs={showFavs}
                showRatings={showRatings}
                showReleaseDate={showReleaseDate}
                showTotalItems={showTotalItems}
                showTotalTracks={showTotalTracks}
                isCurrentlyLoaded={isCurrentlyLoaded(variant, entryKey)}
                isCurrentlyPlaying={playerPlaying}
                {...entry}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

// ======================================================================
// LIST BODY - VIRTUAL
// ======================================================================

// Config
const tableHeadHeight = 204;
// const groupHeightFirst = 45;
// const groupHeightGeneral = 94;
const fixedElementCount = 1; // 1 for the header

// State
let innerRef;

const ListBodyVirtual = ({
  entries,
  collectionId,
  folderId,
  iconImage,
  isCurrentlyLoaded,
  playerPlaying,
  playingOrder,
  showArtist,
  showDuration,
  showFavs,
  showRatings,
  showReleaseDate,
  showTotalItems,
  showTotalTracks,
  sortKey,
  titleBlock,
  variant,
}) => {
  // Element refs
  innerRef = useRef(null);
  const outerRef = useRef(null);

  const contentWidth = useSelector(({ appModel }) => appModel.contentWidth);
  const contentBreakpoint = useSelector(({ appModel }) => appModel.contentBreakpoint);

  const initialDimensions = useMemo(
    () => {
      const innerWidth = contentWidth >= 800 ? contentWidth - 60 : contentWidth - 40;
      return calculateDimensions(
        variant,
        iconImage,
        showArtist,
        showDuration,
        showRatings,
        showReleaseDate,
        showTotalItems,
        showTotalTracks,
        contentWidth,
        innerWidth,
        contentBreakpoint
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [numColumns, setNumColumns] = useState(initialDimensions.columnCount);
  const [rowHeight, setRowHeight] = useState(initialDimensions.columnHeight);
  const [toggleColumnHeight, setToggleColumnHeight] = useState(false);
  const { windowHeight, windowWidth } = useWindowSize();
  const queueIsVisible = useSelector(({ sessionModel }) => sessionModel.queueIsVisible);

  const totalItems = entries.length;

  // Calculate columns based on container width
  useEffect(() => {
    if (innerRef.current) {
      const outerWidth = outerRef.current.clientWidth;
      const innerWidth = innerRef.current.clientWidth;
      const dimensions = calculateDimensions(
        variant,
        iconImage,
        showArtist,
        showDuration,
        showRatings,
        showReleaseDate,
        showTotalItems,
        showTotalTracks,
        outerWidth,
        innerWidth,
        contentBreakpoint
      );
      const columnCount = dimensions.columnCount;
      const columnHeight = dimensions.columnHeight;

      if (columnCount !== numColumns) {
        setNumColumns(columnCount);
      }
      if (columnHeight !== rowHeight) {
        setRowHeight(columnHeight);
        setToggleColumnHeight((prev) => !prev);
      }
    }
  }, [
    variant,
    iconImage,
    showArtist,
    showDuration,
    showRatings,
    showReleaseDate,
    showTotalItems,
    showTotalTracks,
    numColumns,
    rowHeight,
    queueIsVisible,
    windowWidth,
    contentBreakpoint,
  ]);

  // Calculate number of rows needed given total items and columns
  const numRows = numColumns ? Math.ceil(totalItems / numColumns) : 0;

  // Hacky workaround to force a re-render if certain props change
  const extraRows = toggleColumnHeight ? 1 : 0;

  // Helper to determine row heights
  const estimateSize = useCallback(
    (index) => {
      const totalExpectedRows = numRows + fixedElementCount;
      const currentRow = index + 1;

      // const currentEntry = entries[index - fixedElementCount];
      // const isGroupRowFirst = currentEntry?.kind === 'group' && index - fixedElementCount === 0;
      // const isGroupRowGeneral = currentEntry?.kind === 'group' && !isGroupRowFirst;

      const isExtraRow = index > fixedElementCount - 1 && currentRow > totalExpectedRows;

      if (index === 0) {
        return tableHeadHeight;
        // } else if (isGroupRowFirst) {
        //   return groupHeightFirst;
        // } else if (isGroupRowGeneral) {
        //   return groupHeightGeneral;
      } else if (isExtraRow) {
        return 0;
      } else {
        return rowHeight;
      }
    },
    [numRows, rowHeight]
  );

  // Setup the virtualizer
  const rowVirtualizer = useVirtualizer({
    count: numRows + fixedElementCount + extraRows,
    getScrollElement: () => outerRef.current,
    overscan: 2,
    estimateSize,
    measureElement,
  });

  // Scroll to a specific track, when required
  const scrollToVirtualTrack = useCallback(
    (index) => {
      const rowIndex = Math.floor(index / numColumns) + 0.5;
      const scrollOffset = tableHeadHeight + rowIndex * rowHeight - (windowHeight - 100) / 2;
      rowVirtualizer.scrollToOffset(scrollOffset, {
        align: 'start',
        behavior: 'auto',
      });

      // Note: using "scrollToIndex" would be better, but it is broken - it prevents me from scrolling the page.
      // It seems to clash with the use of "ref={rowVirtualizer.measureElement}" for some reason.

      // rowVirtualizer.scrollToIndex(index, {
      //   align: 'center',
      //   behavior: 'auto',
      // });
    },
    [rowVirtualizer, windowHeight, numColumns, rowHeight]
  );
  useScrollToVirtualTrack(entries, scrollToVirtualTrack);

  return (
    <div ref={outerRef} id="scrollable" className={clsx(style.scrollableOuter, style.scrollableOuterVirtual)}>
      <div
        ref={innerRef}
        id="scrollable-inner"
        className={clsx(style.scrollableInner, style.scrollableInnerVirtual)}
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualEntry, index) => {
          if (index === 0) {
            // Note - adding contentBreakpoint to the key is a hacky workaround to force a re-render if content breakpoint changes
            return (
              <React.Fragment key={'title-' + contentBreakpoint}>
                {titleBlock}
                <div
                  key={'title-' + contentBreakpoint}
                  id="measure"
                  className={style.measure}
                  data-index={index}
                  ref={rowVirtualizer.measureElement}
                ></div>
              </React.Fragment>
            );
          } else if (numColumns > 0 && rowHeight > 0) {
            const items = [];

            const rowIndex = virtualEntry.index - fixedElementCount;
            const startIndex = rowIndex * numColumns;
            const endIndex = Math.min(startIndex + numColumns, totalItems);

            for (let i = startIndex; i < endIndex; i++) {
              const entry = entries[i];

              // Determine the entry key
              const entryKey = getEntryKey(entry, virtualEntry.index);

              // Catch missing entries
              if (!entry) {
                return null;
              }

              items.push(
                <ListEntry
                  key={variant + '-' + entryKey}
                  variant={variant}
                  collectionId={collectionId}
                  iconImage={iconImage}
                  folderId={folderId}
                  playingOrder={playingOrder}
                  sortKey={sortKey}
                  showArtist={showArtist}
                  showDuration={showDuration}
                  showFavs={showFavs}
                  showRatings={showRatings}
                  showReleaseDate={showReleaseDate}
                  showTotalItems={showTotalItems}
                  showTotalTracks={showTotalTracks}
                  isCurrentlyLoaded={isCurrentlyLoaded(variant, entryKey)}
                  isCurrentlyPlaying={playerPlaying}
                  {...entry}
                />
              );
            }

            return (
              <VirtualRow key={virtualEntry.index} virtualEntry={virtualEntry} numColumns={numColumns}>
                {items}
              </VirtualRow>
            );
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
};

// Helper to determine the header height
const measureElement = (element) => {
  const innerTop = innerRef.current.getBoundingClientRect().top;
  const elementTop = element.getBoundingClientRect().top;
  return Math.round(elementTop - innerTop);
};

// Helper to determine the number of columns based on container width
// Note: This function must match the grid layout defined in the CSS.
const calculateDimensions = (
  variant,
  iconImage,
  showArtist,
  showDuration,
  showRatings,
  showReleaseDate,
  showTotalItems,
  showTotalTracks,
  outerWidth,
  innerWidth,
  contentBreakpoint
) => {
  let minColumnWidth = 140;
  if (outerWidth >= 860) {
    minColumnWidth = 180;
  } else if (outerWidth >= 620) {
    minColumnWidth = 160;
  }
  const colGap = contentBreakpoint >= 540 ? 10 : 0;
  const rowGap = contentBreakpoint >= 540 ? 20 : 10;

  // This is how auto-fill with minmax() calculates columns:
  // Find how many minimum-width columns (plus gaps) fit
  const columnCount = Math.floor((innerWidth + colGap) / (minColumnWidth + colGap));

  // In CSS grid, the remaining space is evenly distributed (1fr)
  // Calculate the actual column width after distribution
  const usableWidth = innerWidth - colGap * (columnCount - 1);
  const columnWidth = Math.floor(usableWidth / columnCount);

  // Calculate column height, based on variant
  const isSquareCard = !iconImage || variant === 'folders';
  const imageHeight = isSquareCard ? columnWidth : (columnWidth - 20) * 0.6 + 20;
  const titleHeight = 28.8;
  const subtitleLineHeight = 15.4;
  const subtitleLines =
    variant === 'folders'
      ? showArtist
        ? 1
        : 0
      : ['albums', 'artistAlbums'].includes(variant)
        ? (showArtist ? 1 : 0) + (showReleaseDate ? 1 : 0)
        : variant === 'playlists'
          ? (showTotalTracks ? 1 : 0) + (showDuration ? 1 : 0)
          : variant === 'collections'
            ? showTotalItems
              ? 1
              : 0
            : 0;
  const subtitleHeight = subtitleLines * subtitleLineHeight;
  const ratingHeight =
    showRatings && ['albums', 'artistAlbums', 'artists', 'playlists', 'collections'].includes(variant) ? 19 : 0;
  const columnHeight = Math.ceil(imageHeight + titleHeight + subtitleHeight + ratingHeight + rowGap);

  return {
    columnCount: Math.max(1, columnCount),
    columnHeight: columnHeight,
  };
};

// ======================================================================
// VIRTUAL ROW
// ======================================================================

const VirtualRow = ({ children, numColumns, virtualEntry }) => {
  return (
    <div
      className={style.virtualRow}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: `translateY(${virtualEntry.start}px)`,
        gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  );
};

// ======================================================================
// GROUP ROW
// ======================================================================

const GroupRow = ({ entry }) => {
  return <div className={style.groupRow}>{entry.groupName}</div>;
};

// ======================================================================
// ENTRY
// ======================================================================

const ListEntry = React.memo(
  ({
    variant,
    trackNumber,
    thumbSm,
    title,
    albumId,
    albumLink,
    artist,
    artistId,
    artistLink,
    collectionId,
    folderId,
    iconImage,
    playlistId,
    playlistItemID,
    trackId,
    type,
    releaseDate,
    totalTracks,
    duration,
    totalItems,
    isFavourite,
    userRating,
    link,

    playingOrder,
    sortKey,
    showArtist,
    showDuration,
    showFavs,
    showRatings,
    showReleaseDate,
    showTotalItems,
    showTotalTracks,

    isCurrentlyLoaded,
    isCurrentlyPlaying,
  }) => {
    const history = useHistory();
    const dispatch = useDispatch();

    // Play button handler
    const handlePlay = useCallback(
      (event) => {
        event.stopPropagation();
        if (isCurrentlyLoaded) {
          dispatch.playerModel.playerResume();
        } else {
          if (variant === 'artists') {
            dispatch.playerModel.playerLoadArtist({ artistId, artistName: artist });
          } else if (variant === 'albums' || variant === 'artistAlbums') {
            dispatch.playerModel.playerLoadAlbum({ albumId });
          } else if (variant === 'playlists') {
            dispatch.playerModel.playerLoadPlaylist({ playlistId });
          } else if (variant === 'folders') {
            // console.log(1111, trackNumber, folderId, playingOrder, sortKey);
            dispatch.playerModel.playerLoadTrackItem({
              playingVariant: 'folders',
              playingFolderId: folderId,
              playingOrder: sortKey ? playingOrder : null,
              playingTrackIndex: sortKey ? playingOrder[trackNumber] : trackNumber,
            });
          }
        }
      },
      [
        variant,
        trackNumber,
        artistId,
        artist,
        albumId,
        folderId,
        playlistId,
        playingOrder,
        sortKey,
        isCurrentlyLoaded,
        dispatch,
      ]
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
      artistAlbums: albumId,
      artists: artistId,
      playlists: playlistId,
      collections: collectionId,
    };
    const ratingKey = ratingKeyMap[variant] || null;

    // Icons
    const isIconCard = iconImage && !thumbSm && !trackId;
    const isSquareCard = !isIconCard || variant === 'folders';

    // Context menu is only applicable to artist, album, playlist, collection, and track cards
    const isArtist = variant === 'artists';
    const isAlbum = variant === 'albums' || variant === 'artistAlbums';
    const isPlaylist = variant === 'playlists';
    const isCollection = variant === 'collections';
    const isTrack = variant === 'folders' && !!trackId;

    const card = (
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
          {thumbSm && <img src={thumbSm} alt={title} draggable="false" loading="lazy" />}

          {/* Icon */}
          {isIconCard && (
            <div className={style.icon}>
              <Icon icon={iconImage} cover stroke strokeWidth={1.6} />
            </div>
          )}

          {/* Play / Pause Button */}
          {(variant === 'artists' ||
            variant === 'albums' ||
            variant === 'artistAlbums' ||
            variant === 'playlists' ||
            (variant === 'folders' && trackId)) && (
            <div className={style.controlButtonWrap}>
              {isCurrentlyLoaded && isCurrentlyPlaying && (
                <button type="button" className={style.pauseButton} onClick={handlePause} tabIndex={-1}>
                  <Icon icon="PauseFilledIcon" cover />
                </button>
              )}
              {!(isCurrentlyLoaded && isCurrentlyPlaying) && (
                <button type="button" className={style.playButton} onClick={handlePlay} tabIndex={-1}>
                  <Icon icon="PlayFilledIcon" cover />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className={style.body}>
          {title && (
            <div className={clsx(style.title, 'text-trim')}>
              {showFavs && isFavourite && (
                <span className={style.favourite}>
                  <Favourite
                    variant="grid"
                    type={lookupType[variant] || variant}
                    itemId={ratingKey}
                    isFavourite={true}
                    editable
                  />
                </span>
              )}
              {title}
            </div>
          )}

          {showArtist && artist && !artistLink && <div className={clsx(style.subtitle, 'text-trim')}>{artist}</div>}

          {showArtist && artist && artistLink && (
            <NavLink
              className={clsx(style.subtitle, 'text-trim')}
              to={artistLink}
              onClick={handleLinkClick}
              tabIndex={-1}
              draggable="false"
            >
              {artist}
            </NavLink>
          )}

          {showReleaseDate && releaseDate && (
            <div className={clsx(style.subtitle, 'text-trim')}>{formatReleaseYear(releaseDate)}</div>
          )}

          {showTotalTracks && (totalTracks || totalTracks === 0) && (
            <div className={clsx(style.subtitle, 'text-trim')}>
              {totalTracks} track{totalTracks !== 1 ? 's' : ''}
            </div>
          )}

          {showDuration && <div className={clsx(style.subtitle, 'text-trim')}>{durationToStringMed(duration)}</div>}

          {showTotalItems && (totalItems || totalItems === 0) && (
            <div className={clsx(style.subtitle, 'text-trim')}>
              {totalItems} {type === 'artist' ? 'Artist' : 'Album'}
              {totalItems !== 1 ? 's' : ''}
            </div>
          )}

          {showRatings && (
            // typeof userRating !== 'undefined' && userRating > 0 && (
            <div className={style.rating}>
              <StarRating
                variant="card"
                type={lookupType[variant] || variant}
                ratingKey={ratingKey}
                rating={userRating}
                editable
              />
            </div>
          )}
        </div>
      </div>
    );

    if (isArtist) {
      return <ContextMenuArtists artist={{ artistId, title, collectionId, link }}>{card}</ContextMenuArtists>;
    }

    if (isAlbum) {
      return (
        <ContextMenuAlbums
          album={{ albumId, title, artistId, artistLink, collectionId, link }}
          showArtist={variant !== 'artistAlbums'}
        >
          {card}
        </ContextMenuAlbums>
      );
    }

    if (isPlaylist) {
      return <ContextMenuPlaylists playlist={{ playlistId, playlistTitle: title, link }}>{card}</ContextMenuPlaylists>;
    }

    if (isCollection) {
      return (
        <ContextMenuCollections collection={{ collectionId, collectionTitle: title, collectionType: type, link }}>
          {card}
        </ContextMenuCollections>
      );
    }

    if (isTrack) {
      return (
        <ContextMenuTracks
          track={{ trackId, title, artistLink, albumLink, playlistItemID }}
          playlistId={null}
          showArtist={true}
          showAlbum={true}
        >
          {card}
        </ContextMenuTracks>
      );
    }

    return card;
  }
);

// ======================================================================
// HELPERS
// ======================================================================

const getEntryKey = (entry, fallback) => {
  const entryKey =
    // prioritise track id
    entry.trackId ||
    entry.folderId ||
    entry.collectionId ||
    entry.genreId ||
    entry.moodId ||
    entry.playlistId ||
    entry.styleId ||
    entry.tagId ||
    // lastly, use album / artist (as these may be present in the above variants)
    entry.albumId ||
    entry.artistId ||
    // fallback
    fallback;
  return entryKey;
};

const lookupType = {
  artistAlbums: 'albums',
};

const lookupIcons = {
  folders: 'FolderIcon',
  artistGenres: 'ArtistGenresIcon',
  artistMoods: 'ArtistMoodsIcon',
  artistStyles: 'ArtistStylesIcon',
  artistTags: 'ArtistTagsIcon',
  albumGenres: 'AlbumGenresIcon',
  albumMoods: 'AlbumMoodsIcon',
  albumStyles: 'AlbumStylesIcon',
  albumTags: 'AlbumTagsIcon',
};

// ======================================================================
// EXPORT
// ======================================================================

export default ViewGrid;
