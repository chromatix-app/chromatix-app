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

const AlbumMoodList = () => {
  const allAlbumMoods = useSelector(({ appModel }) => appModel.allAlbumMoods);

  useEffect(() => {
    plex.getAllAlbumMoods();
  }, []);

  return (
    <>
      <TitleHeading
        title="Album Moods"
        subtitle={
          allAlbumMoods ? allAlbumMoods?.length + ' Album Mood' + (allAlbumMoods?.length !== 1 ? 's' : '') : <>&nbsp;</>
        }
      />
      {!allAlbumMoods && <Loading forceVisible inline />}
      {allAlbumMoods && <ListCards variant="albumMoods" entries={allAlbumMoods} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumMoodList;
