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

const AlbumMoodDetail = () => {
  const { moodId, libraryId } = useParams();

  const allAlbumMoods = useSelector(({ appModel }) => appModel.allAlbumMoods);
  const currentAlbumMood = allAlbumMoods?.filter((mood) => mood.moodId === moodId)[0];

  const allAlbumMoodItems = useSelector(({ appModel }) => appModel.allAlbumMoodItems);
  const currentAlbumMoodItems = allAlbumMoodItems[libraryId + '-' + moodId];

  const moodThumb = currentAlbumMood?.thumb;
  const moodTitle = currentAlbumMood?.title;
  const moodRating = currentAlbumMood?.userRating;

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
          detail={moodRating && <StarRating rating={moodRating} size={13} inline />}
          subtitle={
            currentAlbumMoodItems ? (
              currentAlbumMoodItems?.length + ' Album' + (currentAlbumMoodItems?.length !== 1 ? 's' : '')
            ) : (
              <>&nbsp;</>
            )
          }
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
