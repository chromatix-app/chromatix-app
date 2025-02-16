// ======================================================================
// IMPORTS
// ======================================================================

import React, { useCallback, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import moment from 'moment';

import { Icon, StarRating } from 'js/components';
import {
  // useScrollToTrack,
  useTableOptions,
} from 'js/hooks';
import { durationToStringMed, durationToStringShort, formatRecentDate } from 'js/utils';

import style from './ListTableV2.module.scss';

// ======================================================================
// OPTIONS
// ======================================================================

const virtualThreshold = 1;

// ======================================================================
// COMPONENT
// ======================================================================

const ListTableV2 = ({
  children,
  variant,
  albumId,
  playlistId,
  folderId,
  playingOrder,
  // discCount = 1,
  entries,
  sortString,
  sortKey = sortString ? sortString.split('-')[0] : null,
  orderKey = sortString ? sortString.split('-')[1] : null,
}) => {
  // useScrollToTrack();

  const dispatch = useDispatch();

  const playerPlaying = useSelector(({ playerModel }) => playerModel.playerPlaying);

  const playingVariant = useSelector(({ sessionModel }) => sessionModel.playingVariant);
  const playingAlbumId = useSelector(({ sessionModel }) => sessionModel.playingAlbumId);
  const playingPlaylistId = useSelector(({ sessionModel }) => sessionModel.playingPlaylistId);
  const playingFolderId = useSelector(({ sessionModel }) => sessionModel.playingFolderId);

  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);

  const playingTrackCurrent = playingTrackList?.[playingTrackKeys[playingTrackIndex]];

  const matchVariant = {
    albumTracks: 'albums',
    playlistTracks: 'playlists',
    folders: 'folders',
  };

  const { tableVariant, tableOptions, gridTemplateColumns, handleSortFunction } = useTableOptions(
    variant,
    albumId,
    playlistId,
    folderId,
    sortKey,
    orderKey
  );

  const playTrack = useCallback(
    (trackVariant, trackIndex, restart) => {
      if (restart) {
        // console.log(222, trackVariant, trackIndex, albumId, playlistId, folderId, playingOrder, sortKey);
        dispatch.playerModel.playerLoadTrackItem({
          playingVariant: matchVariant[trackVariant],
          playingAlbumId: albumId,
          playingPlaylistId: playlistId,
          playingFolderId: folderId,
          playingOrder: sortKey ? playingOrder : null,
          playingTrackIndex: sortKey ? playingOrder[trackIndex] : trackIndex,
        });
      } else {
        dispatch.playerModel.playerResume();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, albumId, playlistId, folderId, playingOrder, sortKey]
  );

  const pauseTrack = useCallback(() => {
    dispatch.playerModel.playerPause();
  }, [dispatch]);

  const isTrackLoaded = useCallback(
    (trackVariant, trackId) => {
      return (
        playingVariant === matchVariant[trackVariant] &&
        (playingAlbumId === albumId || (!playingAlbumId && !albumId)) &&
        (playingPlaylistId === playlistId || (!playingPlaylistId && !playlistId)) &&
        (playingFolderId === folderId || (!playingFolderId && !folderId)) &&
        playingTrackCurrent.trackId === trackId
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      albumId,
      playlistId,
      folderId,
      playingAlbumId,
      playingPlaylistId,
      playingFolderId,
      playingTrackCurrent,
      playingVariant,
    ]
  );

  const headerBlock = () => {
    return (
      <TableHeader
        tableVariant={tableVariant}
        tableOptions={tableOptions}
        gridTemplateColumns={gridTemplateColumns}
        handleSortFunction={handleSortFunction}
      />
    );
  };

  if (entries) {
    const TableBodyComponent = entries.length <= virtualThreshold ? TableBodyStatic : TableBodyVirtual;

    return (
      <div className={clsx(style.wrap, style['wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1)], {})}>
        <TableBodyComponent
          entries={entries}
          titleBlock={children}
          headerBlock={headerBlock()}
          tableVariant={tableVariant}
          tableOptions={tableOptions}
          gridTemplateColumns={gridTemplateColumns}
          // track related props
          {...((variant === 'folders' || variant === 'playlistTracks') && {
            playerPlaying,
            playTrack,
            pauseTrack,
            isTrackLoaded,
          })}
        />
      </div>
    );
  }
};

// ======================================================================
// TABLE HEADER
// ======================================================================

const TableHeader = ({ tableOptions, gridTemplateColumns, handleSortFunction }) => {
  return (
    <div className={style.header} style={{ gridTemplateColumns }}>
      {tableOptions
        .filter((columnOptions) => columnOptions.visible !== false && columnOptions.visibleInHeader !== false)
        .map((columnOptions, index) => (
          <SortableHeading key={index} handleSortFunction={handleSortFunction} {...columnOptions} />
        ))}
    </div>
  );
};

const SortableHeading = ({
  colKey,
  label,
  isDefault,
  isAsc,
  isDesc,
  headerStyle,
  headerClassName,
  handleSortFunction,
  showArrows = true,
}) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSortFunction(event);
    }
  };

  return (
    <div
      onClick={handleSortFunction}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      data-sort={colKey}
      style={headerStyle}
      className={clsx({ [style[headerClassName]]: headerClassName })}
    >
      <span>{label}</span>
      {showArrows && (
        <>
          {!isDefault && isAsc && (
            <span className={style.sortIcon}>
              <Icon icon="ArrowDownIcon" cover stroke />
            </span>
          )}
          {isDesc && (
            <span className={style.sortIcon}>
              <Icon icon="ArrowUpIcon" cover stroke />
            </span>
          )}
        </>
      )}
    </div>
  );
};

// ======================================================================
// TABLE BODY - STATIC
// ======================================================================

const TableBodyStatic = ({
  entries,
  titleBlock,
  headerBlock,
  tableVariant,
  tableOptions,
  gridTemplateColumns,
  // track related props
  playerPlaying,
  playTrack,
  pauseTrack,
  isTrackLoaded,
}) => {
  return (
    <div id="scrollable" className={style.scrollableOuter}>
      <div id="scrollable-list" className={style.scrollableInner}>
        {titleBlock}
        {headerBlock}
        {entries.map((virtualRow, index) => {
          const entry = entries[index];
          if (entry.kind === 'track') {
            return (
              <TrackRow
                key={index}
                index={index}
                entry={entry}
                // virtualRow={virtualRow}
                tableVariant={tableVariant}
                tableOptions={tableOptions}
                gridTemplateColumns={gridTemplateColumns}
                // track related props
                playerPlaying={playerPlaying}
                playTrack={playTrack}
                pauseTrack={pauseTrack}
                isTrackLoaded={isTrackLoaded}
              />
            );
          } else {
            return (
              <TableRow
                key={index}
                entry={entry}
                // virtualRow={virtualRow}
                tableVariant={tableVariant}
                tableOptions={tableOptions}
                gridTemplateColumns={gridTemplateColumns}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

// ======================================================================
// TABLE BODY - VIRTUAL
// ======================================================================

// Config
const tableHeadHeight = 250;
const rowHeight = 50;
const fixedElementCount = 1;

// State
let innerRef;

const TableBodyVirtual = ({
  entries,
  titleBlock,
  headerBlock,
  tableVariant,
  tableOptions,
  gridTemplateColumns,
  // track related props
  playerPlaying,
  playTrack,
  pauseTrack,
  isTrackLoaded,
}) => {
  const outerRef = useRef(null);
  innerRef = useRef(null);

  // Setup the virtualizer
  const rowVirtualizer = useVirtualizer({
    count: entries.length + fixedElementCount,
    getScrollElement: () => outerRef.current,
    estimateSize: getItemSize,
    overscan: 3,
    rangeExtractor,
    measureElement,
  });

  return (
    <div ref={outerRef} id="scrollable" className={style.scrollableOuter}>
      <div
        ref={innerRef}
        id="scrollable-list"
        className={style.scrollableInner}
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
          if (index === 0) {
            return (
              <React.Fragment key={index}>
                {titleBlock}
                {headerBlock}
                <div
                  id="measure"
                  className={style.measure}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                ></div>
              </React.Fragment>
            );
          } else {
            const entry = entries[virtualRow.index - fixedElementCount];
            if (entry.kind === 'track') {
              return (
                <TrackRow
                  key={index}
                  entry={entry}
                  virtualRow={virtualRow}
                  tableVariant={tableVariant}
                  tableOptions={tableOptions}
                  gridTemplateColumns={gridTemplateColumns}
                  // track related props
                  playerPlaying={playerPlaying}
                  playTrack={playTrack}
                  pauseTrack={pauseTrack}
                  isTrackLoaded={isTrackLoaded}
                />
              );
            } else {
              return (
                <TableRow
                  key={index}
                  entry={entry}
                  virtualRow={virtualRow}
                  tableVariant={tableVariant}
                  tableOptions={tableOptions}
                  gridTemplateColumns={gridTemplateColumns}
                />
              );
            }
          }
        })}
      </div>
    </div>
  );
};

// Helper to determine row heights
const getItemSize = (index) => (index === 0 ? tableHeadHeight : rowHeight);

// Helper to determine the visible range, including our sticky row
const rangeExtractor = (range) => {
  const start = Math.max(range.startIndex - range.overscan, 0);
  const end = Math.min(range.endIndex + range.overscan, range.count - 1);
  const indexes = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  if (!indexes.includes(0)) {
    indexes.unshift(0);
  }
  return indexes;
};

// Helper to determine the header height
const measureElement = (element) => {
  const innerTop = innerRef.current.getBoundingClientRect().top;
  const elementTop = element.getBoundingClientRect().top;
  return elementTop - innerTop;
};

// ======================================================================
// TABLE ROW
// ======================================================================

const TableRow = ({ virtualRow, entry, tableVariant, tableOptions, gridTemplateColumns }) => {
  const rowKey = entry.albumId || entry.artistId || entry.playlistId || entry.collectionId;

  return (
    <NavLink
      className={style.entry}
      to={entry.link}
      draggable="false"
      style={{
        ...(virtualRow && {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`,
        }),
        gridTemplateColumns,
      }}
    >
      {tableOptions
        .filter((columnOptions) => columnOptions.visible !== false)
        .map((columnOptions, index) => {
          const { ratingType, ratingKey } = userRatingOptions[tableVariant] || {};

          switch (columnOptions.colKey) {
            case 'sortOrder':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.trackNumberPermanent, style.colCenter)}>
                  <span>-</span>
                </div>
              );

            case 'thumb':
              if (columnOptions.icon) {
                return (
                  <div key={rowKey + '-' + index} className={clsx(style.thumb, style.thumbFolder)}>
                    <span className={style.thumbIcon}>
                      <Icon icon={columnOptions.icon} cover stroke strokeWidth={1.2} />
                    </span>
                  </div>
                );
              } else {
                return (
                  <div key={rowKey + '-' + index} className={style.thumb}>
                    {entry.thumb && <img src={entry.thumb} alt={entry.title} draggable="false" loading="lazy" />}
                  </div>
                );
              }

            case 'title':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.title, 'text-trim')}>
                  {entry.title}
                </div>
              );

            case 'artist':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.artist, 'text-trim')}>
                  {entry.artist}
                </div>
              );

            case 'kind':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.meta, 'text-trim')}>
                  {entry.kind.replace('aaa', '')}
                </div>
              );

            case 'genre':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.genre, 'text-trim')}>
                  {entry.genre}
                </div>
              );

            case 'totalTracks':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.totalTracks, 'text-trim')}>
                  {entry.totalTracks}
                  {(entry.totalTracks || entry.totalTracks === 0) && <> track{entry.totalTracks !== 1 ? 's' : ''}</>}
                </div>
              );

            case 'duration':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.duration, 'text-trim')}>
                  {durationToStringMed(entry.duration)}
                </div>
              );

            case 'releaseDate':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.releaseDate, 'text-trim')}>
                  {entry.releaseDate ? moment(entry.releaseDate).format('MMM YYYY') : null}
                </div>
              );

            case 'addedAt':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.addedAt, 'text-trim')}>
                  {formatRecentDate(entry.addedAt)}
                </div>
              );

            case 'lastPlayed':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.lastPlayed, 'text-trim')}>
                  {formatRecentDate(entry.lastPlayed)}
                </div>
              );

            case 'userRating':
              return (
                <div key={rowKey + '-' + index} className={style.userRating}>
                  <StarRating
                    type={ratingType}
                    ratingKey={entry[ratingKey]}
                    rating={entry.userRating}
                    inline
                    editable
                  />
                </div>
              );

            case 'empty':
              return <div key={rowKey + '-' + index} className={style.empty}></div>;

            default:
              return null;
          }
        })}
    </NavLink>
  );
};

// ======================================================================
// TRACK ROW
// ======================================================================

const TrackRow = ({
  virtualRow,
  index,
  entry,
  tableVariant,
  tableOptions,
  gridTemplateColumns,
  // track related props
  playTrack,
  playerPlaying,
  pauseTrack,
  isTrackLoaded,
}) => {
  const rowKey = entry.albumId || entry.artistId || entry.playlistId || entry.collectionId;

  const trackNumber = entry.sortedTrackNumber ? entry.sortedTrackNumber : virtualRow ? virtualRow.index : index + 1;
  const trackIndex = trackNumber - 1;
  const trackIsLoaded = isTrackLoaded(tableVariant, entry.trackId);

  return (
    <div
      id={entry.trackId}
      className={clsx(style.entry, {
        [style.entryPlaying]: trackIsLoaded,
      })}
      onDoubleClick={() => {
        playTrack(tableVariant, trackIndex, true);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          playTrack(tableVariant, trackIndex, true);
        }
      }}
      tabIndex={0}
      style={{
        ...(virtualRow && {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`,
        }),
        gridTemplateColumns,
      }}
    >
      {tableOptions
        .filter((columnOptions) => columnOptions.visible !== false)
        .map((columnOptions, index) => {
          const { ratingType, ratingKey } = userRatingOptions[tableVariant] || {};

          switch (columnOptions.colKey) {
            case 'sortOrder':
              return (
                <React.Fragment key={rowKey + '-' + index}>
                  {!trackIsLoaded && (
                    <div className={clsx(style.trackNumber, style.colCenter)}>
                      <span>{trackNumber}</span>
                      {/* <span>{entry.trackSortOrder}</span> */}
                    </div>
                  )}

                  {trackIsLoaded && playerPlaying && (
                    <div className={style.playingIcon}>
                      <Icon icon="VolHighIcon" cover stroke />
                    </div>
                  )}

                  {trackIsLoaded && !playerPlaying && (
                    <div className={style.playingPausedIcon}>
                      <Icon icon="PauseIcon" cover stroke />
                    </div>
                    // <div className={style.playingIcon}>
                    //   <Icon icon="VolOffIcon" cover stroke />
                    // </div>
                  )}

                  {!(trackIsLoaded && playerPlaying) && (
                    <div
                      className={style.playIcon}
                      onClick={() => {
                        playTrack(tableVariant, trackIndex, !trackIsLoaded);
                      }}
                    >
                      <Icon icon="PlayFilledIcon" cover />
                    </div>
                  )}
                  {trackIsLoaded && playerPlaying && (
                    <div className={style.pauseIcon} onClick={pauseTrack}>
                      <Icon icon="PauseFilledIcon" cover />
                    </div>
                  )}
                </React.Fragment>
              );

            case 'thumb':
              return (
                <div key={rowKey + '-' + index} className={style.thumb}>
                  {entry.thumb && <img src={entry.thumb} alt={entry.title} draggable="false" loading="lazy" />}
                </div>
              );

            case 'title':
              if (tableVariant === 'folders') {
                return (
                  <div key={rowKey + '-' + index} className={'text-trim'}>
                    <div className={clsx(style.title, 'text-trim')}>{entry.title}</div>
                    <div className={clsx(style.artist, style.smallText, 'text-trim')}>
                      {entry.artistLink && (
                        <NavLink to={entry.artistLink} tabIndex={-1} draggable="false">
                          {entry.artist}
                        </NavLink>
                      )}
                      {!entry.artistLink && entry.artist}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={rowKey + '-' + index} className={clsx(style.title, 'text-trim')}>
                    {entry.title}
                  </div>
                );
              }

            case 'artist':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.artist, 'text-trim')}>
                  {entry.artistLink && (
                    <NavLink to={entry.artistLink} tabIndex={-1} draggable="false">
                      {entry.artist}
                    </NavLink>
                  )}
                  {!entry.artistLink && entry.artist}
                </div>
              );

            case 'album':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.album, 'text-trim')}>
                  {entry.albumLink && (
                    <NavLink to={entry.albumLink} tabIndex={-1} draggable="false">
                      {entry.album}{' '}
                    </NavLink>
                  )}
                  {!entry.albumLink && entry.album}
                </div>
              );

            case 'kind':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.meta, 'text-trim')}>
                  {entry.kind.replace('aaa', '')}
                </div>
              );

            case 'duration':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.duration, 'text-trim')}>
                  {durationToStringShort(entry.duration)}
                </div>
              );

            case 'userRating':
              return (
                <div key={rowKey + '-' + index} className={style.userRating}>
                  <StarRating
                    type={ratingType}
                    ratingKey={entry[ratingKey]}
                    rating={entry.userRating}
                    inline
                    editable
                  />
                </div>
              );

            case 'empty':
              return <div key={rowKey + '-' + index} className={style.empty}></div>;

            default:
              return null;
          }
        })}
    </div>
  );
};

// ======================================================================
// HELPERS
// ======================================================================

const userRatingOptions = {
  albums: {
    ratingType: 'album',
    ratingKey: 'albumId',
  },
  artists: {
    ratingType: 'artist',
    ratingKey: 'artistId',
  },
  playlists: {
    ratingType: 'playlist',
    ratingKey: 'playlistId',
  },
  collections: {
    ratingType: 'collection',
    ratingKey: 'collectionId',
  },
};

// ======================================================================
// EXPORT
// ======================================================================

export default ListTableV2;
