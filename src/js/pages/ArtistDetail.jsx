// ======================================================================
// IMPORTS
// ======================================================================

import { useParams } from 'react-router-dom';

import {
  Favourite,
  FilterMenu,
  FilterSelect,
  FilterToggle,
  ListCards,
  ListTable,
  Loading,
  StarRating,
  TitleHeading,
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
    artistIsFavourite,

    gridOptions,
    colOptions,
    colTrackOptions,

    sortedArtistAlbums,
    sortedArtistRelated,
    sortedArtistAppearances,

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

  // Check everything is loaded for album views
  const isLoading1 = !artistInfo || !sortedArtistAlbums || !sortedArtistRelated || !sortedArtistAppearances;

  // Check if everything is loaded for track views
  const isLoading2 = isLoading1 || (viewArtistAlbums === 'track' && !sortedArtistTracks);

  // Check if album view is empty
  const isEmptyList1 =
    !isLoading2 &&
    sortedArtistAlbums?.length === 0 &&
    sortedArtistRelated?.length === 0 &&
    sortedArtistAppearances?.length === 0;

  // Check if track view is empty
  const isEmptyList2 = !isLoading2 && sortedArtistTracks?.length === 0;

  const isGridView = !isLoading2 && !isEmptyList1 && viewArtistAlbums === 'grid';
  const isListView = !isLoading2 && !isEmptyList1 && viewArtistAlbums === 'list';
  const isTrackView = !isLoading2 && !isEmptyList1 && viewArtistAlbums === 'track';

  return (
    <>
      {(isLoading2 || isEmptyList1 || isEmptyList2) && (
        <Title
          artistAlbumsGroupByType={artistAlbumsGroupByType}
          artistCountry={artistCountry}
          artistGenre={artistGenre}
          artistId={artistId}
          artistName={artistName}
          artistRating={artistRating}
          artistIsFavourite={artistIsFavourite}
          artistReleasesTotal={artistReleasesTotal}
          artistThumb={artistThumb}
          artistTracksTotal={artistTracksTotal}
          colOptions={colOptions}
          gridOptions={gridOptions}
          isGridView={isGridView}
          isListView={isListView}
          isLoading1={isLoading1}
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
      {isLoading2 && <Loading forceVisible inline showOffline />}

      {isGridView && (
        <ListCards
          variant="artistAlbums"
          {...(artistAlbumsGroupByType ? { groupBy: 'albumGroup' } : { groupBy: 'releaseGroup' })}
          entries={sortedAllReleasesAndAppearances}
          showFavs={gridOptions.isFavourite}
          showRatings={gridOptions.userRating}
        >
          <Title
            artistAlbumsGroupByType={artistAlbumsGroupByType}
            artistCountry={artistCountry}
            artistGenre={artistGenre}
            artistId={artistId}
            artistName={artistName}
            artistRating={artistRating}
            artistIsFavourite={artistIsFavourite}
            artistReleasesTotal={artistReleasesTotal}
            artistThumb={artistThumb}
            artistTracksTotal={artistTracksTotal}
            colOptions={colOptions}
            gridOptions={gridOptions}
            isGridView={isGridView}
            isListView={isListView}
            isLoading1={isLoading1}
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
        </ListCards>
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
            artistIsFavourite={artistIsFavourite}
            artistReleasesTotal={artistReleasesTotal}
            artistThumb={artistThumb}
            artistTracksTotal={artistTracksTotal}
            colOptions={colOptions}
            gridOptions={gridOptions}
            isGridView={isGridView}
            isListView={isListView}
            isLoading1={isLoading1}
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
            artistIsFavourite={artistIsFavourite}
            artistReleasesTotal={artistReleasesTotal}
            artistThumb={artistThumb}
            artistTracksTotal={artistTracksTotal}
            colOptions={colTrackOptions}
            gridOptions={gridOptions}
            isGridView={isGridView}
            isListView={isListView}
            isLoading1={isLoading1}
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
  artistIsFavourite,
  artistReleasesTotal,
  artistThumb,
  artistTracksTotal,
  colOptions,
  gridOptions,
  isGridView,
  isListView,
  isLoading1,
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
  let subtitle = <>&nbsp;</>;
  // Track view count
  if (isTrackView && artistTracksTotal) {
    subtitle = artistTracksTotal + ' Track' + (artistTracksTotal > 1 ? 's' : '');
  }
  // Album view count
  else if (!isLoading1) {
    subtitle = artistReleasesTotal + ' Release' + (artistReleasesTotal > 1 ? 's' : '');
  }

  return (
    <TitleHeading
      key={libraryId + '-' + artistId}
      thumb={artistThumb}
      title={artistName}
      subtitle={subtitle}
      detail={
        <>
          {artistCountry}
          {artistCountry && artistGenre && ' • '}
          {artistGenre}
          {(artistCountry || artistGenre) && ' • '}
          <StarRating variant="title" type="artist" ratingKey={artistId} rating={artistRating} editable />
          {' • '}
          <Favourite variant="title" type="artist" itemId={artistId} isFavourite={artistIsFavourite} editable />
        </>
      }
      padding={!isGridView && !isListView && !isTrackView}
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
                  { value: 'isFavourite', label: 'Favourites' },
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
                  {
                    label: 'Show favourites',
                    attr: 'gridArtistAlbumsIsFavourite',
                    checked: gridOptions.isFavourite,
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
                  label: 'Favourite',
                  attr: 'colArtistAlbumsIsFavourite',
                  checked: colOptions.isFavourite,
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
                {
                  label: 'Favourite',
                  attr: 'colArtistTracksIsFavourite',
                  checked: colOptions.isFavourite,
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
