// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Favourite, FilterButton, FilterMenu, ViewList, Loading, StarRating, TitleHeading } from 'js/components';
import { useGetPlaylistDetail } from 'js/hooks';
import platformFeatures from 'js/_config/platformFeatures';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistDetail = () => {
  const { libraryId, playlistId } = useParams();

  const dispatch = useDispatch();

  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  const playerPlaying = useSelector(({ playerModel }) => playerModel.playerPlaying);
  const playingVariant = useSelector(({ sessionModel }) => sessionModel.playingVariant);
  const playingPlaylistId = useSelector(({ sessionModel }) => sessionModel.playingPlaylistId);

  const {
    playlistInfo,
    playlistThumb,
    playlistThumbMedium,
    playlistTitle,
    playlistTrackCount,
    playlistDurationString,
    playlistRating,
    playlistIsFavourite,
    playlistTracks,
    playlistOrder,
    playlistSortString,
    colOptions,
    setColumnVisibility,
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

  if (playlistInfo?.error404) {
    return <TitleHeading title="Playlist not found" />;
  }

  const isLoading = !playlistTracks;
  const isEmptyList = !isLoading && playlistTracks?.length === 0;
  const isListView = !isLoading && !isEmptyList;

  const isLoaded = playingVariant === 'playlists' && playingPlaylistId === playlistId;
  const isPlaying = isLoaded && playerPlaying;

  return (
    <>
      {(isLoading || isEmptyList) && (
        <Title
          colOptions={colOptions}
          doPlay={doPlay}
          isListView={isListView}
          isLoaded={isLoaded}
          isPlaying={isPlaying}
          libraryId={libraryId}
          platformOpts={platformOpts}
          playlistDurationString={playlistDurationString}
          playlistId={playlistId}
          playlistIsFavourite={playlistIsFavourite}
          playlistRating={playlistRating}
          playlistThumb={playlistThumb}
          playlistThumbMedium={playlistThumbMedium}
          playlistTitle={playlistTitle}
          playlistTrackCount={playlistTrackCount}
          playlistTracks={playlistTracks}
          setColumnVisibility={setColumnVisibility}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isListView && (
        <ViewList
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
            isLoaded={isLoaded}
            isPlaying={isPlaying}
            libraryId={libraryId}
            platformOpts={platformOpts}
            playlistDurationString={playlistDurationString}
            playlistId={playlistId}
            playlistIsFavourite={playlistIsFavourite}
            playlistRating={playlistRating}
            playlistThumb={playlistThumb}
            playlistThumbMedium={playlistThumbMedium}
            playlistTitle={playlistTitle}
            playlistTrackCount={playlistTrackCount}
            playlistTracks={playlistTracks}
            setColumnVisibility={setColumnVisibility}
          />
        </ViewList>
      )}
    </>
  );
};

const Title = ({
  colOptions,
  doPlay,
  isListView,
  isLoaded,
  isPlaying,
  libraryId,
  platformOpts,
  playlistDurationString,
  playlistId,
  playlistIsFavourite,
  playlistRating,
  playlistThumb,
  playlistThumbMedium,
  playlistTitle,
  playlistTrackCount,
  playlistTracks,
  setColumnVisibility,
}) => {
  const dispatch = useDispatch();

  return (
    <TitleHeading
      key={libraryId + '-' + playlistId}
      thumb={playlistThumb}
      thumbExpand={playlistThumbMedium}
      title={playlistTitle}
      subtitle={playlistTracks ? playlistTrackCount + ' tracks' : <>&nbsp;</>}
      padding={!isListView}
      detail={
        playlistTracks ? (
          <>
            {[
              platformOpts.enableIsFavourite && (
                <Favourite
                  key="favourite"
                  variant="title"
                  type="playlist"
                  itemId={playlistId}
                  isFavourite={playlistIsFavourite}
                  editable
                />
              ),
              playlistDurationString,
              platformOpts.enableUserRating && (
                <StarRating
                  key="rating"
                  variant="title"
                  type="playlist"
                  ratingKey={playlistId}
                  rating={playlistRating}
                  editable
                />
              ),
            ]
              .filter(Boolean)
              .reduce((acc, item, index) => {
                if (index === 0) return [item];

                // Check if the first item is a Favourite component
                const firstItem = acc[0];
                const isFirstItemFavourite = firstItem?.key === 'favourite';
                const separator =
                  index === 1 && isFirstItemFavourite ? (
                    <span key={`sep-${index}`}>&nbsp; </span>
                  ) : (
                    <span
                      key={`sep-${index}`}
                      style={{
                        paddingInline: 2,
                      }}
                    >
                      {' '}
                      •{' '}
                    </span>
                  );

                return [...acc, separator, item];
              }, [])}
          </>
        ) : (
          <>&nbsp;</>
        )
      }
      optionsMenu={
        <>
          <div className="filterIconWrap">
            <FilterMenu
              variant="Large"
              label="Options"
              icon="CogIcon"
              iconStrokeWidth={1.2}
              setter={setColumnVisibility}
              entries={[
                {
                  variant: 'checkbox',
                  label: 'Artwork',
                  attr: 'colPlaylistArtwork',
                  checked: colOptions.artwork,
                },
                {
                  variant: 'checkbox',
                  label: 'Title',
                  disabled: true,
                  checked: true,
                },
                {
                  variant: 'checkbox',
                  label: 'Artist',
                  attr: 'colPlaylistArtist',
                  checked: colOptions.artist,
                },
                {
                  variant: 'checkbox',
                  label: 'Album',
                  attr: 'colPlaylistAlbum',
                  checked: colOptions.album,
                },
                {
                  variant: 'checkbox',
                  label: 'Audio codec',
                  attr: 'colPlaylistCodec',
                  checked: colOptions.codec,
                },
                {
                  variant: 'checkbox',
                  label: 'Bitrate',
                  attr: 'colPlaylistBitrate',
                  checked: colOptions.bitrate,
                },
                {
                  variant: 'checkbox',
                  label: 'Duration',
                  attr: 'colPlaylistDuration',
                  checked: colOptions.duration,
                },
                ...(platformOpts?.enableIsFavourite
                  ? [
                      {
                        variant: 'checkbox',
                        label: 'Favourite',
                        attr: 'colPlaylistIsFavourite',
                        checked: colOptions.isFavourite,
                      },
                    ]
                  : []),
                ...(platformOpts?.enableUserRating
                  ? [
                      {
                        variant: 'checkbox',
                        label: 'Rating',
                        attr: 'colPlaylistUserRating',
                        checked: colOptions.userRating,
                      },
                    ]
                  : []),
              ]}
            />
          </div>
          <div className="filterIconWrap">
            <FilterButton
              variant="Large"
              label="Edit playlist"
              icon="PencilIcon"
              onClick={() =>
                dispatch.dialogModel.showModal({
                  modal: 'PlaylistEdit',
                  data: { playlistId, playlistTitle },
                })
              }
            />
          </div>
        </>
      }
      showPlay={true}
      isLoaded={isLoaded}
      isPlaying={isPlaying}
      handlePlay={playlistTracks && playlistTracks.length > 0 ? doPlay : null}
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistDetail;
