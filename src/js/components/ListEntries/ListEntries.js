// ======================================================================
// IMPORTS
// ======================================================================

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import moment from 'moment';

import { Icon, StarRating } from 'js/components';
import { durationToStringLong, durationToStringShort, formatRecentDate } from 'js/utils';

import style from './ListEntries.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ListEntries = ({ variant, albumId, playlistId, playingOrder, discCount = 1, entries, sortKey, orderKey }) => {
  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const sortId = (variant === 'albumTracks' && albumId) || (variant === 'playlistTracks' && playlistId) || null;

  const handleSortList = (event) => {
    const sortKey = event.currentTarget.dataset.sort;
    console.log(sortKey);
    dispatch.sessionModel.setSortList({
      variant,
      sortKey,
      orderKey,
    });
  };

  const handleSortTracks = (event) => {
    const sortKey = event.currentTarget.dataset.sort;
    console.log(sortKey);
    dispatch.sessionModel.setSortTracks({
      variant,
      sortId,
      sortKey,
    });
  };

  if (entries) {
    return (
      <div
        className={clsx(style.wrap, style['wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1)], {
          [style.wrapWithRatings]: optionShowStarRatings,
        })}
      >
        <div className={style.header}>
          {variant === 'artists' && (
            <>
              <SortableHeading
                sortKey="title"
                currentSortKey={sortKey}
                label="Artist"
                handleSortCallback={handleSortList}
              />
              <div></div>
              <SortableHeading
                sortKey="genre"
                currentSortKey={sortKey}
                label="Genre"
                handleSortCallback={handleSortList}
              />
              <SortableHeading
                sortKey="addedAt"
                currentSortKey={sortKey}
                label="Added"
                handleSortCallback={handleSortList}
              />
              <SortableHeading
                sortKey="lastPlayed"
                currentSortKey={sortKey}
                label="Last Played"
                handleSortCallback={handleSortList}
              />
              {optionShowStarRatings && (
                <SortableHeading
                  className={style.headerRating}
                  sortKey="userRating"
                  currentSortKey={sortKey}
                  label="Rating"
                  handleSortCallback={handleSortList}
                />
              )}
            </>
          )}

          {variant === 'albums' && (
            <>
              <SortableHeading
                sortKey="title"
                currentSortKey={sortKey}
                label="Title"
                handleSortCallback={handleSortList}
              />
              <div></div>
              <SortableHeading
                sortKey="artist"
                currentSortKey={sortKey}
                label="Artist"
                handleSortCallback={handleSortList}
              />
              <SortableHeading
                sortKey="releaseDate"
                currentSortKey={sortKey}
                label="Released"
                handleSortCallback={handleSortList}
              />
              <SortableHeading
                sortKey="addedAt"
                currentSortKey={sortKey}
                label="Added"
                handleSortCallback={handleSortList}
              />
              <SortableHeading
                sortKey="lastPlayed"
                currentSortKey={sortKey}
                label="Last Played"
                handleSortCallback={handleSortList}
              />
              {optionShowStarRatings && (
                <SortableHeading
                  className={style.headerRating}
                  sortKey="userRating"
                  currentSortKey={sortKey}
                  label="Rating"
                  handleSortCallback={handleSortList}
                />
              )}
            </>
          )}

          {variant === 'playlists' && (
            <>
              <SortableHeading
                sortKey="title"
                currentSortKey={sortKey}
                label="Title"
                handleSortCallback={handleSortList}
              />
              <div></div>
              <SortableHeading
                sortKey="tracks"
                currentSortKey={sortKey}
                label="Tracks"
                handleSortCallback={handleSortList}
              />
              <SortableHeading
                sortKey="duration"
                currentSortKey={sortKey}
                label="Duration"
                handleSortCallback={handleSortList}
              />
              <SortableHeading
                sortKey="addedAt"
                currentSortKey={sortKey}
                label="Added"
                handleSortCallback={handleSortList}
              />
              <SortableHeading
                sortKey="lastPlayed"
                currentSortKey={sortKey}
                label="Last Played"
                handleSortCallback={handleSortList}
              />
              {optionShowStarRatings && (
                <SortableHeading
                  className={style.headerRating}
                  sortKey="userRating"
                  currentSortKey={sortKey}
                  label="Rating"
                  handleSortCallback={handleSortList}
                />
              )}
            </>
          )}

          {(variant === 'artistCollections' || variant === 'albumCollections') && (
            <>
              <SortableHeading
                sortKey="title"
                currentSortKey={sortKey}
                label="Title"
                handleSortCallback={handleSortList}
              />
              <div></div>
              <SortableHeading
                sortKey="addedAt"
                currentSortKey={sortKey}
                label="Added"
                handleSortCallback={handleSortList}
              />
              {optionShowStarRatings && (
                <SortableHeading
                  className={style.headerRating}
                  sortKey="userRating"
                  currentSortKey={sortKey}
                  label="Rating"
                  handleSortCallback={handleSortList}
                />
              )}
            </>
          )}

          {variant === 'albumTracks' && (
            <>
              <SortableHeading
                className={style.labelCenter}
                sortKey="sortOrder"
                currentSortKey={sortKey}
                label="#"
                handleSortCallback={handleSortTracks}
                showArrows={false}
              />
              <SortableHeading
                sortKey="title"
                currentSortKey={sortKey}
                label="Title"
                handleSortCallback={handleSortTracks}
              />
              <SortableHeading
                sortKey="artist"
                currentSortKey={sortKey}
                label="Artist"
                handleSortCallback={handleSortTracks}
              />
              {optionShowStarRatings && (
                <SortableHeading
                  className={style.headerRating}
                  sortKey="userRating"
                  currentSortKey={sortKey}
                  label="Rating"
                  handleSortCallback={handleSortTracks}
                />
              )}
              <SortableHeading
                sortKey="duration"
                currentSortKey={sortKey}
                label="Duration"
                handleSortCallback={handleSortTracks}
              />
            </>
          )}

          {variant === 'playlistTracks' && (
            <>
              <SortableHeading
                className={style.labelCenter}
                sortKey="sortOrder"
                currentSortKey={sortKey}
                label="#"
                handleSortCallback={handleSortTracks}
                showArrows={false}
              />
              <SortableHeading
                sortKey="title"
                currentSortKey={sortKey}
                label="Title"
                handleSortCallback={handleSortTracks}
              />
              <div></div>
              <SortableHeading
                sortKey="artist"
                currentSortKey={sortKey}
                label="Artist"
                handleSortCallback={handleSortTracks}
              />
              <SortableHeading
                sortKey="album"
                currentSortKey={sortKey}
                label="Album"
                handleSortCallback={handleSortTracks}
              />
              {optionShowStarRatings && (
                <SortableHeading
                  className={style.headerRating}
                  sortKey="userRating"
                  currentSortKey={sortKey}
                  label="Rating"
                  handleSortCallback={handleSortTracks}
                />
              )}
              <SortableHeading
                sortKey="duration"
                currentSortKey={sortKey}
                label="Duration"
                handleSortCallback={handleSortTracks}
              />
            </>
          )}
        </div>

        <div className={style.entries}>
          {variant === 'artists' && <ListArtists entries={entries} />}
          {variant === 'albums' && <ListAlbums entries={entries} />}
          {variant === 'playlists' && <ListPlaylists entries={entries} />}
          {(variant === 'artistCollections' || variant === 'albumCollections') && (
            <ListArtistCollections entries={entries} />
          )}
          {(variant === 'albumTracks' || variant === 'playlistTracks') && (
            <ListTracks
              variant={variant}
              albumId={albumId}
              playlistId={playlistId}
              discCount={discCount}
              entries={entries}
              playingOrder={playingOrder}
              sortKey={sortKey}
            />
          )}
        </div>
      </div>
    );
  }
};

const SortableHeading = ({ className, sortKey, currentSortKey, label, handleSortCallback, showArrows = true }) => {
  const isAsc = currentSortKey?.startsWith(`${sortKey}-asc`);
  const isDesc = currentSortKey?.startsWith(`${sortKey}-desc`);
  return (
    <div className={className} onClick={handleSortCallback} data-sort={sortKey}>
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

const ListArtists = ({ entries }) => {
  const optionShowFullTitles = useSelector(({ sessionModel }) => sessionModel.optionShowFullTitles);
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  return entries.map((entry) => {
    return (
      <NavLink key={entry.artistId} className={style.entry} to={entry.link}>
        <div className={style.thumb}>
          <img src={entry.thumb} alt={entry.title} loading="lazy" />
        </div>
        <div className={clsx(style.title, { 'text-trim': !optionShowFullTitles })}>{entry.title}</div>
        <div className={clsx(style.genre, { 'text-trim': !optionShowFullTitles })}>{entry.genre}</div>
        <div className={clsx(style.addedAt, { 'text-trim': !optionShowFullTitles })}>
          {formatRecentDate(entry.addedAt)}
        </div>
        <div className={clsx(style.lastPlayed, { 'text-trim': !optionShowFullTitles })}>
          {formatRecentDate(entry.lastPlayed)}
        </div>
        {optionShowStarRatings && (
          <div className={style.userRating}>
            <StarRating type="artist" ratingKey={entry.artistId} rating={entry.userRating} inline editable />
          </div>
        )}
      </NavLink>
    );
  });
};

const ListAlbums = ({ entries }) => {
  const optionShowFullTitles = useSelector(({ sessionModel }) => sessionModel.optionShowFullTitles);
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  return entries.map((entry) => {
    return (
      <NavLink key={entry.albumId} className={style.entry} to={entry.link}>
        <div className={style.thumb}>
          <img src={entry.thumb} alt={entry.title} loading="lazy" />
        </div>
        <div className={clsx(style.title, { 'text-trim': !optionShowFullTitles })}>{entry.title}</div>
        <div className={clsx(style.artist, { 'text-trim': !optionShowFullTitles })}>{entry.artist}</div>
        <div className={clsx(style.releaseDate, { 'text-trim': !optionShowFullTitles })}>
          {entry.releaseDate ? moment(entry.releaseDate).format('MMM YYYY') : null}
        </div>
        <div className={clsx(style.addedAt, { 'text-trim': !optionShowFullTitles })}>
          {formatRecentDate(entry.addedAt)}
        </div>
        <div className={clsx(style.lastPlayed, { 'text-trim': !optionShowFullTitles })}>
          {formatRecentDate(entry.lastPlayed)}
        </div>
        {optionShowStarRatings && (
          <div className={style.userRating}>
            <StarRating type="album" ratingKey={entry.albumId} rating={entry.userRating} inline editable />
          </div>
        )}
      </NavLink>
    );
  });
};

const ListPlaylists = ({ entries }) => {
  const optionShowFullTitles = useSelector(({ sessionModel }) => sessionModel.optionShowFullTitles);
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  return entries.map((entry) => {
    return (
      <NavLink key={entry.playlistId} className={style.entry} to={entry.link}>
        <div className={style.thumb}>
          <img src={entry.thumb} alt={entry.title} loading="lazy" />
        </div>
        <div className={clsx(style.title, { 'text-trim': !optionShowFullTitles })}>{entry.title}</div>
        <div className={clsx(style.totalTracks, { 'text-trim': !optionShowFullTitles })}>
          {entry.totalTracks}
          {entry.totalTracks && ' tracks'}
        </div>
        <div className={clsx(style.duration, { 'text-trim': !optionShowFullTitles })}>
          {durationToStringLong(entry.duration)}
        </div>
        <div className={clsx(style.addedAt, { 'text-trim': !optionShowFullTitles })}>
          {formatRecentDate(entry.addedAt)}
        </div>
        <div className={clsx(style.lastPlayed, { 'text-trim': !optionShowFullTitles })}>
          {formatRecentDate(entry.lastPlayed)}
        </div>
        {optionShowStarRatings && (
          <div className={style.userRating}>
            <StarRating type="playlist" ratingKey={entry.playlistId} rating={entry.userRating} inline editable />
          </div>
        )}
      </NavLink>
    );
  });
};

const ListArtistCollections = ({ entries }) => {
  const optionShowFullTitles = useSelector(({ sessionModel }) => sessionModel.optionShowFullTitles);
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  return entries.map((entry) => {
    return (
      <NavLink key={entry.collectionId} className={style.entry} to={entry.link}>
        <div className={style.thumb}>
          <img src={entry.thumb} alt={entry.title} loading="lazy" />
        </div>
        <div className={clsx(style.title, { 'text-trim': !optionShowFullTitles })}>{entry.title}</div>
        <div className={clsx(style.addedAt, { 'text-trim': !optionShowFullTitles })}>
          {formatRecentDate(entry.addedAt)}
        </div>
        {optionShowStarRatings && (
          <div className={style.userRating}>
            <StarRating type="collection" ratingKey={entry.collectionId} rating={entry.userRating} inline editable />
          </div>
        )}
      </NavLink>
    );
  });
};

const ListTracks = ({ variant, albumId, playlistId, discCount, entries, playingOrder, sortKey }) => {
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

  const trackDetail = playingTrackList?.[playingTrackKeys[playingTrackIndex]];

  const matchVariant = variant === 'albumTracks' ? 'albums' : 'playlists';

  // scroll to playing track, if required
  useEffect(() => {
    if ((variant === 'albumTracks' || variant === 'playlistTracks') && scrollToPlaying) {
      const playingElement = document.getElementById(trackDetail?.trackId);
      if (playingElement) {
        playingElement.scrollIntoView({ block: 'center' });
      }
      dispatch.appModel.setAppState({ scrollToPlaying: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToPlaying]);

  let currentDisc = 0;

  return entries.map((entry, index) => {
    const isSorted = sortKey && !sortKey.startsWith('sortOrder');

    const trackNumber = variant === 'playlistTracks' || isSorted ? index + 1 : entry.trackNumber;

    const showDisc = discCount > 1 && currentDisc !== entry.discNumber && !isSorted;
    currentDisc = entry.discNumber;

    const isCurrentlyPlaying =
      playingVariant === matchVariant &&
      (playingAlbumId === albumId || (!playingAlbumId && !albumId)) &&
      (playingPlaylistId === playlistId || (!playingPlaylistId && !playlistId)) &&
      trackDetail.trackId === entry.trackId;

    const doPlay = (restart) => {
      if (restart) {
        dispatch.playerModel.playerLoadTrackItem({
          playingVariant: matchVariant,
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
      <ListTrackEntry
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
  });
};

const ListTrackEntry = React.memo(
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

          {variant === 'playlistTracks' && entry.thumb && (
            <div className={style.thumb}>
              <img src={entry.thumb} alt={entry.title} loading="lazy" />
            </div>
          )}

          <div className={clsx(style.title, { 'text-trim': !optionShowFullTitles })}>{entry.title}</div>

          <div className={clsx(style.artist, { 'text-trim': !optionShowFullTitles })}>
            <NavLink to={entry.artistLink}>{entry.artist}</NavLink>
          </div>

          {variant === 'playlistTracks' && (
            <div className={clsx(style.album, { 'text-trim': !optionShowFullTitles })}>
              <NavLink to={entry.albumLink}>{entry.album} </NavLink>
            </div>
          )}

          {optionShowStarRatings && (
            <div className={style.userRating}>
              <StarRating type="track" ratingKey={entry.trackId} rating={entry.userRating} editable />
            </div>
          )}

          {/* {variant === 'playlistTracks' && <div className={style.addedAt}>{addedAtToString(entry.addedAt)}</div>} */}

          <div className={style.duration}>{durationToStringShort(entry.duration)}</div>
        </div>
      </>
    );
  }
);

// ======================================================================
// EXPORT
// ======================================================================

export default ListEntries;
