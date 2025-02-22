// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ListTableV2, Loading, StarRating, TitleHeading } from 'js/components';
import { useGetPlaylistDetail } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistDetail = () => {
  const { libraryId, playlistId } = useParams();

  const dispatch = useDispatch();

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

  const isLoading = !playlistTracks;
  const isEmptyList = !isLoading && playlistTracks?.length === 0;
  const isListView = !isLoading && !isEmptyList;

  return (
    <>
      {(isLoading || isEmptyList) && (
        <Title
          doPlay={doPlay}
          isListView={isListView}
          libraryId={libraryId}
          playlistDurationString={playlistDurationString}
          playlistId={playlistId}
          playlistRating={playlistRating}
          playlistThumb={playlistThumb}
          playlistTitle={playlistTitle}
          playlistTrackCount={playlistTrackCount}
          playlistTracks={playlistTracks}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isListView && (
        <ListTableV2
          variant="playlistTracks"
          playlistId={playlistId}
          entries={playlistTracks}
          playingOrder={playlistOrder}
          sortString={playlistSortString}
        >
          <Title
            doPlay={doPlay}
            isListView={isListView}
            libraryId={libraryId}
            playlistDurationString={playlistDurationString}
            playlistId={playlistId}
            playlistRating={playlistRating}
            playlistThumb={playlistThumb}
            playlistTitle={playlistTitle}
            playlistTrackCount={playlistTrackCount}
            playlistTracks={playlistTracks}
          />
        </ListTableV2>
      )}
    </>
  );
};

const Title = ({
  doPlay,
  isListView,
  libraryId,
  playlistDurationString,
  playlistId,
  playlistRating,
  playlistThumb,
  playlistTitle,
  playlistTrackCount,
  playlistTracks,
}) => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  return (
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
      padding={!isListView}
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistDetail;
