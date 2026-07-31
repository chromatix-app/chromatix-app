// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useParams } from 'react-router-dom';

import { Favourite, ActionMenu, ViewList, Loading, StarRating, TitleHeading } from 'js/components';
import { useContextMenuAlbums, useGetAlbumDetail } from 'js/hooks';
import platformFeatures from 'js/_config/platformFeatures';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumDetail = () => {
  const { libraryId, albumId } = useParams();

  const dispatch = useDispatch();

  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  const playerPlaying = useSelector(({ playerModel }) => playerModel.playerPlaying);
  const playingVariant = useSelector(({ sessionModel }) => sessionModel.playingVariant);
  const playingAlbumId = useSelector(({ sessionModel }) => sessionModel.playingAlbumId);

  const {
    albumInfo,
    albumThumb,
    albumThumbMedium,
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

  if (albumInfo?.error404) {
    return <TitleHeading title="Album not found" />;
  }

  const isLoading = !albumTracks;
  const isEmptyList = !isLoading && albumTracks?.length === 0;
  const isListView = !isLoading && !isEmptyList;

  const isLoaded = playingVariant === 'albums' && playingAlbumId === albumId;
  const isPlaying = isLoaded && playerPlaying;

  const titleBlock = (
    <Title
      albumArtist={albumArtist}
      albumArtistLink={albumArtistLink}
      albumDurationString={albumDurationString}
      albumId={albumId}
      albumIsFavourite={albumIsFavourite}
      albumRating={albumRating}
      albumReleaseDate={albumReleaseDate}
      albumThumb={albumThumb}
      albumThumbMedium={albumThumbMedium}
      albumTitle={albumTitle}
      albumTrackCount={albumTrackCount}
      albumTracks={albumTracks}
      colOptions={colOptions}
      doPlay={doPlay}
      isListView={isListView}
      isLoaded={isLoaded}
      isPlaying={isPlaying}
      libraryId={libraryId}
      platformOpts={platformOpts}
      setColumnVisibility={setColumnVisibility}
    />
  );

  return (
    <>
      {(isLoading || isEmptyList) && titleBlock}
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
          {titleBlock}
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
  albumIsFavourite,
  albumRating,
  albumReleaseDate,
  albumThumb,
  albumThumbMedium,
  albumTitle,
  albumTrackCount,
  albumTracks,
  colOptions,
  doPlay,
  isListView,
  isLoaded,
  isPlaying,
  libraryId,
  platformOpts,
  setColumnVisibility,
}) => {
  const contextEntries = useContextMenuAlbums({ albumId, artistLink: albumArtistLink }, { showPlay: false });

  return (
    <TitleHeading
      key={libraryId + '-' + albumId}
      thumb={albumThumb}
      thumbExpand={albumThumbMedium}
      title={albumTitle}
      subtitle={
        albumArtist && (
          <NavLink to={albumArtistLink} draggable="false">
            {albumArtist}
          </NavLink>
        )
      }
      padding={!isListView}
      detail={
        albumTracks ? (
          <>
            {[
              platformOpts.enableIsFavourite && (
                <Favourite
                  key="favourite"
                  variant="title"
                  type="album"
                  itemId={albumId}
                  isFavourite={albumIsFavourite}
                  editable
                />
              ),
              albumReleaseDate,
              albumTrackCount && `${albumTrackCount} track${albumTrackCount !== 1 ? 's' : ''}`,
              albumDurationString,
              platformOpts.enableUserRating && (
                <StarRating
                  key="rating"
                  variant="title"
                  type="album"
                  ratingKey={albumId}
                  rating={albumRating}
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
          <div className="actionIconWrap">
            <ActionMenu
              variant="Large"
              label="Options"
              icon="CogIcon"
              iconStrokeWidth={1.2}
              setter={setColumnVisibility}
              entries={[
                {
                  variant: 'checkbox',
                  label: 'Title',
                  disabled: true,
                  checked: true,
                },
                {
                  variant: 'checkbox',
                  label: 'Artist',
                  attr: 'colAlbumArtist',
                  checked: colOptions.artist,
                },
                {
                  variant: 'checkbox',
                  label: 'Audio codec',
                  attr: 'colAlbumCodec',
                  checked: colOptions.codec,
                },
                {
                  variant: 'checkbox',
                  label: 'Bitrate',
                  attr: 'colAlbumBitrate',
                  checked: colOptions.bitrate,
                },
                {
                  variant: 'checkbox',
                  label: 'Duration',
                  attr: 'colAlbumDuration',
                  checked: colOptions.duration,
                },
                ...(platformOpts?.enableIsFavourite
                  ? [
                      {
                        variant: 'checkbox',
                        label: 'Favourite',
                        attr: 'colAlbumIsFavourite',
                        checked: colOptions.isFavourite,
                      },
                    ]
                  : []),
                ...(platformOpts?.enableUserRating
                  ? [
                      {
                        variant: 'checkbox',
                        label: 'Rating',
                        attr: 'colAlbumUserRating',
                        checked: colOptions.userRating,
                      },
                    ]
                  : []),
              ]}
            />
          </div>
          <div className="actionIconWrap">
            <ActionMenu variant="Large" label="More" icon="EllipsisIcon" entries={contextEntries} />
          </div>
        </>
      }
      showPlay={true}
      isLoaded={isLoaded}
      isPlaying={isPlaying}
      handlePlay={albumTracks && albumTracks.length > 0 ? doPlay : null}
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumDetail;
