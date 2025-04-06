// ======================================================================
// IMPORTS
// ======================================================================

import React from 'react';
import { useSelector } from 'react-redux';
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
    colOptions,

    artistAlbums,
    artistRelated,
    artistCompilations,
    sortedArtistAlbums,

    artistReleasesTotal,

    viewArtistAlbums,
    sortArtistAlbums,
    orderArtistAlbums,

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

  const isLoading = !artistInfo || !artistAlbums || !artistRelated || !artistCompilations;
  const isEmptyList =
    !isLoading && artistAlbums?.length === 0 && artistRelated?.length === 0 && artistCompilations?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewArtistAlbums === 'grid';
  const isListView = !isLoading && !isEmptyList && viewArtistAlbums === 'list';

  return (
    <>
      {(isLoading || isEmptyList || isGridView) && (
        <Title
          artistCountry={artistCountry}
          artistGenre={artistGenre}
          artistId={artistId}
          artistName={artistName}
          artistRating={artistRating}
          artistReleasesTotal={artistReleasesTotal}
          artistThumb={artistThumb}
          colOptions={colOptions}
          isListView={isListView}
          isLoading={isLoading}
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
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && (
        <>
          {artistAlbums && artistAlbums.length > 0 && (
            <>
              <TitleSection title="Albums" />
              <ListCards variant="albums" entries={artistAlbums} />
            </>
          )}
          {artistRelated &&
            artistRelated.map((entry, index) => (
              <React.Fragment key={index}>
                <TitleSection title={entry.title} />
                <ListCards variant="albums" entries={entry.related} />
              </React.Fragment>
            ))}
          {artistCompilations && artistCompilations.length > 0 && (
            <>
              <TitleSection title="Appears On" />
              <ListCards variant="albums" entries={artistCompilations} />
            </>
          )}
        </>
      )}
      {isListView && (
        <ListTable
          variant="artistAlbums"
          groupBy="albumGroup"
          entries={sortedArtistAlbums}
          sortKey={sortArtistAlbums}
          orderKey={orderArtistAlbums}
          colOptions={colOptions}
        >
          <Title
            artistCountry={artistCountry}
            artistGenre={artistGenre}
            artistId={artistId}
            artistName={artistName}
            artistRating={artistRating}
            artistReleasesTotal={artistReleasesTotal}
            artistThumb={artistThumb}
            colOptions={colOptions}
            isListView={isListView}
            isLoading={isLoading}
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
  artistCountry,
  artistGenre,
  artistId,
  artistName,
  artistRating,
  artistReleasesTotal,
  artistThumb,
  colOptions,
  isListView,
  isLoading,
  libraryId,
  orderArtistAlbums,
  setColumnVisibility,
  setOrderArtistAlbums,
  setSortArtistAlbums,
  setViewArtistAlbums,
  sortArtistAlbums,
  viewArtistAlbums,
}) => {
  const optionShowStarRatings_Deprecated = useSelector(
    ({ sessionModel }) => sessionModel.optionShowStarRatings_Deprecated
  );

  return (
    <TitleHeading
      key={libraryId + '-' + artistId}
      thumb={artistThumb}
      title={artistName}
      subtitle={!isLoading ? artistReleasesTotal + ' Release' + (artistReleasesTotal > 1 ? 's' : '') : <>&nbsp;</>}
      detail={
        <>
          {artistCountry}
          {artistCountry && artistGenre && ' • '}
          {artistGenre}
          {(artistCountry || artistGenre) && optionShowStarRatings_Deprecated && ' • '}
          {optionShowStarRatings_Deprecated && (
            <StarRating
              variant="title"
              type="artist"
              ratingKey={artistId}
              rating={artistRating}
              editable
              alwaysVisible
            />
          )}
        </>
      }
      padding={!isListView}
      filters={
        <>
          <FilterToggle
            value={viewArtistAlbums}
            options={[
              { value: 'grid', label: 'Grid view' },
              { value: 'list', label: 'List view' },
            ]}
            setter={setViewArtistAlbums}
            icon={viewArtistAlbums === 'grid' ? 'GridIcon' : 'ListIcon'}
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
                  // only allow sorting by rating if the option is enabled
                  ...(optionShowStarRatings_Deprecated ? [{ value: 'userRating', label: 'Rating' }] : []),
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
            </>
          )}
          {viewArtistAlbums === 'list' && (
            <FilterMenu
              label="Options"
              icon="EllipsisCircleIcon"
              setter={setColumnVisibility}
              entries={[
                {
                  label: 'Title',
                  disabled: true,
                  checked: true,
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
                  label: 'Last Played',
                  attr: 'colArtistAlbumsLastPlayed',
                  checked: colOptions.lastPlayed,
                },
                {
                  label: 'Rating',
                  attr: 'colArtistAlbumsUserRating',
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
