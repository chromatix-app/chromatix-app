// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import {
  Favourite,
  ActionMenu,
  ActionSelect,
  ActionSort,
  ViewGrid,
  ViewList,
  Loading,
  StarRating,
  TitleHeading,
} from 'js/components';
import { useContextMenuArtists, useGetArtistDetail } from 'js/hooks';
import platformFeatures from 'js/_config/platformFeatures';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistDetail = ({ pageVariant = 'Artists' }) => {
  const { libraryId, artistId } = useParams();

  const dispatch = useDispatch();

  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  const switchToTrackViewOnArtistPlay = useSelector(({ sessionModel }) => sessionModel.switchToTrackViewOnArtistPlay);

  const playerPlaying = useSelector(({ playerModel }) => playerModel.playerPlaying);
  const playingVariant = useSelector(({ sessionModel }) => sessionModel.playingVariant);
  const playingArtistId = useSelector(({ sessionModel }) => sessionModel.playingArtistId);

  const {
    artistInfo,
    artistThumb,
    artistThumbMedium,
    artistName,
    artistCountry,
    artistGenre,
    artistRating,
    artistIsFavourite,

    gridOptions,
    colOptions,
    colTrackOptions,

    sortedArtistAlbums,
    sortedArtistRelated,
    sortedArtistAppearances,

    sortedAllReleasesAndAppearances,
    sortedArtistTracks,
    sortedArtistTracksOrder,

    artistAlbumsGroupByType,

    artistReleasesTotal,
    artistTracksTotal,

    viewArtistAlbums,
    sortArtistAlbums,
    orderArtistAlbums,

    sortArtistTracks,
    orderArtistTracks,

    setViewArtistAlbums,
    setSortArtistAlbums,
    setOrderArtistAlbums,
    setColumnVisibility,
  } = useGetArtistDetail({
    variant: pageVariant,
    libraryId,
    artistId,
  });

  if (!artistInfo) {
    return <Loading forceVisible inline showOffline />;
  }

  if (artistInfo?.error404) {
    return <TitleHeading title="Artist not found" />;
  }

  const doPlay = (isShuffle) => {
    dispatch.playerModel.playerLoadArtist({
      artistId,
      artistName,
      isShuffle,
      playingOrder: sortedArtistTracksOrder,
      trackIndex: sortedArtistTracksOrder ? sortedArtistTracksOrder[0] : 0,
    });

    // Optionally switch to track view when playing
    if (switchToTrackViewOnArtistPlay && viewArtistAlbums !== 'track') {
      dispatch.appModel.setAppState({ scrollToPlaying: true });
      setViewArtistAlbums('track');
    }

    // // Scroll to playing track, if possible
    // else if (viewArtistAlbums === 'track') {
    //   dispatch.appModel.setAppState({ scrollToPlaying: true });
    // }
  };

  // Check everything is loaded for album views
  const isLoading1 = !artistInfo || !sortedArtistAlbums || !sortedArtistRelated || !sortedArtistAppearances;

  // Check if everything is loaded for track views
  const isLoading2 = isLoading1 || (viewArtistAlbums === 'track' && !sortedArtistTracks);

  // Check if album view is empty
  const isEmptyList1 =
    !isLoading2 &&
    sortedArtistAlbums?.length === 0 &&
    sortedArtistRelated?.length === 0 &&
    sortedArtistAppearances?.length === 0;

  // Check if track view is empty
  const isEmptyList2 = !isLoading2 && viewArtistAlbums === 'track' && sortedArtistTracks?.length === 0;

  const isGridView = !isLoading2 && !isEmptyList1 && viewArtistAlbums === 'grid';
  const isListView = !isLoading2 && !isEmptyList1 && viewArtistAlbums === 'list';
  const isTrackView = !isLoading2 && !isEmptyList1 && viewArtistAlbums === 'track';

  const isLoaded = playingVariant === 'artists' && playingArtistId === artistId;
  const isPlaying = isLoaded && playerPlaying;

  return (
    <>
      {(isLoading2 || isEmptyList1 || isEmptyList2) && (
        <Title
          artistAlbumsGroupByType={artistAlbumsGroupByType}
          artistCountry={artistCountry}
          artistGenre={artistGenre}
          artistId={artistId}
          artistIsFavourite={artistIsFavourite}
          artistName={artistName}
          artistRating={artistRating}
          artistReleasesTotal={artistReleasesTotal}
          artistThumb={artistThumb}
          artistThumbMedium={artistThumbMedium}
          artistTracksTotal={artistTracksTotal}
          colOptions={colOptions}
          doPlay={doPlay}
          gridOptions={gridOptions}
          isGridView={isGridView}
          isListView={isListView}
          isLoaded={isLoaded}
          isLoading1={isLoading1}
          isPlaying={isPlaying}
          isTrackView={isTrackView}
          libraryId={libraryId}
          orderArtistAlbums={orderArtistAlbums}
          platformOpts={platformOpts}
          setColumnVisibility={setColumnVisibility}
          setOrderArtistAlbums={setOrderArtistAlbums}
          setSortArtistAlbums={setSortArtistAlbums}
          setViewArtistAlbums={setViewArtistAlbums}
          sortArtistAlbums={sortArtistAlbums}
          sortedArtistTracks={sortedArtistTracks}
          viewArtistAlbums={viewArtistAlbums}
        />
      )}
      {isLoading2 && <Loading forceVisible inline showOffline />}

      {isGridView && (
        <ViewGrid
          variant="artistAlbums"
          {...(artistAlbumsGroupByType ? { groupBy: 'albumGroup' } : { groupBy: 'releaseGroup' })}
          entries={sortedAllReleasesAndAppearances}
          showFavs={gridOptions.isFavourite}
          showRatings={gridOptions.userRating}
        >
          <Title
            artistAlbumsGroupByType={artistAlbumsGroupByType}
            artistCountry={artistCountry}
            artistGenre={artistGenre}
            artistId={artistId}
            artistIsFavourite={artistIsFavourite}
            artistName={artistName}
            artistRating={artistRating}
            artistReleasesTotal={artistReleasesTotal}
            artistThumb={artistThumb}
            artistThumbMedium={artistThumbMedium}
            artistTracksTotal={artistTracksTotal}
            colOptions={colOptions}
            doPlay={doPlay}
            gridOptions={gridOptions}
            isGridView={isGridView}
            isListView={isListView}
            isLoaded={isLoaded}
            isLoading1={isLoading1}
            isPlaying={isPlaying}
            isTrackView={isTrackView}
            libraryId={libraryId}
            orderArtistAlbums={orderArtistAlbums}
            platformOpts={platformOpts}
            setColumnVisibility={setColumnVisibility}
            setOrderArtistAlbums={setOrderArtistAlbums}
            setSortArtistAlbums={setSortArtistAlbums}
            setViewArtistAlbums={setViewArtistAlbums}
            sortArtistAlbums={sortArtistAlbums}
            sortedArtistTracks={sortedArtistTracks}
            viewArtistAlbums={viewArtistAlbums}
          />
        </ViewGrid>
      )}

      {isListView && (
        <ViewList
          variant="artistAlbums"
          {...(artistAlbumsGroupByType ? { groupBy: 'albumGroup' } : { groupBy: 'releaseGroup' })}
          entries={sortedAllReleasesAndAppearances}
          sortKey={sortArtistAlbums}
          orderKey={orderArtistAlbums}
          colOptions={colOptions}
        >
          <Title
            artistAlbumsGroupByType={artistAlbumsGroupByType}
            artistCountry={artistCountry}
            artistGenre={artistGenre}
            artistId={artistId}
            artistIsFavourite={artistIsFavourite}
            artistName={artistName}
            artistRating={artistRating}
            artistReleasesTotal={artistReleasesTotal}
            artistThumb={artistThumb}
            artistThumbMedium={artistThumbMedium}
            artistTracksTotal={artistTracksTotal}
            colOptions={colOptions}
            doPlay={doPlay}
            gridOptions={gridOptions}
            isGridView={isGridView}
            isListView={isListView}
            isLoaded={isLoaded}
            isLoading1={isLoading1}
            isPlaying={isPlaying}
            isTrackView={isTrackView}
            libraryId={libraryId}
            orderArtistAlbums={orderArtistAlbums}
            platformOpts={platformOpts}
            setColumnVisibility={setColumnVisibility}
            setOrderArtistAlbums={setOrderArtistAlbums}
            setSortArtistAlbums={setSortArtistAlbums}
            setViewArtistAlbums={setViewArtistAlbums}
            sortArtistAlbums={sortArtistAlbums}
            sortedArtistTracks={sortedArtistTracks}
            viewArtistAlbums={viewArtistAlbums}
          />
        </ViewList>
      )}

      {isTrackView && (
        <ViewList
          variant="artistTracks"
          // groupBy="albumGroup"
          artistId={artistId}
          artistName={artistName}
          entries={sortedArtistTracks}
          playingOrder={sortedArtistTracksOrder}
          sortKey={sortArtistTracks}
          orderKey={orderArtistTracks}
          colOptions={colTrackOptions}
        >
          <Title
            artistAlbumsGroupByType={artistAlbumsGroupByType}
            artistCountry={artistCountry}
            artistGenre={artistGenre}
            artistId={artistId}
            artistIsFavourite={artistIsFavourite}
            artistName={artistName}
            artistRating={artistRating}
            artistReleasesTotal={artistReleasesTotal}
            artistThumb={artistThumb}
            artistThumbMedium={artistThumbMedium}
            artistTracksTotal={artistTracksTotal}
            colOptions={colTrackOptions}
            doPlay={doPlay}
            gridOptions={gridOptions}
            isGridView={isGridView}
            isListView={isListView}
            isLoaded={isLoaded}
            isLoading1={isLoading1}
            isPlaying={isPlaying}
            isTrackView={isTrackView}
            libraryId={libraryId}
            orderArtistAlbums={orderArtistAlbums}
            platformOpts={platformOpts}
            setColumnVisibility={setColumnVisibility}
            setOrderArtistAlbums={setOrderArtistAlbums}
            setSortArtistAlbums={setSortArtistAlbums}
            setViewArtistAlbums={setViewArtistAlbums}
            sortArtistAlbums={sortArtistAlbums}
            sortedArtistTracks={sortedArtistTracks}
            viewArtistAlbums={viewArtistAlbums}
          />
        </ViewList>
      )}
    </>
  );
};

const Title = ({
  artistAlbumsGroupByType,
  artistCountry,
  artistGenre,
  artistId,
  artistIsFavourite,
  artistName,
  artistRating,
  artistReleasesTotal,
  artistThumb,
  artistThumbMedium,
  artistTracksTotal,
  colOptions,
  doPlay,
  gridOptions,
  isGridView,
  isListView,
  isLoaded,
  isLoading1,
  isPlaying,
  isTrackView,
  libraryId,
  orderArtistAlbums,
  platformOpts,
  setColumnVisibility,
  setOrderArtistAlbums,
  setSortArtistAlbums,
  setViewArtistAlbums,
  sortArtistAlbums,
  sortedArtistTracks,
  viewArtistAlbums,
}) => {
  const contextEntries = useContextMenuArtists({ artistId, title: artistName });

  let subtitle = <>&nbsp;</>;
  // Track view count
  if (isTrackView && artistTracksTotal) {
    subtitle = artistTracksTotal + ' Track' + (artistTracksTotal > 1 ? 's' : '');
  }
  // Album view count
  else if (!isLoading1) {
    subtitle = artistReleasesTotal + ' Release' + (artistReleasesTotal > 1 ? 's' : '');
  }

  return (
    <TitleHeading
      key={libraryId + '-' + artistId}
      thumb={artistThumb}
      thumbExpand={artistThumbMedium}
      title={artistName}
      subtitle={subtitle}
      padding={!isGridView && !isListView && !isTrackView}
      detail={
        <>
          {[
            platformOpts.enableIsFavourite && (
              <Favourite
                key="favourite"
                variant="title"
                type="artist"
                itemId={artistId}
                isFavourite={artistIsFavourite}
                editable
              />
            ),
            artistCountry,
            artistGenre,
            platformOpts.enableUserRating && (
              <StarRating
                key="rating"
                variant="title"
                type="artist"
                ratingKey={artistId}
                rating={artistRating}
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
      }
      optionsMenu={
        <>
          <div className="actionIconWrap">
            <ActionSelect
              variant="Large"
              value={viewArtistAlbums}
              options={[
                { value: 'grid', label: 'Grid view' },
                { value: 'list', label: 'List view' },
                { value: 'track', label: 'Track view' },
              ]}
              setter={setViewArtistAlbums}
              icon={
                viewArtistAlbums === 'grid'
                  ? 'GridIcon'
                  : viewArtistAlbums === 'list'
                    ? 'ListIcon'
                    : 'MusicNoteSingleIcon'
              }
            />
            {viewArtistAlbums === 'grid' && (
              <>
                <ActionSort
                  variant="Large"
                  sortValue={sortArtistAlbums}
                  orderValue={orderArtistAlbums}
                  options={[
                    { value: 'title', label: 'Alphabetical' },
                    // { value: 'artist', label: 'Artist' },
                    // { value: 'artist-asc-releaseDate-asc', label: 'Artist, oldest release first' },
                    // { value: 'artist-asc-releaseDate-desc', label: 'Artist, newest release first' },
                    ...(platformOpts?.enableAddedAt ? [{ value: 'addedAt', label: 'Date added' }] : []),
                    ...(platformOpts?.enableLastPlayed ? [{ value: 'lastPlayed', label: 'Date played' }] : []),
                    { value: 'releaseDate', label: 'Date released' },
                    ...(platformOpts?.enableIsFavourite ? [{ value: 'isFavourite', label: 'Favourites' }] : []),
                    ...(platformOpts?.enableUserRating ? [{ value: 'userRating', label: 'Rating' }] : []),
                  ]}
                  setSort={setSortArtistAlbums}
                  setOrder={setOrderArtistAlbums}
                />
                <ActionMenu
                  variant="Large"
                  label="Options"
                  icon="CogIcon"
                  setter={setColumnVisibility}
                  entries={[
                    ...(platformOpts?.enableIsFavourite
                      ? [
                          {
                            variant: 'checkbox',
                            label: 'Show favourites',
                            attr: 'gridArtistAlbumsIsFavourite',
                            checked: gridOptions.isFavourite,
                          },
                        ]
                      : []),
                    ...(platformOpts?.enableUserRating
                      ? [
                          {
                            variant: 'checkbox',
                            label: 'Show star ratings',
                            attr: 'gridArtistAlbumsUserRating',
                            checked: gridOptions.userRating,
                          },
                        ]
                      : []),
                    {
                      variant: 'divider',
                    },
                    {
                      variant: 'checkbox',
                      label: 'Group by type',
                      attr: 'artistAlbumsGroupByType',
                      checked: artistAlbumsGroupByType,
                    },
                  ]}
                />
              </>
            )}
            {viewArtistAlbums === 'list' && (
              <ActionMenu
                variant="Large"
                label="Options"
                icon="CogIcon"
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
                    label: 'Genre',
                    attr: 'colArtistAlbumsGenre',
                    checked: colOptions.genre,
                  },
                  {
                    variant: 'checkbox',
                    label: 'Released',
                    attr: 'colArtistAlbumsReleaseDate',
                    checked: colOptions.releaseDate,
                  },
                  ...(platformOpts?.enableAddedAt
                    ? [
                        {
                          variant: 'checkbox',
                          label: 'Added',
                          attr: 'colArtistAlbumsAddedAt',
                          checked: colOptions.addedAt,
                        },
                      ]
                    : []),
                  ...(platformOpts?.enableLastPlayed
                    ? [
                        {
                          variant: 'checkbox',
                          label: 'Last played',
                          attr: 'colArtistAlbumsLastPlayed',
                          checked: colOptions.lastPlayed,
                        },
                      ]
                    : []),
                  ...(platformOpts?.enableIsFavourite
                    ? [
                        {
                          variant: 'checkbox',
                          label: 'Favourite',
                          attr: 'colArtistAlbumsIsFavourite',
                          checked: colOptions.isFavourite,
                        },
                      ]
                    : []),
                  ...(platformOpts?.enableUserRating
                    ? [
                        {
                          variant: 'checkbox',
                          label: 'Rating',
                          attr: 'colArtistAlbumsUserRating',
                          checked: colOptions.userRating,
                        },
                      ]
                    : []),
                  {
                    variant: 'divider',
                  },
                  {
                    variant: 'checkbox',
                    label: 'Group by type',
                    attr: 'artistAlbumsGroupByType',
                    checked: artistAlbumsGroupByType,
                  },
                ]}
              />
            )}
            {viewArtistAlbums === 'track' && (
              <ActionMenu
                variant="Large"
                label="Options"
                icon="CogIcon"
                setter={setColumnVisibility}
                entries={[
                  {
                    variant: 'checkbox',
                    label: 'Artwork',
                    attr: 'colArtistTracksArtwork',
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
                    attr: 'colArtistTracksArtist',
                    checked: colOptions.artist,
                  },
                  {
                    variant: 'checkbox',
                    label: 'Album',
                    attr: 'colArtistTracksAlbum',
                    checked: colOptions.album,
                  },
                  {
                    variant: 'checkbox',
                    label: 'Released',
                    attr: 'colArtistTracksReleaseDate',
                    checked: colOptions.releaseDate,
                  },
                  {
                    variant: 'checkbox',
                    label: 'Audio codec',
                    attr: 'colArtistTracksCodec',
                    checked: colOptions.codec,
                  },
                  {
                    variant: 'checkbox',
                    label: 'Bitrate',
                    attr: 'colArtistTracksBitrate',
                    checked: colOptions.bitrate,
                  },
                  {
                    variant: 'checkbox',
                    label: 'Duration',
                    attr: 'colArtistTracksDuration',
                    checked: colOptions.duration,
                  },
                  ...(platformOpts?.enableIsFavourite
                    ? [
                        {
                          variant: 'checkbox',
                          label: 'Favourite',
                          attr: 'colArtistTracksIsFavourite',
                          checked: colOptions.isFavourite,
                        },
                      ]
                    : []),
                  ...(platformOpts?.enableUserRating
                    ? [
                        {
                          variant: 'checkbox',
                          label: 'Rating',
                          attr: 'colArtistTracksUserRating',
                          checked: colOptions.userRating,
                        },
                      ]
                    : []),
                ]}
              />
            )}
          </div>
          {platformOpts.menuArtistCollections && (
            <div className="actionIconWrap">
              <ActionMenu variant="Large" label="More" icon="EllipsisIcon" entries={contextEntries} />
            </div>
          )}
        </>
      }
      showPlay={true}
      isLoaded={isLoaded}
      isPlaying={isPlaying}
      handlePlay={sortedArtistTracks && sortedArtistTracks.length > 0 ? doPlay : null}
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistDetail;
