// ======================================================================
// IMPORTS
// ======================================================================

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { Icon, StarRating } from 'js/components';
import { durationToStringShort } from 'js/utils';

import style from './ListTracks.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ListTracks = ({ variant, albumId, playlistId, playingOrder, discCount = 1, entries }) => {
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

  const handleSortPlaylist = (event) => {
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

  if (entries) {
    return (
      <div className={clsx(style.wrap, style['wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1)])}>
        {variant === 'albums' && (
          <div
            className={clsx(style.header, {
              [style.headerWithRating]: optionShowStarRatings,
            })}
          >
            <div className={style.labelCenter}>
              <span>#</span>
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
            <SortableHeader
              className={style.labelCenter}
              sortKey="sortOrder"
              currentSortKey={sortKey}
              label="#"
              handleSortPlaylist={handleSortPlaylist}
              showArrows={false}
            />
            <SortableHeader
              sortKey="title"
              currentSortKey={sortKey}
              label="Title"
              handleSortPlaylist={handleSortPlaylist}
            />
            <div></div>
            <SortableHeader
              sortKey="artist"
              currentSortKey={sortKey}
              label="Artist"
              handleSortPlaylist={handleSortPlaylist}
            />
            <SortableHeader
              sortKey="album"
              currentSortKey={sortKey}
              label="Album"
              handleSortPlaylist={handleSortPlaylist}
            />
            {optionShowStarRatings && (
              <SortableHeader
                className={style.headerRating}
                sortKey="userRating"
                currentSortKey={sortKey}
                label="Rating"
                handleSortPlaylist={handleSortPlaylist}
              />
            )}
            <SortableHeader
              sortKey="duration"
              currentSortKey={sortKey}
              label="Duration"
              handleSortPlaylist={handleSortPlaylist}
            />
          </div>
        )}

        <div className={style.entries}>
          {entries.map((entry, index) => {
            const trackNumber = variant === 'playlists' ? index + 1 : entry.trackNumber;

            const showDisc = discCount > 1 && currentDisc !== entry.discNumber;
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
                  playingOrder: sortKey ? playingOrder : null,
                  playingTrackIndex: sortKey ? playingOrder[index] : index,
                });
              } else {
                dispatch.playerModel.playerPlay();
              }
            };

            return (
              <ListEntry
                key={entry.trackId}
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

const SortableHeader = ({ className, sortKey, currentSortKey, label, handleSortPlaylist, showArrows = true }) => {
  const isAsc = currentSortKey?.startsWith(`${sortKey}-asc`);
  const isDesc = currentSortKey?.startsWith(`${sortKey}-desc`);
  return (
    <div className={className} onClick={handleSortPlaylist} data-sort={sortKey}>
      <span>{label}</span>
      {showArrows && (
        <>
          {isAsc && (
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
            <div className={clsx(style.trackNumber, style.labelCenter)}>
              <span>{trackNumber}</span>
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
