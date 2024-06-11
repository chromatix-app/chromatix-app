// ======================================================================
// IMPORTS
// ======================================================================

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { Icon, StarRating } from 'js/components';
import { durationToStringShort, sortList } from 'js/utils';

import style from './ListTracks.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ListTracks = ({ variant, albumId, playlistId, entries }) => {
  const dispatch = useDispatch();

  const playerPlaying = useSelector(({ playerModel }) => playerModel.playerPlaying);
  const scrollToPlaying = useSelector(({ appModel }) => appModel.scrollToPlaying);

  const playingVariant = useSelector(({ sessionModel }) => sessionModel.playingVariant);
  const playingAlbumId = useSelector(({ sessionModel }) => sessionModel.playingAlbumId);
  const playingPlaylistId = useSelector(({ sessionModel }) => sessionModel.playingPlaylistId);
  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);

  const optionShowFullTitles = useSelector(({ sessionModel }) => sessionModel.optionShowFullTitles);
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);
  const sortPlaylistTracks = useSelector(({ sessionModel }) => sessionModel.sortPlaylistTracks);

  const trackDetail = playingTrackList?.[playingTrackKeys[playingTrackIndex]];
  const sortKey = (variant === 'playlists' && sortPlaylistTracks[playlistId]) || null;

  const totalDiscs = useMemo(() => {
    if (variant === 'albums') {
      return entries.reduce((acc, entry) => {
        return Math.max(acc, entry.discNumber);
      }, 0);
    }
    return 1;
  }, [variant, entries]);

  const sortedEntries = useMemo(() => {
    if (sortKey) {
      // Add originalIndex to each entry
      const entriesWithOriginalIndex = entries.map((entry, index) => ({
        ...entry,
        originalIndex: index,
      }));
      // Sort entries
      if (sortKey === 'sortOrder-desc') {
        return entriesWithOriginalIndex.slice().reverse();
      } else {
        return sortList(entriesWithOriginalIndex, sortKey);
      }
    }
    // If not a playlist or no sortKey, return original entries
    return entries.map((entry, index) => ({
      ...entry,
      originalIndex: index,
    }));
  }, [entries, sortKey]);

  const sortedIndices = useMemo(() => {
    return sortedEntries.map((entry) => entry.originalIndex);
  }, [sortedEntries]);

  const handleSortTracks = (event) => {
    const sortKey = event.currentTarget.dataset.sort;
    dispatch.sessionModel.setSortPlaylistTracks({
      playlistId,
      sortKey,
    });
  };

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

  if (sortedEntries) {
    return (
      <div className={clsx(style.wrap, style['wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1)])}>
        {variant === 'albums' && (
          <div
            className={clsx(style.header, {
              [style.headerWithRating]: optionShowStarRatings,
            })}
          >
            <div>
              <span className={style.minCenter}>#</span>
            </div>
            <div>Title</div>
            <div>Artist</div>
            {optionShowStarRatings && <div className={style.headerRating}>Rating</div>}
            <div>Duration</div>
          </div>
        )}

        {variant === 'playlists' && (
          <div
            className={clsx(style.header, {
              [style.headerWithRating]: optionShowStarRatings,
            })}
          >
            <div onClick={handleSortTracks} data-sort="sortOrder">
              <span className={style.minCenter}>#</span>
            </div>
            <div onClick={handleSortTracks} data-sort="title">
              Title
              {sortKey === 'title-asc' && (
                <span className={style.sortIcon}>
                  <Icon icon="ArrowDownIcon" cover stroke />
                </span>
              )}
              {sortKey === 'title-desc' && (
                <span className={style.sortIcon}>
                  <Icon icon="ArrowUpIcon" cover stroke />
                </span>
              )}
            </div>
            <div></div>
            <div onClick={handleSortTracks} data-sort="artist">
              Artist
              {sortKey === 'artist-asc' && (
                <span className={style.sortIcon}>
                  <Icon icon="ArrowDownIcon" cover stroke />
                </span>
              )}
              {sortKey === 'artist-desc' && (
                <span className={style.sortIcon}>
                  <Icon icon="ArrowUpIcon" cover stroke />
                </span>
              )}
            </div>
            <div onClick={handleSortTracks} data-sort="album">
              Album
              {sortKey?.startsWith('album-asc') && (
                <span className={style.sortIcon}>
                  <Icon icon="ArrowDownIcon" cover stroke />
                </span>
              )}
              {sortKey?.startsWith('album-desc') && (
                <span className={style.sortIcon}>
                  <Icon icon="ArrowUpIcon" cover stroke />
                </span>
              )}
            </div>
            {optionShowStarRatings && (
              <div className={style.headerRating} onClick={handleSortTracks} data-sort="userRating">
                Rating
                {sortKey === 'userRating-desc' && (
                  <span className={style.sortIcon}>
                    <Icon icon="ArrowUpIcon" cover stroke />
                  </span>
                )}
                {sortKey === 'userRating-asc' && (
                  <span className={style.sortIcon}>
                    <Icon icon="ArrowDownIcon" cover stroke />
                  </span>
                )}
              </div>
            )}
            {/* <div onClick={handleSortTracks} data-sort="addedAt">
              Added
              {sortKey === 'addedAt-asc' && (
                <span className={style.sortIcon}>
                  <Icon icon="ArrowDownIcon" cover stroke />
                </span>
              )}
              {sortKey === 'addedAt-desc' && (
                <span className={style.sortIcon}>
                  <Icon icon="ArrowUpIcon" cover stroke />
                </span>
              )}
            </div> */}
            <div onClick={handleSortTracks} data-sort="duration">
              Duration
              {sortKey === 'duration-asc' && (
                <span className={style.sortIcon}>
                  <Icon icon="ArrowDownIcon" cover stroke />
                </span>
              )}
              {sortKey === 'duration-desc' && (
                <span className={style.sortIcon}>
                  <Icon icon="ArrowUpIcon" cover stroke />
                </span>
              )}
            </div>
          </div>
        )}

        <div className={style.sortedEntries}>
          {sortedEntries.map((entry, index) => {
            const trackNumber = variant === 'playlists' ? index + 1 : entry.trackNumber;

            const showDisc = totalDiscs > 1 && currentDisc !== entry.discNumber;
            currentDisc = entry.discNumber;

            const isCurrentlyPlaying =
              playingVariant === variant &&
              (playingAlbumId === albumId || (!playingAlbumId && !albumId)) &&
              (playingPlaylistId === playlistId || (!playingPlaylistId && !playlistId)) &&
              trackDetail.trackId === entry.trackId;

            const doPlay = (restart) => {
              if (restart) {
                dispatch.playerModel.playerLoadTrackItem({
                  playingVariant: variant,
                  playingAlbumId: albumId,
                  playingPlaylistId: playlistId,
                  playingOrder: sortKey ? sortedIndices : null,
                  playingTrackIndex: sortKey ? sortedIndices[index] : index,
                });
              } else {
                dispatch.playerModel.playerPlay();
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
                optionShowFullTitles={optionShowFullTitles}
                optionShowStarRatings={optionShowStarRatings}
              />
            );
          })}
        </div>
      </div>
    );
  }
};

const ListEntry = React.memo(
  ({
    entry,
    trackNumber,
    showDisc,
    isCurrentlyPlaying,
    playerPlaying,
    doPlay,
    variant,
    optionShowFullTitles,
    optionShowStarRatings,
  }) => {
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
            [style.entryWithRating]: optionShowStarRatings,
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
            <div className={style.pauseIcon} onClick={dispatch.playerModel.playerPause}>
              <Icon icon="PauseFilledIcon" cover />
            </div>
          )}

          {variant === 'playlists' && entry.thumb && (
            <div className={style.thumb}>
              <img src={entry.thumb} alt={entry.title} loading="lazy" />
            </div>
          )}

          <div className={clsx(style.title, { 'text-trim': !optionShowFullTitles })}>{entry.title}</div>

          <div className={clsx(style.artist, { 'text-trim': !optionShowFullTitles })}>
            <NavLink to={entry.artistLink}>{entry.artist}</NavLink>
          </div>

          {variant === 'playlists' && (
            <div className={clsx(style.album, { 'text-trim': !optionShowFullTitles })}>
              <NavLink to={entry.albumLink}>{entry.album} </NavLink>
            </div>
          )}

          {optionShowStarRatings && (
            <div className={style.userRating}>
              <StarRating type="track" ratingKey={entry.trackId} rating={entry.userRating} editable />
            </div>
          )}

          {/* {variant === 'playlists' && <div className={style.addedAt}>{addedAtToString(entry.addedAt)}</div>} */}

          <div className={style.duration}>{durationToStringShort(entry.duration)}</div>
        </div>
      </>
    );
  }
);

// ======================================================================
// EXPORT
// ======================================================================

export default ListTracks;
