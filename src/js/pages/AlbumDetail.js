// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useParams } from 'react-router-dom';

import { ListTableV2, Loading, StarRating, TitleHeading } from 'js/components';
import { useGetAlbumDetail } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumDetail = () => {
  const { libraryId, albumId } = useParams();

  const dispatch = useDispatch();

  const {
    albumInfo,
    albumThumb,
    albumTitle,
    albumArtist,
    albumReleaseDate,
    albumDiscCount,
    albumTrackCount,
    albumDurationString,
    albumRating,
    albumArtistLink,
    albumTracks,
    albumOrder,
    albumSortString,
  } = useGetAlbumDetail({
    libraryId,
    albumId,
  });

  const doPlay = (isShuffle) => {
    dispatch.playerModel.playerLoadAlbum({
      albumId,
      isShuffle,
      playingOrder: albumOrder,
      trackIndex: albumOrder ? albumOrder[0] : 0,
    });
  };

  if (!albumInfo) {
    return <Loading forceVisible inline showOffline />;
  }

  const isLoading = !albumTracks;
  const isEmptyList = !isLoading && albumTracks?.length === 0;
  const isListView = !isLoading && !isEmptyList;

  return (
    <>
      {(isLoading || isEmptyList) && (
        <Title
          albumArtist={albumArtist}
          albumArtistLink={albumArtistLink}
          albumDurationString={albumDurationString}
          albumId={albumId}
          albumRating={albumRating}
          albumReleaseDate={albumReleaseDate}
          albumThumb={albumThumb}
          albumTitle={albumTitle}
          albumTrackCount={albumTrackCount}
          albumTracks={albumTracks}
          doPlay={doPlay}
          isListView={isListView}
          libraryId={libraryId}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isListView && (
        <ListTableV2
          variant="albumTracks"
          albumId={albumId}
          discCount={albumDiscCount}
          entries={albumTracks}
          playingOrder={albumOrder}
          sortString={albumSortString}
        >
          <Title
            albumArtist={albumArtist}
            albumArtistLink={albumArtistLink}
            albumDurationString={albumDurationString}
            albumId={albumId}
            albumRating={albumRating}
            albumReleaseDate={albumReleaseDate}
            albumThumb={albumThumb}
            albumTitle={albumTitle}
            albumTrackCount={albumTrackCount}
            albumTracks={albumTracks}
            doPlay={doPlay}
            isListView={isListView}
            libraryId={libraryId}
          />
        </ListTableV2>
      )}
    </>
  );
};

const Title = ({
  albumArtist,
  albumArtistLink,
  albumDurationString,
  albumId,
  albumRating,
  albumReleaseDate,
  albumThumb,
  albumTitle,
  albumTrackCount,
  albumTracks,
  doPlay,
  isListView,
  libraryId,
}) => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  return (
    <TitleHeading
      key={libraryId + '-' + albumId}
      thumb={albumThumb}
      title={albumTitle}
      subtitle={
        albumArtist && (
          <NavLink to={albumArtistLink} draggable="false">
            {albumArtist}
          </NavLink>
        )
      }
      detail={
        albumTracks ? (
          <>
            {albumReleaseDate}
            {albumReleaseDate && albumTrackCount && ' • '}
            {albumTrackCount} track{albumTrackCount !== 1 && 's'}
            {(albumReleaseDate || albumTrackCount) && albumDurationString && ' • '}
            {albumDurationString}
            {(albumReleaseDate || albumTrackCount || albumDurationString) && optionShowStarRatings && ' • '}
            {optionShowStarRatings && (
              <StarRating
                variant="title"
                type="album"
                ratingKey={albumId}
                rating={albumRating}
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
      handlePlay={albumTracks && albumTracks.length > 0 ? doPlay : null}
      padding={!isListView}
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumDetail;
