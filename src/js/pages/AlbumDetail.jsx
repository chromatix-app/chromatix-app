// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';
import { NavLink, useParams } from 'react-router-dom';

import { Favourite, FilterMenu, ViewList, Loading, StarRating, TitleHeading } from 'js/components';
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
    albumIsFavourite,
    albumArtistLink,
    albumTracks,
    albumOrder,
    albumSortString,
    colOptions,
    setColumnVisibility,
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
          albumIsFavourite={albumIsFavourite}
          albumReleaseDate={albumReleaseDate}
          albumThumb={albumThumb}
          albumTitle={albumTitle}
          albumTrackCount={albumTrackCount}
          albumTracks={albumTracks}
          colOptions={colOptions}
          setColumnVisibility={setColumnVisibility}
          doPlay={doPlay}
          isListView={isListView}
          libraryId={libraryId}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isListView && (
        <ViewList
          variant="albumTracks"
          albumId={albumId}
          discCount={albumDiscCount}
          entries={albumTracks}
          playingOrder={albumOrder}
          sortString={albumSortString}
          colOptions={colOptions}
        >
          <Title
            albumArtist={albumArtist}
            albumArtistLink={albumArtistLink}
            albumDurationString={albumDurationString}
            albumId={albumId}
            albumRating={albumRating}
            albumIsFavourite={albumIsFavourite}
            albumReleaseDate={albumReleaseDate}
            albumThumb={albumThumb}
            albumTitle={albumTitle}
            albumTrackCount={albumTrackCount}
            albumTracks={albumTracks}
            colOptions={colOptions}
            setColumnVisibility={setColumnVisibility}
            doPlay={doPlay}
            isListView={isListView}
            libraryId={libraryId}
          />
        </ViewList>
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
  albumIsFavourite,
  albumReleaseDate,
  albumThumb,
  albumTitle,
  albumTrackCount,
  albumTracks,
  colOptions,
  setColumnVisibility,
  doPlay,
  isListView,
  libraryId,
}) => {
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
            {(albumReleaseDate || albumTrackCount || albumDurationString) && ' • '}
            <StarRating variant="title" type="album" ratingKey={albumId} rating={albumRating} editable />
            {' • '}
            <Favourite variant="title" type="album" itemId={albumId} isFavourite={albumIsFavourite} editable />
          </>
        ) : (
          <>&nbsp;</>
        )
      }
      showPlay={true}
      optionsMenu={
        <FilterMenu
          variant="Large"
          icon="CogIcon"
          iconStrokeWidth={1.2}
          setter={setColumnVisibility}
          entries={[
            {
              label: 'Title',
              disabled: true,
              checked: true,
            },
            {
              label: 'Artist',
              attr: 'colAlbumArtist',
              checked: colOptions.artist,
            },
            {
              label: 'Audio codec',
              attr: 'colAlbumCodec',
              checked: colOptions.codec,
            },
            {
              label: 'Bitrate',
              attr: 'colAlbumBitrate',
              checked: colOptions.bitrate,
            },
            {
              label: 'Duration',
              attr: 'colAlbumDuration',
              checked: colOptions.duration,
            },
            {
              label: 'Rating',
              attr: 'colAlbumUserRating',
              checked: colOptions.userRating,
            },
            {
              label: 'Favourite',
              attr: 'colAlbumIsFavourite',
              checked: colOptions.isFavourite,
            },
          ]}
        />
      }
      handlePlay={albumTracks && albumTracks.length > 0 ? doPlay : null}
      padding={!isListView}
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumDetail;
