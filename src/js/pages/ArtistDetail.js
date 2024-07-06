// ======================================================================
// IMPORTS
// ======================================================================

import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ListCards, Loading, StarRating, TitleHeading, TitleSection } from 'js/components';
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
    artistThumb,
    artistName,
    artistReleases,
    artistCountry,
    artistGenre,
    artistRating,
  } = useGetArtistDetail({
    libraryId,
    artistId,
  });

  return (
    <>
      {artistInfo && (
        <TitleHeading
          thumb={artistThumb}
          title={artistName}
          subtitle={
            artistAlbums && artistRelated ? artistReleases + ' Release' + (artistReleases > 1 ? 's' : '') : <>&nbsp;</>
          }
          detail={
            artistAlbums && artistRelated ? (
              <>
                {artistCountry}
                {artistCountry && artistGenre && ' • '}
                {artistGenre}
                {(artistCountry || artistGenre) && optionShowStarRatings && ' • '}
                {optionShowStarRatings && (
                  <StarRating type="artist" ratingKey={artistId} rating={artistRating} inline editable alwaysVisible />
                )}
              </>
            ) : (
              <>&nbsp;</>
            )
          }
        />
      )}
      {!(artistInfo && artistAlbums && artistRelated) && <Loading forceVisible inline />}
      {artistInfo && artistAlbums && artistRelated && (
        <>
          {artistAlbums.length > 0 && (
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
        </>
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistDetail;
