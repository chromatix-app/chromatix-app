// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { FilterMenu, ListTable, Loading, StarRating, TitleHeading } from 'js/components';
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
    colOptions,
    setColumnVisibility,
  } = useGetPlaylistDetail({
    libraryId,
    playlistId,
  });

  console.log(playlistSortString);

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
          colOptions={colOptions}
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
          setColumnVisibility={setColumnVisibility}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isListView && (
        <ListTable
          variant="playlistTracks"
          playlistId={playlistId}
          entries={playlistTracks}
          playingOrder={playlistOrder}
          sortString={playlistSortString}
          colOptions={colOptions}
        >
          <Title
            colOptions={colOptions}
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
            setColumnVisibility={setColumnVisibility}
          />
        </ListTable>
      )}
    </>
  );
};

const Title = ({
  colOptions,
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
  setColumnVisibility,
}) => {
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
            {playlistDurationString && ' • '}

            <StarRating
              variant="title"
              type="playlist"
              ratingKey={playlistId}
              rating={playlistRating}
              editable
              alwaysVisible
            />
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
            // {
            //   label: 'Artwork',
            //   attr: 'colPlaylistArtwork',
            //   checked: colOptions.artwork,
            // },
            {
              label: 'Title',
              disabled: true,
              checked: true,
            },
            {
              label: 'Artist',
              attr: 'colPlaylistArtist',
              checked: colOptions.artist,
            },
            {
              label: 'Album',
              attr: 'colPlaylistAlbum',
              checked: colOptions.album,
            },
            {
              label: 'Audio codec',
              attr: 'colPlaylistCodec',
              checked: colOptions.codec,
            },
            {
              label: 'Bitrate',
              attr: 'colPlaylistBitrate',
              checked: colOptions.bitrate,
            },
            {
              label: 'Duration',
              attr: 'colPlaylistDuration',
              checked: colOptions.duration,
            },
            {
              label: 'Rating',
              attr: 'colPlaylistUserRating',
              checked: colOptions.userRating,
            },
          ]}
        />
      }
      handlePlay={playlistTracks && playlistTracks.length > 0 ? doPlay : null}
      padding={!isListView}
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistDetail;
