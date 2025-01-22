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

const AlbumMoodDetail = () => {
  const { moodId, libraryId } = useParams();

  const allAlbumMoods = useSelector(({ appModel }) => appModel.allAlbumMoods);
  const currentAlbumMood = allAlbumMoods?.filter((mood) => mood.moodId === moodId)[0];

  const allAlbumMoodItems = useSelector(({ appModel }) => appModel.allAlbumMoodItems);
  const currentAlbumMoodItems = allAlbumMoodItems[libraryId + '-' + moodId];

  const moodThumb = currentAlbumMood?.thumb;
  const moodTitle = currentAlbumMood?.title;

  useEffect(() => {
    plex.getAllAlbumMoods();
    plex.getAlbumMoodItems(libraryId, moodId);
  }, [moodId, libraryId]);

  return (
    <>
      {currentAlbumMood && (
        <TitleHeading
          thumb={moodThumb}
          title={moodTitle}
          subtitle={
            currentAlbumMoodItems ? (
              currentAlbumMoodItems?.length + ' Album' + (currentAlbumMoodItems?.length !== 1 ? 's' : '')
            ) : (
              <>&nbsp;</>
            )
          }
          icon={'AlbumMoodsIcon'}
        />
      )}
      {!(currentAlbumMood && currentAlbumMoodItems) && <Loading forceVisible inline />}
      {currentAlbumMood && currentAlbumMoodItems && <ListCards variant="albums" entries={currentAlbumMoodItems} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumMoodDetail;
