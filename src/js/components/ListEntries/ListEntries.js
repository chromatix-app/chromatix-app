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

const ListEntries = ({
  variant,
  albumId,
  playlistId,
  playingOrder,
  discCount = 1,
  entries,
  sortString,
  sortKey = sortString ? sortString.split('-')[0] : null,
  orderKey = sortString ? sortString.split('-')[1] : null,
}) => {
  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const sortId = (variant === 'albumTracks' && albumId) || (variant === 'playlistTracks' && playlistId) || null;

  const handleSortList = (event) => {
    const sortKey = event.currentTarget.dataset.sort;
    // console.log(sortKey);
    dispatch.sessionModel.setSortList({
      variant,
      sortKey,
    });
  };

  const handleSortTracks = (event) => {
    const sortKey = event.currentTarget.dataset.sort;
    // console.log(sortKey);
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
          {(variant === 'artists' || variant === 'artistCollectionItems') && (
            <>
              <SortableHeading
                defaultKey
                sortKey="title"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Artist"
                handleSortCallback={handleSortList}
                style={{
                  gridColumn: '1 / span 2',
                }}
              />
              {/* <SortableHeading
                sortKey="genre"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Genre"
                handleSortCallback={handleSortList}
              /> */}
              <SortableHeading
                sortKey="addedAt"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Added"
                handleSortCallback={handleSortList}
              />
              <SortableHeading
                sortKey="lastPlayed"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Last Played"
                handleSortCallback={handleSortList}
              />
              {optionShowStarRatings && (
                <SortableHeading
                  className={style.headerRating}
                  sortKey="userRating"
                  currentSortKey={sortKey}
                  currentOrderKey={orderKey}
                  label="Rating"
                  handleSortCallback={handleSortList}
                />
              )}
            </>
          )}

          {(variant === 'albums' || variant === 'albumCollectionItems') && (
            <>
              <SortableHeading
                defaultKey
                sortKey="title"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Title"
                handleSortCallback={handleSortList}
                style={{
                  gridColumn: '1 / span 2',
                }}
              />
              <SortableHeading
                sortKey="artist"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Artist"
                handleSortCallback={handleSortList}
              />
              <SortableHeading
                sortKey="releaseDate"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Released"
                handleSortCallback={handleSortList}
              />
              <SortableHeading
                sortKey="addedAt"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Added"
                handleSortCallback={handleSortList}
              />
              <SortableHeading
                sortKey="lastPlayed"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Last Played"
                handleSortCallback={handleSortList}
              />
              {optionShowStarRatings && (
                <SortableHeading
                  className={style.headerRating}
                  sortKey="userRating"
                  currentSortKey={sortKey}
                  currentOrderKey={orderKey}
                  label="Rating"
                  handleSortCallback={handleSortList}
                />
              )}
            </>
          )}

          {variant === 'playlists' && (
            <>
              <SortableHeading
                defaultKey
                sortKey="title"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Title"
                handleSortCallback={handleSortList}
                style={{
                  gridColumn: '1 / span 2',
                }}
              />
              <SortableHeading
                sortKey="totalTracks"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Tracks"
                handleSortCallback={handleSortList}
              />
              <SortableHeading
                sortKey="duration"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Duration"
                handleSortCallback={handleSortList}
              />
              <SortableHeading
                sortKey="addedAt"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Added"
                handleSortCallback={handleSortList}
              />
              <SortableHeading
                sortKey="lastPlayed"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Last Played"
                handleSortCallback={handleSortList}
              />
              {optionShowStarRatings && (
                <SortableHeading
                  className={style.headerRating}
                  sortKey="userRating"
                  currentSortKey={sortKey}
                  currentOrderKey={orderKey}
                  label="Rating"
                  handleSortCallback={handleSortList}
                />
              )}
            </>
          )}

          {(variant === 'artistCollections' || variant === 'albumCollections') && (
            <>
              <SortableHeading
                defaultKey
                sortKey="title"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Title"
                handleSortCallback={handleSortList}
                style={{
                  gridColumn: '1 / span 2',
                }}
              />
              <SortableHeading
                sortKey="addedAt"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Added"
                handleSortCallback={handleSortList}
              />
              {optionShowStarRatings && (
                <SortableHeading
                  className={style.headerRating}
                  sortKey="userRating"
                  currentSortKey={sortKey}
                  currentOrderKey={orderKey}
                  label="Rating"
                  handleSortCallback={handleSortList}
                />
              )}
            </>
          )}

          {(variant === 'folders' ||
            variant === 'artistGenres' ||
            variant === 'albumGenres' ||
            variant === 'artistMoods' ||
            variant === 'albumMoods' ||
            variant === 'artistStyles' ||
            variant === 'albumStyles') && (
            <>
              <SortableHeading
                defaultKey
                sortKey="title"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Title"
                handleSortCallback={handleSortList}
                style={{
                  gridColumn: '1 / span 2',
                }}
              />
              <div></div>
            </>
          )}

          {variant === 'albumTracks' && (
            <>
              <SortableHeading
                className={style.labelCenter}
                sortKey="sortOrder"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="#"
                handleSortCallback={handleSortTracks}
                showArrows={false}
              />
              <SortableHeading
                sortKey="title"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Title"
                handleSortCallback={handleSortTracks}
              />
              <SortableHeading
                sortKey="artist"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Artist"
                handleSortCallback={handleSortTracks}
              />
              {optionShowStarRatings && (
                <SortableHeading
                  className={style.headerRating}
                  sortKey="userRating"
                  currentSortKey={sortKey}
                  currentOrderKey={orderKey}
                  label="Rating"
                  handleSortCallback={handleSortTracks}
                />
              )}
              <SortableHeading
                sortKey="duration"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
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
                currentOrderKey={orderKey}
                label="#"
                handleSortCallback={handleSortTracks}
                showArrows={false}
              />
              <SortableHeading
                sortKey="title"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Title"
                handleSortCallback={handleSortTracks}
                style={{
                  gridColumn: '2 / span 2',
                }}
              />
              <SortableHeading
                sortKey="artist"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Artist"
                handleSortCallback={handleSortTracks}
              />
              <SortableHeading
                sortKey="album"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Album"
                handleSortCallback={handleSortTracks}
              />
              {optionShowStarRatings && (
                <SortableHeading
                  className={style.headerRating}
                  sortKey="userRating"
                  currentSortKey={sortKey}
                  currentOrderKey={orderKey}
                  label="Rating"
                  handleSortCallback={handleSortTracks}
                />
              )}
              <SortableHeading
                sortKey="duration"
                currentSortKey={sortKey}
                currentOrderKey={orderKey}
                label="Duration"
                handleSortCallback={handleSortTracks}
              />
            </>
          )}
        </div>

        <div className={style.entries}>
          {(variant === 'artists' || variant === 'artistCollectionItems') && <ListArtists entries={entries} />}
          {(variant === 'albums' || variant === 'albumCollectionItems') && <ListAlbums entries={entries} />}
          {variant === 'playlists' && <ListPlaylists entries={entries} />}

          {(variant === 'artistCollections' || variant === 'albumCollections') && (
            <ListArtistCollections entries={entries} />
          )}

          {variant === 'folders' && (
            <ListGenresMoodsStyles entryKey={'folderId'} entries={entries} icon={'FolderIcon'} />
          )}

          {variant === 'artistGenres' && (
            <ListGenresMoodsStyles entryKey={'genreId'} entries={entries} icon={'ArtistGenresIcon'} />
          )}
          {variant === 'albumGenres' && (
            <ListGenresMoodsStyles entryKey={'genreId'} entries={entries} icon={'AlbumGenresIcon'} />
          )}

          {variant === 'artistMoods' && (
            <ListGenresMoodsStyles entryKey={'moodId'} entries={entries} icon={'ArtistMoodsIcon'} />
          )}
          {variant === 'albumMoods' && (
            <ListGenresMoodsStyles entryKey={'moodId'} entries={entries} icon={'AlbumMoodsIcon'} />
          )}

          {variant === 'artistStyles' && (
            <ListGenresMoodsStyles entryKey={'styleId'} entries={entries} icon={'ArtistStylesIcon'} />
          )}
          {variant === 'albumStyles' && (
            <ListGenresMoodsStyles entryKey={'styleId'} entries={entries} icon={'AlbumStylesIcon'} />
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

const SortableHeading = ({
  className,
  defaultKey,
  sortKey,
  currentSortKey,
  currentOrderKey,
  label,
  handleSortCallback,
  showArrows = true,
  ...props
}) => {
  const isDefault = defaultKey && currentSortKey === sortKey && currentOrderKey === 'asc';
  const isAsc = !isDefault && currentSortKey === sortKey && currentOrderKey === 'asc';
  const isDesc = !isDefault && currentSortKey === sortKey && currentOrderKey === 'desc';

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSortCallback(event);
    }
  };

  return (
    <div
      className={className}
      onClick={handleSortCallback}
      onKeyDown={handleKeyDown}
      data-sort={sortKey}
      tabIndex={0}
      {...props}
    >
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
        {/* <div className={clsx(style.genre, { 'text-trim': !optionShowFullTitles })}>{entry.genre}</div> */}
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

const ListGenresMoodsStyles = ({ entryKey, entries, icon }) => {
  return entries.map((entry) => <GenresMoodsStylesEntry key={entry[entryKey]} entry={entry} icon={icon} />);
};

const GenresMoodsStylesEntry = ({ entry, icon, trackList }) => {
  const optionShowFullTitles = useSelector(({ sessionModel }) => sessionModel.optionShowFullTitles);

  return (
    <NavLink className={style.entry} to={entry.link}>
      {trackList && <div></div>}
      <div className={clsx(style.thumb, style.thumbFolder)}>
        <span className={style.thumbIcon}>
          <Icon icon={icon} cover stroke strokeWidth={1.2} />
        </span>
      </div>
      <div className={clsx(style.title, { 'text-trim': !optionShowFullTitles })}>{entry.title}</div>
      <div></div>
    </NavLink>
  );
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

    if (entry.folderId) {
      return (
        <GenresMoodsStylesEntry
          key={entry.folderId}
          entry={entry}
          entryKey={'folderId'}
          icon={'FolderIcon'}
          trackList={true}
        />
      );
    }

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
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              doPlay(true);
            }
          }}
          tabIndex={0}
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

          {variant === 'playlistTracks' && (
            <div className={style.thumb}>
              {entry.thumb && <img src={entry.thumb} alt={entry.title} loading="lazy" />}
            </div>
          )}

          <div className={clsx(style.title, { 'text-trim': !optionShowFullTitles })}>{entry.title}</div>

          <div className={clsx(style.artist, { 'text-trim': !optionShowFullTitles })}>
            {entry.artistLink && (
              <NavLink to={entry.artistLink} tabIndex={-1}>
                {entry.artist}
              </NavLink>
            )}
            {!entry.artistLink && entry.artist}
          </div>

          {variant === 'playlistTracks' && (
            <div className={clsx(style.album, { 'text-trim': !optionShowFullTitles })}>
              {entry.albumLink && (
                <NavLink to={entry.albumLink} tabIndex={-1}>
                  {entry.album}{' '}
                </NavLink>
              )}
              {!entry.albumLink && entry.album}
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
