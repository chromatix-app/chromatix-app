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

const ArtistMoodDetail = () => {
  const { moodId, libraryId } = useParams();

  const allArtistMoods = useSelector(({ appModel }) => appModel.allArtistMoods);
  const currentArtistMood = allArtistMoods?.filter((mood) => mood.moodId === moodId)[0];

  const allArtistMoodItems = useSelector(({ appModel }) => appModel.allArtistMoodItems);
  const currentArtistMoodItems = allArtistMoodItems[libraryId + '-' + moodId];

  const moodThumb = currentArtistMood?.thumb;
  const moodTitle = currentArtistMood?.title;

  useEffect(() => {
    plex.getAllArtistMoods();
    plex.getArtistMoodItems(libraryId, moodId);
  }, [moodId, libraryId]);

  return (
    <>
      {currentArtistMood && (
        <TitleHeading
          thumb={moodThumb}
          title={moodTitle}
          subtitle={
            currentArtistMoodItems ? (
              currentArtistMoodItems?.length + ' Artist' + (currentArtistMoodItems?.length !== 1 ? 's' : '')
            ) : (
              <>&nbsp;</>
            )
          }
        />
      )}
      {!(currentArtistMood && currentArtistMoodItems) && <Loading forceVisible inline />}
      {currentArtistMood && currentArtistMoodItems && <ListCards variant="artists" entries={currentArtistMoodItems} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistMoodDetail;
