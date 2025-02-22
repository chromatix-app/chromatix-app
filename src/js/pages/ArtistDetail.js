// ======================================================================
// IMPORTS
// ======================================================================

import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { FilterSelect, FilterToggle, ListCards, Loading, StarRating, TitleHeading, TitleSection } from 'js/components';
import { useGetArtistDetail } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistDetail = () => {
  const { libraryId, artistId } = useParams();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const {
    artistInfo,

    artistAlbums,
    artistRelated,
    artistCompilations,

    artistThumb,
    artistName,
    artistReleases,
    artistCountry,
    artistGenre,
    artistRating,

    viewArtistAlbums,
    sortArtistAlbums,
    orderArtistAlbums,

    // setViewArtistAlbums,
    setSortArtistAlbums,
    setOrderArtistAlbums,
  } = useGetArtistDetail({
    libraryId,
    artistId,
  });

  const gotArtistData = artistInfo && artistAlbums && artistRelated;

  if (!artistInfo) {
    return <Loading forceVisible inline showOffline />;
  }

  return (
    <>
      <TitleHeading
        key={libraryId + '-' + artistId}
        thumb={artistThumb}
        title={artistName}
        subtitle={gotArtistData ? artistReleases + ' Release' + (artistReleases > 1 ? 's' : '') : <>&nbsp;</>}
        detail={
          gotArtistData ? (
            <>
              {artistCountry}
              {artistCountry && artistGenre && ' • '}
              {artistGenre}
              {(artistCountry || artistGenre) && optionShowStarRatings && ' • '}
              {optionShowStarRatings && (
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
          ) : (
            <>&nbsp;</>
          )
        }
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
                    ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
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
          </>
        }
      />
      {!gotArtistData && <Loading forceVisible inline showOffline />}
      {gotArtistData && viewArtistAlbums === 'grid' && (
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
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistDetail;
