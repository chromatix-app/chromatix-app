// ======================================================================
// IMPORTS
// ======================================================================

import React, { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import moment from 'moment';

import { Icon, StarRating } from 'js/components';
import {
  // useScrollToTrack,
  useTableOptions,
} from 'js/hooks';
import {
  durationToStringLong,
  // durationToStringShort,
  formatRecentDate,
} from 'js/utils';

import style from './ListTableV2.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ListTableV2 = ({
  children,
  variant,
  // albumId,
  // playlistId,
  // folderId,
  // playingOrder,
  // discCount = 1,
  entries,
  sortString,
  sortKey = sortString ? sortString.split('-')[0] : null,
  orderKey = sortString ? sortString.split('-')[1] : null,
}) => {
  const { tableVariant, tableOptions, gridTemplateColumns, handleSortList } = useTableOptions(
    variant,
    sortKey,
    orderKey
  );

  const tableHeading = () => {
    return (
      <TableHeader
        tableVariant={tableVariant}
        tableOptions={tableOptions}
        gridTemplateColumns={gridTemplateColumns}
        handleSortList={handleSortList}
      />
    );
  };

  if (entries) {
    return (
      <div className={clsx(style.wrap, style['wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1)], {})}>
        <TableBody
          entries={entries}
          titleBlock={children}
          tableHeading={tableHeading()}
          tableVariant={tableVariant}
          tableOptions={tableOptions}
          gridTemplateColumns={gridTemplateColumns}
        />
      </div>
    );
  }
};

// ======================================================================
// TABLE HEADER
// ======================================================================

const TableHeader = ({ tableOptions, gridTemplateColumns, handleSortList }) => {
  return (
    <div className={style.header} style={{ gridTemplateColumns }}>
      {tableOptions
        .filter((columnOptions) => columnOptions.visible !== false && columnOptions.visibleInHeader !== false)
        .map((columnOptions, index) => (
          <SortableHeading key={index} handleSortList={handleSortList} {...columnOptions} />
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
  handleSortList,
  showArrows = true, // TODO: what views use this?
}) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSortList(event);
    }
  };

  return (
    <div onClick={handleSortList} onKeyDown={handleKeyDown} tabIndex={0} data-sort={colKey} style={headerStyle}>
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
// TABLE BODY
// ======================================================================

const TableBody = ({ entries, titleBlock, tableHeading, tableVariant, tableOptions, gridTemplateColumns }) => {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  // Config in state so it can be dynamic in future
  const [tableHeadHeight] = useState(250);
  const [rowHeight] = useState(50);
  const fixedElementCount = 1;

  // Helper to determine row heights
  const getItemSize = (index) => (index === 0 ? tableHeadHeight : rowHeight);

  // Helper to determine the visible range, including our sticky row
  const rangeExtractor = (range) => {
    const { startIndex, endIndex } = range;
    const indexes = Array.from({ length: endIndex - startIndex + 1 }, (_, i) => startIndex + i);
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

  // Setup the virtualizer
  const rowVirtualizer = useVirtualizer({
    count: entries.length + fixedElementCount,
    getScrollElement: () => outerRef.current,
    estimateSize: getItemSize,
    overscan: 5,
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
                {tableHeading}
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
        })}
      </div>
    </div>
  );
};

// ======================================================================
// TABLE ROW
// ======================================================================

const TableRow = ({ virtualRow, entry, tableVariant, tableOptions, gridTemplateColumns }) => {
  return (
    <NavLink
      key={entry.artistId}
      className={style.entry}
      to={entry.link}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: `translateY(${virtualRow.start}px)`,
        gridTemplateColumns,
      }}
    >
      {tableOptions
        .filter((columnOptions) => columnOptions.visible !== false)
        .map((columnOptions, index) => {
          const { ratingType, ratingKey } = userRatingOptions[tableVariant];

          switch (columnOptions.colKey) {
            case 'thumb':
              if (columnOptions.icon) {
                return (
                  <div key={index} className={clsx(style.thumb, style.thumbFolder)}>
                    <span className={style.thumbIcon}>
                      <Icon icon={columnOptions.icon} cover stroke strokeWidth={1.2} />
                    </span>
                  </div>
                );
              } else {
                return (
                  <div key={index} className={style.thumb}>
                    <img src={entry.thumb} alt={entry.title} loading="lazy" />
                  </div>
                );
              }

            case 'title':
              return (
                <div key={index} className={clsx(style.title, 'text-trim')}>
                  {entry.title}
                </div>
              );

            case 'artist':
              return (
                <div key={index} className={clsx(style.artist, 'text-trim')}>
                  {entry.artist}
                </div>
              );

            case 'genre':
              return (
                <div key={index} className={clsx(style.genre, 'text-trim')}>
                  {entry.genre}
                </div>
              );

            case 'totalTracks':
              return (
                <div key={index} className={clsx(style.totalTracks, 'text-trim')}>
                  {entry.totalTracks}
                  {(entry.totalTracks || entry.totalTracks === 0) && <> track{entry.totalTracks !== 1 ? 's' : ''}</>}
                </div>
              );

            case 'duration':
              return (
                <div key={index} className={clsx(style.duration, 'text-trim')}>
                  {durationToStringLong(entry.duration)}
                </div>
              );

            case 'releaseDate':
              return (
                <div key={index} className={clsx(style.releaseDate, 'text-trim')}>
                  {entry.releaseDate ? moment(entry.releaseDate).format('MMM YYYY') : null}
                </div>
              );

            case 'addedAt':
              return (
                <div key={index} className={clsx(style.addedAt, 'text-trim')}>
                  {formatRecentDate(entry.addedAt)}
                </div>
              );

            case 'lastPlayed':
              return (
                <div key={index} className={clsx(style.lastPlayed, 'text-trim')}>
                  {formatRecentDate(entry.lastPlayed)}
                </div>
              );

            case 'userRating':
              return (
                <div key={index} className={style.userRating}>
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
              return <div key={index} className={style.empty}></div>;

            default:
              return null;
          }
        })}
    </NavLink>
  );
};

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
