// ======================================================================
// IMPORTS
// ======================================================================

import React, { useCallback, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import moment from 'moment';

import { Favourite, Icon, StarRating } from 'js/components';
import { useScrollToTrack, useScrollToVirtualTrack, useTableOptions, useWindowSize } from 'js/hooks';
import { durationToStringMed, durationToStringShort, formatRecentDate } from 'js/utils';

import style from './ViewList.module.scss';

// ======================================================================
// OPTIONS
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

const virtualThreshold = !isLocal ? 200 : 1;

// ======================================================================
// COMPONENT
// ======================================================================

const ViewList = ({ variant, ...props }) => {
  if (
    variant === 'artistTracks' ||
    variant === 'albumTracks' ||
    variant === 'playlistTracks' ||
    variant === 'folders'
  ) {
    return <ViewListTracks variant={variant} {...props} />;
  } else {
    return <ViewListBasic variant={variant} {...props} />;
  }
};

const ViewListBasic = ({
  children,
  variant,
  groupBy,
  artistId,
  albumId,
  playlistId,
  folderId,
  entries,
  sortString,
  sortKey = sortString ? sortString.split('-')[0] : null,
  orderKey = sortString ? sortString.split('-')[1] : null,
  colOptions,
}) => {
  const { tableVariant, tableOptions, gridTemplateColumns, handleSortFunction } = useTableOptions(
    variant,
    artistId,
    albumId,
    playlistId,
    folderId,
    sortKey,
    orderKey,
    colOptions
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

    const TableBodyComponent = entries.length <= virtualThreshold ? TableBodyStatic : TableBodyVirtual;

    return (
      <div className={clsx(style.wrap, style['wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1)], {})}>
        <TableBodyComponent
          entries={entriesWithGroups}
          titleBlock={children}
          headerBlock={headerBlock()}
          tableVariant={tableVariant}
          tableOptions={tableOptions}
          gridTemplateColumns={gridTemplateColumns}
        />
      </div>
    );
  }
};

const ViewListTracks = ({
  children,
  variant,
  artistId,
  artistName,
  albumId,
  playlistId,
  folderId,
  entries,
  sortString,
  sortKey = sortString ? sortString.split('-')[0] : null,
  orderKey = sortString ? sortString.split('-')[1] : null,
  colOptions,
  // disc and track related props
  discCount = 1,
  playingOrder,
}) => {
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

  const { tableVariant, tableOptions, gridTemplateColumns, handleSortFunction } = useTableOptions(
    variant,
    artistId,
    albumId,
    playlistId,
    folderId,
    sortKey,
    orderKey,
    colOptions
  );

  const noArtworkVisible = tableVariant === 'albumTracks' || colOptions?.artwork === false;

  const playTrack = useCallback(
    (trackVariant, trackIndex, restart) => {
      if (restart) {
        // console.log(222, trackVariant, trackIndex, albumId, playlistId, folderId, playingOrder, sortKey);
        dispatch.playerModel.playerLoadTrackItem({
          playingVariant: lookupVariantFields[trackVariant].playVariant,
          playingArtistId: artistId,
          playingArtistName: artistName,
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
        playingVariant === lookupVariantFields[trackVariant].playVariant &&
        (playingAlbumId === albumId || (!playingAlbumId && !albumId)) &&
        (playingPlaylistId === playlistId || (!playingPlaylistId && !playlistId)) &&
        (playingFolderId === folderId || (!playingFolderId && !folderId)) &&
        playingTrackCurrent.trackId === trackId
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      albumId,
      folderId,
      playingAlbumId,
      playingFolderId,
      playingPlaylistId,
      playingTrackCurrent,
      playingVariant,
      playlistId,
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

    // Determine whether to show disc numbers
    const isSorted = sortKey && !sortKey.startsWith('sortOrder');
    const showDiscNumbers = !isSorted && discCount > 1;

    // If disc numbers are shown, add them into our entries array
    let currentDisc = 0;
    let discIndex = 0;
    const entriesWithDiscs = !showDiscNumbers
      ? entries
      : entries.reduce((acc, entry) => {
          if (entry.kind === 'track') {
            if (discCount > 1 && currentDisc !== entry.discNumber) {
              discIndex += 1;
              currentDisc = entry.discNumber;
              acc.push({ kind: 'disc', discNumber: entry.discNumber });
            }
          }
          entry.discIndex = discIndex;
          acc.push(entry);
          return acc;
        }, []);

    return (
      <div
        className={clsx(style.wrap, style['wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1)], {
          [style.wrapNoArtwork]: noArtworkVisible,
        })}
      >
        <TableBodyComponent
          entries={entriesWithDiscs}
          titleBlock={children}
          headerBlock={headerBlock()}
          tableVariant={tableVariant}
          tableOptions={tableOptions}
          gridTemplateColumns={gridTemplateColumns}
          noArtworkVisible={noArtworkVisible}
          // disc related props
          discCount={discCount}
          showDiscNumbers={showDiscNumbers}
          orderKey={orderKey}
          // track related props
          playerPlaying={playerPlaying}
          playTrack={playTrack}
          pauseTrack={pauseTrack}
          isTrackLoaded={isTrackLoaded}
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
      className={clsx(style[colKey], { [style[headerClassName]]: headerClassName })}
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
  // disc related props
  showDiscNumbers,
  // track related props
  playerPlaying,
  playTrack,
  pauseTrack,
  isTrackLoaded,
}) => {
  useScrollToTrack();

  return (
    <div id="scrollable" className={clsx(style.scrollableOuter, style.scrollableOuterStatic)}>
      <div id="scrollable-inner" className={style.scrollableInner}>
        {titleBlock}

        {headerBlock}

        {entries.map((entry, index) => {
          // Catch missing entries
          if (!entry) {
            return null;
          }

          // Groups
          else if (entry.kind === 'group') {
            return <GroupRow key={index} entry={entry} />;
          }

          // Disc numbers
          else if (entry.kind === 'disc') {
            return <DiscRow key={index} entry={entry} />;
          }

          // Tracks
          else if (entry.kind === 'track') {
            return (
              <TrackRow
                key={index + '-' + entry.trackId}
                index={index}
                entry={entry}
                tableVariant={tableVariant}
                tableOptions={tableOptions}
                gridTemplateColumns={gridTemplateColumns}
                // disc related props
                showDiscNumbers={showDiscNumbers}
                // track related props
                playerPlaying={playerPlaying}
                playTrack={playTrack}
                pauseTrack={pauseTrack}
                isTrackLoaded={isTrackLoaded}
              />
            );
          }

          // Standard rows
          else {
            return (
              <StandardRow
                key={index}
                entry={entry}
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
const groupHeightFirst = 45;
const groupHeightGeneral = 94;
const discHeightFirst = 39;
const discHeightGeneral = 68;
const rowHeightDefault = 50;
const rowHeightSmall = 39;
const fixedElementCount = 1; // 1 for the header

// State
let innerRef;

const TableBodyVirtual = ({
  entries,
  titleBlock,
  headerBlock,
  tableVariant,
  tableOptions,
  gridTemplateColumns,
  noArtworkVisible,
  // disc related props
  discCount,
  showDiscNumbers,
  orderKey,
  // track related props
  playerPlaying,
  playTrack,
  pauseTrack,
  isTrackLoaded,
}) => {
  // Element refs
  innerRef = useRef(null);
  const outerRef = useRef(null);

  // Used when scrolling to a specific track
  const { windowHeight } = useWindowSize();

  // Hacky workaround to force a re-render if content breakpoint changes
  const contentBreakpoint = useSelector(({ appModel }) => appModel.contentBreakpoint);

  // Hacky workaround to force a re-render if certain props change
  const extraRows = [showDiscNumbers ? 1 : 0, noArtworkVisible ? 1 : 0, orderKey === 'desc' ? 1 : 0].reduce(
    (a, b) => a + b,
    0
  );

  // Store which actual row height to use
  const rowHeightActual = noArtworkVisible ? rowHeightSmall : rowHeightDefault;

  // Helper to determine row heights
  const estimateSize = useCallback(
    (index) => {
      const currentEntry = entries[index - fixedElementCount];

      const isGroupRowFirst = currentEntry?.kind === 'group' && index - fixedElementCount === 0;

      const isGroupRowGeneral = currentEntry?.kind === 'group' && !isGroupRowFirst;

      const isDiscRowFirst =
        currentEntry?.kind === 'disc' &&
        ((orderKey !== 'desc' && currentEntry?.discNumber === 1) ||
          (orderKey === 'desc' && currentEntry?.discNumber === discCount));

      const isDiscRowGeneral = currentEntry?.kind === 'disc' && !isDiscRowFirst;

      const isExtraRow = index > fixedElementCount - 1 && !currentEntry;

      if (index === 0) {
        return tableHeadHeight;
      } else if (isGroupRowFirst) {
        return groupHeightFirst;
      } else if (isGroupRowGeneral) {
        return groupHeightGeneral;
      } else if (isDiscRowFirst) {
        return discHeightFirst;
      } else if (isDiscRowGeneral) {
        return discHeightGeneral;
      } else if (isExtraRow) {
        return 0;
      } else {
        return rowHeightActual;
      }
    },
    [entries, discCount, orderKey, rowHeightActual]
  );

  // Setup the virtualizer
  const rowVirtualizer = useVirtualizer({
    count: entries.length + fixedElementCount + extraRows,
    getScrollElement: () => outerRef.current,
    overscan: 3,
    estimateSize,
    measureElement,
    // rangeExtractor,
  });

  // Scroll to a specific track, when required
  const scrollToVirtualTrack = useCallback(
    (index) => {
      const rowIndex = index + 0.5;
      const scrollOffset = tableHeadHeight + rowIndex * rowHeightActual - (windowHeight - 100) / 2;
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
    [rowVirtualizer, rowHeightActual, windowHeight]
  );
  useScrollToVirtualTrack(entries, scrollToVirtualTrack);

  return (
    <div ref={outerRef} id="scrollable" className={clsx(style.scrollableOuter, style.scrollableOuterVirtual)}>
      <div
        ref={innerRef}
        id="scrollable-inner"
        className={style.scrollableInner}
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualEntry, index) => {
          if (index === 0) {
            return (
              <React.Fragment key={'title-' + contentBreakpoint}>
                {titleBlock}
                {headerBlock}
                <div
                  key={'title-' + contentBreakpoint}
                  id="measure"
                  className={style.measure}
                  data-index={index}
                  ref={rowVirtualizer.measureElement}
                ></div>
              </React.Fragment>
            );
          } else {
            const entry = entries[virtualEntry.index - fixedElementCount];

            // Catch missing entries
            if (!entry) {
              return null;
            }

            // Disc numbers
            else if (entry.kind === 'group') {
              return <GroupRow key={virtualEntry.index} entry={entry} virtualEntry={virtualEntry} />;
            }

            // Disc numbers
            else if (entry.kind === 'disc') {
              return <DiscRow key={virtualEntry.index} entry={entry} virtualEntry={virtualEntry} />;
            }

            // Tracks
            else if (entry.kind === 'track') {
              return (
                <TrackRow
                  key={virtualEntry.index}
                  entry={entry}
                  virtualEntry={virtualEntry}
                  tableVariant={tableVariant}
                  tableOptions={tableOptions}
                  gridTemplateColumns={gridTemplateColumns}
                  // disc related props
                  showDiscNumbers={showDiscNumbers}
                  // track related props
                  playerPlaying={playerPlaying}
                  playTrack={playTrack}
                  pauseTrack={pauseTrack}
                  isTrackLoaded={isTrackLoaded}
                />
              );
            }

            // Standard rows
            else {
              return (
                <StandardRow
                  key={virtualEntry.index}
                  entry={entry}
                  virtualEntry={virtualEntry}
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

// // Helper to determine the visible range, including our sticky row
// const rangeExtractor = (range) => {
//   const start = Math.max(range.startIndex - range.overscan, 0);
//   const end = Math.min(range.endIndex + range.overscan, range.count - 1);
//   const indexes = Array.from({ length: end - start + 1 }, (_, i) => start + i);
//   if (!indexes.includes(0)) {
//     indexes.unshift(0);
//   }
//   return indexes;
// };

// Helper to determine the header height
const measureElement = (element) => {
  const innerTop = innerRef.current.getBoundingClientRect().top;
  const elementTop = element.getBoundingClientRect().top;
  return Math.round(elementTop - innerTop);
};

// ======================================================================
// GROUP ROW
// ======================================================================

const GroupRow = ({ virtualEntry, entry }) => {
  return (
    <div
      className={style.groupRow}
      style={{
        ...(virtualEntry && {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualEntry.start}px)`,
        }),
      }}
    >
      {entry.groupName}
    </div>
  );
};

// ======================================================================
// DISC ROW
// ======================================================================

const DiscRow = ({ virtualEntry, entry }) => {
  return (
    <div
      className={style.discRow}
      style={{
        ...(virtualEntry && {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualEntry.start}px)`,
        }),
      }}
    >
      <div className={style.discIcon}>
        <Icon icon="DiscIcon" cover stroke />
      </div>
      <div className={style.discNumber}>Disc {entry.discNumber}</div>
    </div>
  );
};

// ======================================================================
// STANDARD ROW
// ======================================================================

const StandardRow = ({ virtualEntry, entry, tableVariant, tableOptions, gridTemplateColumns }) => {
  const { ratingType, ratingKey } = lookupVariantFields[tableVariant] || {};
  const rowKey = entry.albumId || entry.artistId || entry.playlistId || entry.collectionId;

  return (
    <NavLink
      className={style.entry}
      to={entry.link}
      draggable="false"
      style={{
        ...(virtualEntry && {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualEntry.start}px)`,
        }),
        gridTemplateColumns,
      }}
    >
      {tableOptions
        .filter((columnOptions) => columnOptions.visible !== false)
        .map((columnOptions, index) => {
          switch (columnOptions.colKey) {
            case 'addedAt':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.addedAt, 'text-trim')}>
                  {formatRecentDate(entry.addedAt)}
                </div>
              );

            case 'artist':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.artist, 'text-trim')}>
                  {entry.artist}
                </div>
              );

            case 'country':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.country, 'text-trim')}>
                  {entry.country}
                </div>
              );

            case 'duration':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.duration, 'text-trim')}>
                  {durationToStringMed(entry.duration)}
                </div>
              );

            case 'genre':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.genre, 'text-trim')}>
                  {entry.genre}
                </div>
              );

            case 'isFavourite':
              return (
                <div key={rowKey + '-' + index} className={style.isFavourite}>
                  <Favourite
                    variant="table"
                    type={ratingType}
                    itemId={rowKey}
                    isFavourite={entry.isFavourite}
                    editable
                  />
                </div>
              );

            case 'kind':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.kind, 'text-trim')}>
                  {entry.kind?.replace('aaa', '')}
                </div>
              );

            case 'lastPlayed':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.lastPlayed, 'text-trim')}>
                  {formatRecentDate(entry.lastPlayed)}
                </div>
              );

            case 'releaseDate':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.releaseDate, 'text-trim')}>
                  {entry.releaseDate ? moment(entry.releaseDate).format('YYYY') : null}
                </div>
              );

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

            case 'totalTracks':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.totalTracks, 'text-trim')}>
                  {entry.totalTracks}
                  {(entry.totalTracks || entry.totalTracks === 0) && <> track{entry.totalTracks !== 1 ? 's' : ''}</>}
                </div>
              );

            case 'userRating':
              return (
                <div key={rowKey + '-' + index} className={style.userRating}>
                  <StarRating
                    variant="list"
                    type={ratingType}
                    ratingKey={entry[ratingKey]}
                    rating={entry.userRating}
                    editable
                    onlyShowOnHover
                  />
                </div>
              );

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
  virtualEntry,
  index,
  entry,
  tableVariant,
  tableOptions,
  gridTemplateColumns,
  // disc related props
  showDiscNumbers,
  // track related props
  playTrack,
  playerPlaying,
  pauseTrack,
  isTrackLoaded,
}) => {
  const { ratingType, ratingKey } = lookupVariantFields[tableVariant] || {};
  const rowKey = entry.albumId || entry.artistId || entry.playlistId || entry.collectionId;

  let trackNumber = entry.sortedTrackNumber ? entry.sortedTrackNumber : virtualEntry ? virtualEntry.index : index + 1;

  const discIndex = entry.discIndex || 0;
  const trackIndex = trackNumber - 1 - discIndex;
  const trackIsLoaded = isTrackLoaded(tableVariant, entry.trackId);

  // TODO: Should probably show actual track numbers on all albums, even if only 1 disc
  if (showDiscNumbers && entry.trackNumber) {
    trackNumber = entry.trackNumber;
  }

  const handleDoubleClick = (_event) => {
    playTrack(tableVariant, trackIndex, true);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      playTrack(tableVariant, trackIndex, true);
    }
  };

  return (
    <div
      id={entry.trackId}
      className={clsx(style.entry, {
        [style.entryPlaying]: trackIsLoaded,
      })}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        ...(virtualEntry && {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualEntry.start}px)`,
        }),
        gridTemplateColumns,
      }}
    >
      {tableOptions
        .filter((columnOptions) => columnOptions.visible !== false)
        .map((columnOptions, index) => {
          switch (columnOptions.colKey) {
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

            // // Debugging
            // case 'artist':
            //   return (
            //     <div key={rowKey + '-' + index} className={clsx(style.artist, 'text-trim')}>
            //       {discIndex} - {virtualEntry.index} - {trackIndex}
            //     </div>
            //   );

            case 'bitrate':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.bitrate, 'text-trim')}>
                  {entry.bitrate}
                </div>
              );

            case 'codec':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.codec, 'text-trim')}>
                  {entry.codec?.toUpperCase()}
                </div>
              );

            case 'duration':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.duration, 'text-trim')}>
                  {durationToStringShort(entry.duration)}
                </div>
              );

            case 'isFavourite':
              return (
                <div key={rowKey + '-' + index} className={style.isFavourite}>
                  <Favourite
                    variant="table"
                    type={ratingType}
                    itemId={entry[ratingKey]}
                    isFavourite={entry.isFavourite}
                    editable
                  />
                </div>
              );

            case 'kind':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.kind, 'text-trim')}>
                  {entry.kind?.replace('aaa', '')}
                </div>
              );

            case 'releaseDate':
              return (
                <div key={rowKey + '-' + index} className={clsx(style.releaseDate, 'text-trim')}>
                  {entry.releaseDate ? moment(entry.releaseDate).format('YYYY') : null}
                </div>
              );

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
                    // <div className={style.playingPausedIcon}>
                    //   <Icon icon="VolOffIcon" cover stroke />
                    // </div>
                    // <div className={clsx(style.trackNumber, style.colCenter, style.colorPrimary)}>
                    //   <span>{trackNumber}</span>
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

            case 'userRating':
              return (
                <div key={rowKey + '-' + index} className={style.userRating}>
                  <StarRating
                    variant="list"
                    type={ratingType}
                    ratingKey={entry[ratingKey]}
                    rating={entry.userRating}
                    editable
                    onlyShowOnHover
                  />
                </div>
              );

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

const lookupVariantFields = {
  artists: {
    ratingType: 'artist',
    ratingKey: 'artistId',
  },
  artistTracks: {
    ratingType: 'track',
    ratingKey: 'trackId',
    playVariant: 'artists',
  },
  albums: {
    ratingType: 'album',
    ratingKey: 'albumId',
  },
  albumTracks: {
    ratingType: 'track',
    ratingKey: 'trackId',
    playVariant: 'albums',
  },
  folders: {
    ratingKey: 'folderId',
    playVariant: 'folders',
  },
  playlists: {
    ratingType: 'playlist',
    ratingKey: 'playlistId',
  },
  playlistTracks: {
    ratingType: 'track',
    ratingKey: 'trackId',
    playVariant: 'playlists',
  },
  collections: {
    ratingType: 'collection',
    ratingKey: 'collectionId',
  },
};

// ======================================================================
// EXPORT
// ======================================================================

export default ViewList;
