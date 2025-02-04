// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useParams } from 'react-router-dom';

import { ListTable, Loading, StarRating, TitleHeading } from 'js/components';
import { useGetAlbumDetail } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumDetail = () => {
  const { libraryId, albumId } = useParams();

  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

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

  return (
    <>
      {albumInfo && (
        <TitleHeading
          key={libraryId + '-' + albumId}
          thumb={albumThumb}
          title={albumTitle}
          subtitle={albumArtist && <NavLink to={albumArtistLink}>{albumArtist}</NavLink>}
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
                  <StarRating type="album" ratingKey={albumId} rating={albumRating} inline editable alwaysVisible />
                )}
              </>
            ) : (
              <>&nbsp;</>
            )
          }
          showPlay={true}
          handlePlay={albumTracks && albumTracks.length > 0 ? doPlay : null}
        />
      )}
      {!(albumInfo && albumTracks) && <Loading forceVisible inline />}
      {albumInfo && albumTracks && (
        <ListTable
          variant="albumTracks"
          albumId={albumId}
          discCount={albumDiscCount}
          entries={albumTracks}
          playingOrder={albumOrder}
          sortString={albumSortString}
        />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumDetail;
