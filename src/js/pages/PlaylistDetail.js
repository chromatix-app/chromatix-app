// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ListTracks, Loading, StarRating, TitleHeading } from 'js/components';
import { useGetPlaylistDetail } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistDetail = () => {
  const { libraryId, playlistId } = useParams();

  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const {
    playlistInfo,
    playlistThumb,
    playlistTitle,
    playlistTrackCount,
    playlistDurationString,
    playlistRating,
    playlistTracks,
    playlistOrder,
    playlistSortKey,
  } = useGetPlaylistDetail({
    libraryId,
    playlistId,
  });

  const doPlay = (isShuffle) => {
    dispatch.playerModel.playerLoadPlaylist({
      playlistId,
      isShuffle,
      playingOrder: playlistOrder,
      trackIndex: playlistOrder ? playlistOrder[0] : 0,
    });
  };

  return (
    <>
      {playlistInfo && (
        <TitleHeading
          thumb={playlistThumb}
          title={playlistTitle}
          subtitle={playlistTracks ? playlistTrackCount + ' tracks' : <>&nbsp;</>}
          detail={
            playlistTracks ? (
              <>
                {playlistDurationString}
                {playlistDurationString && optionShowStarRatings && ' • '}
                {optionShowStarRatings && (
                  <StarRating
                    type="playlist"
                    ratingKey={playlistId}
                    rating={playlistRating}
                    inline
                    editable
                    alwaysVisible
                  />
                )}
              </>
            ) : (
              <>&nbsp;</>
            )
          }
          handlePlay={playlistTracks ? doPlay : null}
        />
      )}
      {!(playlistInfo && playlistTracks) && <Loading forceVisible inline />}
      {playlistInfo && playlistTracks && (
        <ListTracks
          variant="playlistTracks"
          playlistId={playlistId}
          entries={playlistTracks}
          playingOrder={playlistOrder}
          sortKey={playlistSortKey}
        />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistDetail;
