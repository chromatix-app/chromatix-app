// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useParams } from 'react-router-dom';
import moment from 'moment';

import { ListTracks, Loading, StarRating, TitleHeading } from 'js/components';
import { durationToStringLong } from 'js/utils';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumDetail = () => {
  const { albumId, libraryId } = useParams();

  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums);
  const currentAlbum = allAlbums?.filter((album) => album.albumId === albumId)[0];

  const allAlbumTracks = useSelector(({ appModel }) => appModel.allAlbumTracks);
  const currentAlbumTracks = allAlbumTracks[libraryId + '-' + albumId];

  const albumThumb = currentAlbum?.thumb;
  const albumTitle = currentAlbum?.title;
  const albumArtist = currentAlbum?.artist;
  const albumRelease = currentAlbum?.releaseDate ? moment(currentAlbum?.releaseDate).format('YYYY') : null;
  const albumTracks = currentAlbumTracks?.length;
  const albumDurationMillisecs = currentAlbumTracks?.reduce((acc, track) => acc + track.duration, 0);
  const albumDurationString = durationToStringLong(albumDurationMillisecs);
  const albumRating = currentAlbum?.userRating;

  const artistLink = currentAlbum?.artistLink;

  const doPlay = (isShuffle) => {
    dispatch.playerModel.playerLoadAlbum({ albumId, isShuffle });
  };

  useEffect(() => {
    plex.getAllAlbums();
    plex.getAlbumTracks(libraryId, albumId);
  }, [albumId, libraryId]);

  useEffect(() => {
    if (allAlbums && !currentAlbum) {
      plex.getAlbumDetails(libraryId, albumId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAlbums, currentAlbum]);

  return (
    <>
      {currentAlbum && (
        <TitleHeading
          thumb={albumThumb}
          title={albumTitle}
          subtitle={albumArtist && <NavLink to={artistLink}>{albumArtist}</NavLink>}
          detail={
            currentAlbumTracks ? (
              <>
                {albumRelease}
                {albumRelease && albumTracks && ' • '}
                {albumTracks} track{albumTracks !== 1 && 's'}
                {(albumRelease || albumTracks) && albumDurationString && ' • '}
                {albumDurationString}
                {(albumRelease || albumTracks || albumDurationString) && optionShowStarRatings && ' • '}
                {optionShowStarRatings && (
                  <StarRating type="album" ratingKey={albumId} rating={albumRating} inline editable alwaysVisible />
                )}
              </>
            ) : (
              <>&nbsp;</>
            )
          }
          handlePlay={currentAlbumTracks ? doPlay : null}
        />
      )}
      {!(currentAlbum && currentAlbumTracks) && <Loading forceVisible inline />}
      {currentAlbum && currentAlbumTracks && (
        <ListTracks variant="albums" albumId={albumId} entries={currentAlbumTracks} />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumDetail;
