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

const ArtistMoodList = () => {
  const allArtistMoods = useSelector(({ appModel }) => appModel.allArtistMoods);

  useEffect(() => {
    plex.getAllArtistMoods();
  }, []);

  return (
    <>
      <TitleHeading
        title="Artist Moods"
        subtitle={
          allArtistMoods ? (
            allArtistMoods?.length + ' Artist Mood' + (allArtistMoods?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
      />
      {!allArtistMoods && <Loading forceVisible inline />}
      {allArtistMoods && <ListCards variant="artistMoods" entries={allArtistMoods} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistMoodList;
