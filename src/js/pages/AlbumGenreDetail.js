// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ListCards, Loading, TitleHeading } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumGenreDetail = () => {
  const { genreId, libraryId } = useParams();

  const allAlbumGenres = useSelector(({ appModel }) => appModel.allAlbumGenres);
  const currentAlbumGenre = allAlbumGenres?.filter((genre) => genre.genreId === genreId)[0];

  const allAlbumGenreItems = useSelector(({ appModel }) => appModel.allAlbumGenreItems);
  const currentAlbumGenreItems = allAlbumGenreItems[libraryId + '-' + genreId];

  const genreThumb = currentAlbumGenre?.thumb;
  const genreTitle = currentAlbumGenre?.title;

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
