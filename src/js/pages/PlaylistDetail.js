// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ListTableV1, Loading, StarRating, TitleHeading } from 'js/components';
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
    playlistSortString,
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

  if (!playlistInfo) {
    return <Loading forceVisible inline showOffline />;
  }

  return (
    <>
      <TitleHeading
        key={libraryId + '-' + playlistId}
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
        showPlay={true}
        handlePlay={playlistTracks && playlistTracks.length > 0 ? doPlay : null}
      />
      {!playlistTracks && <Loading forceVisible inline showOffline />}
      {playlistTracks && (
        <ListTableV1
          variant="playlistTracks"
          playlistId={playlistId}
          entries={playlistTracks}
          playingOrder={playlistOrder}
          sortString={playlistSortString}
        />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistDetail;
