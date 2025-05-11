// ======================================================================
// IMPORTS
// ======================================================================

import React from 'react';
import { useParams } from 'react-router-dom';

import {
  FilterMenu,
  FilterSelect,
  FilterToggle,
  ListCards,
  ListTable,
  Loading,
  StarRating,
  TitleHeading,
  TitleSection,
} from 'js/components';
import { useGetArtistDetail } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistDetail = () => {
  const { libraryId, artistId } = useParams();

  const {
    artistInfo,
    artistThumb,
    artistName,
    artistCountry,
    artistGenre,
    artistRating,
    gridOptions,
    colOptions,
    colTrackOptions,

    sortedArtistAlbums,
    sortedArtistRelated,
    sortedArtistAppearances,
    sortedAllReleases,
    sortedAllReleasesAndAppearances,
    sortedArtistTracks,
    sortedArtistTracksOrder,

    artistAlbumsGroupByType,

    artistReleasesTotal,
    artistTracksTotal,

    viewArtistAlbums,
    sortArtistAlbums,
    orderArtistAlbums,

    sortArtistTracks,
    orderArtistTracks,

    setViewArtistAlbums,
    setSortArtistAlbums,
    setOrderArtistAlbums,
    setColumnVisibility,
  } = useGetArtistDetail({
    libraryId,
    artistId,
  });

  if (!artistInfo) {
    return <Loading forceVisible inline showOffline />;
  }

  const isLoading1 =
    !artistInfo ||
    !sortedArtistAlbums ||
    !sortedArtistRelated ||
    !sortedArtistAppearances ||
    (viewArtistAlbums === 'track' && !sortedArtistTracks);
  const isLoading2 = !artistInfo || !sortedArtistAlbums || !sortedArtistRelated || !sortedArtistAppearances;
  const isEmptyList1 =
    !isLoading1 &&
    sortedArtistAlbums?.length === 0 &&
    sortedArtistRelated?.length === 0 &&
    sortedArtistAppearances?.length === 0;
  const isEmptyList2 = !isLoading1 && sortedArtistTracks?.length === 0;
  const isGridView = !isLoading1 && !isEmptyList1 && viewArtistAlbums === 'grid';
  const isListView = !isLoading1 && !isEmptyList1 && viewArtistAlbums === 'list';
  const isTrackView = !isLoading1 && !isEmptyList1 && viewArtistAlbums === 'track';

  return (
    <>
      {(isLoading1 || isEmptyList1 || isEmptyList2 || isGridView) && (
        <Title
          artistAlbumsGroupByType={artistAlbumsGroupByType}
          artistCountry={artistCountry}
          artistGenre={artistGenre}
          artistId={artistId}
          artistName={artistName}
          artistRating={artistRating}
          artistReleasesTotal={artistReleasesTotal}
          artistThumb={artistThumb}
          artistTracksTotal={artistTracksTotal}
          colOptions={colOptions}
          gridOptions={gridOptions}
          isListView={isListView}
          isLoading2={isLoading2}
          isTrackView={isTrackView}
          libraryId={libraryId}
          orderArtistAlbums={orderArtistAlbums}
          setColumnVisibility={setColumnVisibility}
          setOrderArtistAlbums={setOrderArtistAlbums}
          setSortArtistAlbums={setSortArtistAlbums}
          setViewArtistAlbums={setViewArtistAlbums}
          sortArtistAlbums={sortArtistAlbums}
          viewArtistAlbums={viewArtistAlbums}
        />
      )}
      {isLoading1 && <Loading forceVisible inline showOffline />}

      {isGridView && (
        <>
          {artistAlbumsGroupByType && (
            <>
              {sortedArtistAlbums && sortedArtistAlbums.length > 0 && (
                <>
                  <TitleSection title="Albums" />
                  <ListCards variant="albums" entries={sortedArtistAlbums} showRatings={gridOptions.userRating} />
                </>
              )}
              {sortedArtistRelated &&
                sortedArtistRelated.map((entry, index) => (
                  <React.Fragment key={index}>
                    <TitleSection title={entry.title} />
                    <ListCards variant="albums" entries={entry.related} showRatings={gridOptions.userRating} />
                  </React.Fragment>
                ))}
            </>
          )}
          {!artistAlbumsGroupByType && (
            <>
              {sortedAllReleases && sortedAllReleases.length > 0 && (
                <>
                  <ListCards variant="albums" entries={sortedAllReleases} showRatings={gridOptions.userRating} />
                </>
              )}
            </>
          )}
          {sortedArtistAppearances && sortedArtistAppearances.length > 0 && (
            <>
              <TitleSection title="Appears On" />
              <ListCards variant="albums" entries={sortedArtistAppearances} showRatings={gridOptions.userRating} />
            </>
          )}
        </>
      )}

      {isListView && (
        <ListTable
          variant="artistAlbums"
          {...(artistAlbumsGroupByType ? { groupBy: 'albumGroup' } : { groupBy: 'releaseGroup' })}
          entries={sortedAllReleasesAndAppearances}
          sortKey={sortArtistAlbums}
          orderKey={orderArtistAlbums}
          colOptions={colOptions}
        >
          <Title
            artistAlbumsGroupByType={artistAlbumsGroupByType}
            artistCountry={artistCountry}
            artistGenre={artistGenre}
            artistId={artistId}
            artistName={artistName}
            artistRating={artistRating}
            artistReleasesTotal={artistReleasesTotal}
            artistThumb={artistThumb}
            artistTracksTotal={artistTracksTotal}
            colOptions={colOptions}
            gridOptions={gridOptions}
            isListView={isListView}
            isLoading2={isLoading2}
            isTrackView={isTrackView}
            libraryId={libraryId}
            orderArtistAlbums={orderArtistAlbums}
            setColumnVisibility={setColumnVisibility}
            setOrderArtistAlbums={setOrderArtistAlbums}
            setSortArtistAlbums={setSortArtistAlbums}
            setViewArtistAlbums={setViewArtistAlbums}
            sortArtistAlbums={sortArtistAlbums}
            viewArtistAlbums={viewArtistAlbums}
          />
        </ListTable>
      )}

      {isTrackView && (
        <ListTable
          variant="artistTracks"
          // groupBy="albumGroup"
          artistId={artistId}
          artistName={artistName}
          entries={sortedArtistTracks}
          playingOrder={sortedArtistTracksOrder}
          sortKey={sortArtistTracks}
          orderKey={orderArtistTracks}
          colOptions={colTrackOptions}
        >
          <Title
            artistAlbumsGroupByType={artistAlbumsGroupByType}
            artistCountry={artistCountry}
            artistGenre={artistGenre}
            artistId={artistId}
            artistName={artistName}
            artistRating={artistRating}
            artistReleasesTotal={artistReleasesTotal}
            artistThumb={artistThumb}
            artistTracksTotal={artistTracksTotal}
            colOptions={colTrackOptions}
            gridOptions={gridOptions}
            isListView={isListView}
            isLoading2={isLoading2}
            isTrackView={isTrackView}
            libraryId={libraryId}
            orderArtistAlbums={orderArtistAlbums}
            setColumnVisibility={setColumnVisibility}
            setOrderArtistAlbums={setOrderArtistAlbums}
            setSortArtistAlbums={setSortArtistAlbums}
            setViewArtistAlbums={setViewArtistAlbums}
            sortArtistAlbums={sortArtistAlbums}
            viewArtistAlbums={viewArtistAlbums}
          />
        </ListTable>
      )}
    </>
  );
};

const Title = ({
  artistAlbumsGroupByType,
  artistCountry,
  artistGenre,
  artistId,
  artistName,
  artistRating,
  artistReleasesTotal,
  artistThumb,
  artistTracksTotal,
  colOptions,
  gridOptions,
  isListView,
  isLoading2,
  isTrackView,
  libraryId,
  orderArtistAlbums,
  setColumnVisibility,
  setOrderArtistAlbums,
  setSortArtistAlbums,
  setViewArtistAlbums,
  sortArtistAlbums,
  viewArtistAlbums,
}) => {
  return (
    <TitleHeading
      key={libraryId + '-' + artistId}
      thumb={artistThumb}
      title={artistName}
      subtitle={
        isTrackView && artistTracksTotal ? (
          artistTracksTotal + ' Track' + (artistTracksTotal > 1 ? 's' : '')
        ) : !isLoading2 ? (
          artistReleasesTotal + ' Release' + (artistReleasesTotal > 1 ? 's' : '')
        ) : (
          <>&nbsp;</>
        )
      }
      detail={
        <>
          {artistCountry}
          {artistCountry && artistGenre && ' • '}
          {artistGenre}
          {(artistCountry || artistGenre) && ' • '}
          <StarRating variant="title" type="artist" ratingKey={artistId} rating={artistRating} editable alwaysVisible />
        </>
      }
      padding={!isListView && !isTrackView}
      filters={
        <>
          {/* <FilterToggle
            value={viewArtistAlbums}
            options={[
              { value: 'grid', label: 'Grid view' },
              { value: 'list', label: 'List view' },
            ]}
            setter={setViewArtistAlbums}
            icon={viewArtistAlbums === 'grid' ? 'GridIcon' : 'ListIcon'}
          /> */}
          <FilterSelect
            value={viewArtistAlbums}
            options={[
              { value: 'grid', label: 'Grid view' },
              { value: 'list', label: 'List view' },
              { value: 'track', label: 'Track view' },
            ]}
            setter={setViewArtistAlbums}
            icon={
              viewArtistAlbums === 'grid'
                ? 'GridIcon'
                : viewArtistAlbums === 'list'
                  ? 'ListIcon'
                  : 'MusicNoteSingleIcon'
            }
          />
          {viewArtistAlbums === 'grid' && (
            <>
              <FilterSelect
                value={sortArtistAlbums}
                options={[
                  { value: 'title', label: 'Alphabetical' },
                  // { value: 'artist', label: 'Artist' },
                  // { value: 'artist-asc-releaseDate-asc', label: 'Artist, oldest release first' },
                  // { value: 'artist-asc-releaseDate-desc', label: 'Artist, newest release first' },
                  { value: 'addedAt', label: 'Date added' },
                  { value: 'lastPlayed', label: 'Date played' },
                  { value: 'releaseDate', label: 'Date released' },
                  { value: 'userRating', label: 'Rating' },
                ]}
                setter={setSortArtistAlbums}
              />
              <FilterToggle
                value={orderArtistAlbums}
                options={[
                  { value: 'asc', label: 'Ascending' },
                  { value: 'desc', label: 'Descending' },
                ]}
                setter={setOrderArtistAlbums}
                icon={orderArtistAlbums === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
              />
              <FilterMenu
                label="Options"
                icon="CogIcon"
                setter={setColumnVisibility}
                entries={[
                  {
                    label: 'Group by type',
                    attr: 'artistAlbumsGroupByType',
                    checked: artistAlbumsGroupByType,
                  },
                  {
                    label: 'Show star ratings',
                    attr: 'gridArtistAlbumsUserRating',
                    checked: gridOptions.userRating,
                  },
                ]}
              />
            </>
          )}
          {viewArtistAlbums === 'list' && (
            <FilterMenu
              label="Options"
              icon="CogIcon"
              setter={setColumnVisibility}
              entries={[
                // {
                //   variant: 'sectionHeading',
                //   label: 'Columns',
                // },
                {
                  label: 'Title',
                  disabled: true,
                  checked: true,
                },
                {
                  label: 'Genre',
                  attr: 'colArtistAlbumsGenre',
                  checked: colOptions.genre,
                },
                {
                  label: 'Released',
                  attr: 'colArtistAlbumsReleaseDate',
                  checked: colOptions.releaseDate,
                },
                {
                  label: 'Added',
                  attr: 'colArtistAlbumsAddedAt',
                  checked: colOptions.addedAt,
                },
                {
                  label: 'Last played',
                  attr: 'colArtistAlbumsLastPlayed',
                  checked: colOptions.lastPlayed,
                },
                {
                  label: 'Rating',
                  attr: 'colArtistAlbumsUserRating',
                  checked: colOptions.userRating,
                },
                {
                  variant: 'divider',
                },
                // {
                //   variant: 'sectionHeading',
                //   label: 'Options',
                // },
                {
                  label: 'Group by type',
                  attr: 'artistAlbumsGroupByType',
                  checked: artistAlbumsGroupByType,
                },
              ]}
            />
          )}
          {viewArtistAlbums === 'track' && (
            <FilterMenu
              label="Options"
              icon="CogIcon"
              setter={setColumnVisibility}
              entries={[
                // {
                //   variant: 'sectionHeading',
                //   label: 'Columns',
                // },
                {
                  label: 'Artwork',
                  attr: 'colArtistTracksArtwork',
                  checked: colOptions.artwork,
                },
                {
                  label: 'Title',
                  disabled: true,
                  checked: true,
                },
                {
                  label: 'Artist',
                  attr: 'colArtistTracksArtist',
                  checked: colOptions.artist,
                },
                {
                  label: 'Album',
                  attr: 'colArtistTracksAlbum',
                  checked: colOptions.album,
                },
                {
                  label: 'Released',
                  attr: 'colArtistTracksReleaseDate',
                  checked: colOptions.releaseDate,
                },
                {
                  label: 'Audio codec',
                  attr: 'colArtistTracksCodec',
                  checked: colOptions.codec,
                },
                {
                  label: 'Bitrate',
                  attr: 'colArtistTracksBitrate',
                  checked: colOptions.bitrate,
                },
                {
                  label: 'Duration',
                  attr: 'colArtistTracksDuration',
                  checked: colOptions.duration,
                },
                {
                  label: 'Rating',
                  attr: 'colArtistTracksUserRating',
                  checked: colOptions.userRating,
                },
              ]}
            />
          )}
        </>
      }
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistDetail;
