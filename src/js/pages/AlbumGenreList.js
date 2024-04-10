// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ListCards, Loading, TitleHeading } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumGenreList = () => {
  const allAlbumGenres = useSelector(({ appModel }) => appModel.allAlbumGenres);

  useEffect(() => {
    plex.getAllAlbumGenres();
  }, []);

  return (
    <>
      <TitleHeading
        title="Album Genres"
        subtitle={
          allAlbumGenres ? (
            allAlbumGenres?.length + ' Album Genre' + (allAlbumGenres?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
      />
      {!allAlbumGenres && <Loading forceVisible inline />}
      {allAlbumGenres && <ListCards entries={allAlbumGenres} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumGenreList;
