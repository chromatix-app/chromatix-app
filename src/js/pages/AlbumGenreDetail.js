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

const AlbumGenreDetail = () => {
  const { genreId, libraryId } = useParams();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const allAlbumGenres = useSelector(({ appModel }) => appModel.allAlbumGenres);
  const currentAlbumGenre = allAlbumGenres?.filter((genre) => genre.genreId === genreId)[0];

  const allAlbumGenreItems = useSelector(({ appModel }) => appModel.allAlbumGenreItems);
  const currentAlbumGenreItems = allAlbumGenreItems[libraryId + '-' + genreId];

  const genreThumb = currentAlbumGenre?.thumb;
  const genreTitle = currentAlbumGenre?.title;
  const genreRating = currentAlbumGenre?.userRating;

  useEffect(() => {
    plex.getAllAlbumGenres();
    plex.getAlbumGenreItems(libraryId, genreId);
  }, [genreId, libraryId]);

  return (
    <>
      {currentAlbumGenre && (
        <TitleHeading
          thumb={genreThumb}
          title={genreTitle}
          detail={optionShowStarRatings && genreRating && <StarRating rating={genreRating} size={13} inline />}
          subtitle={
            currentAlbumGenreItems ? (
              currentAlbumGenreItems?.length + ' Album' + (currentAlbumGenreItems?.length !== 1 ? 's' : '')
            ) : (
              <>&nbsp;</>
            )
          }
        />
      )}
      {!(currentAlbumGenre && currentAlbumGenreItems) && <Loading forceVisible inline />}
      {currentAlbumGenre && currentAlbumGenreItems && <ListCards variant="albums" entries={currentAlbumGenreItems} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumGenreDetail;
