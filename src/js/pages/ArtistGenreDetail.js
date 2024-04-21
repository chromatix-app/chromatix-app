// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ListCards, Loading, StarRating, TitleHeading } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistGenreDetail = () => {
  const { genreId, libraryId } = useParams();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const allArtistGenres = useSelector(({ appModel }) => appModel.allArtistGenres);
  const currentArtistGenre = allArtistGenres?.filter((genre) => genre.genreId === genreId)[0];

  const allArtistGenreItems = useSelector(({ appModel }) => appModel.allArtistGenreItems);
  const currentArtistGenreItems = allArtistGenreItems[libraryId + '-' + genreId];

  const genreThumb = currentArtistGenre?.thumb;
  const genreTitle = currentArtistGenre?.title;
  const genreRating = currentArtistGenre?.userRating;

  useEffect(() => {
    plex.getAllArtistGenres();
    plex.getArtistGenreItems(libraryId, genreId);
  }, [genreId, libraryId]);

  return (
    <>
      {currentArtistGenre && (
        <TitleHeading
          thumb={genreThumb}
          title={genreTitle}
          detail={optionShowStarRatings && genreRating && <StarRating rating={genreRating} size={13} inline />}
          subtitle={
            currentArtistGenreItems ? (
              currentArtistGenreItems?.length + ' Artist' + (currentArtistGenreItems?.length !== 1 ? 's' : '')
            ) : (
              <>&nbsp;</>
            )
          }
        />
      )}
      {!(currentArtistGenre && currentArtistGenreItems) && <Loading forceVisible inline />}
      {currentArtistGenre && currentArtistGenreItems && (
        <ListCards variant="artists" entries={currentArtistGenreItems} />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistGenreDetail;
