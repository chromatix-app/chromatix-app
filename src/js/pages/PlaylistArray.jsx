// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import {
  ActionButton,
  ActionMenu,
  ActionSort,
  ActionToggle,
  ActionWrap,
  ViewGrid,
  ViewList,
  Loading,
  TitleHeading,
} from 'js/components';
import { useGetPlaylistArray } from 'js/hooks';
import platformFeatures from 'js/_config/platformFeatures';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistArray = () => {
  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  const {
    viewPlaylists,
    sortPlaylists,
    orderPlaylists,
    gridOptions,
    colOptions,

    setViewPlaylists,
    setSortPlaylists,
    setOrderPlaylists,
    setColumnVisibility,

    sortedPlaylists,
  } = useGetPlaylistArray();

  const isLoading = !sortedPlaylists;
  const isEmptyList = !isLoading && sortedPlaylists?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewPlaylists === 'grid';
  const isListView = !isLoading && !isEmptyList && viewPlaylists === 'list';

  const titleBlock = (
    <Title
      colOptions={colOptions}
      gridOptions={gridOptions}
      isGridView={isGridView}
      isListView={isListView}
      orderPlaylists={orderPlaylists}
      platformOpts={platformOpts}
      setColumnVisibility={setColumnVisibility}
      setOrderPlaylists={setOrderPlaylists}
      setSortPlaylists={setSortPlaylists}
      setViewPlaylists={setViewPlaylists}
      sortedPlaylists={sortedPlaylists}
      sortPlaylists={sortPlaylists}
      viewPlaylists={viewPlaylists}
    />
  );

  return (
    <>
      {(isLoading || isEmptyList) && titleBlock}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && (
        <ViewGrid
          variant="playlists"
          entries={sortedPlaylists}
          showTotalTracks={gridOptions.totalTracks}
          showDuration={gridOptions.duration}
          showFavs={gridOptions.isFavourite}
          showRatings={gridOptions.userRating}
        >
          {titleBlock}
        </ViewGrid>
      )}
      {isListView && (
        <ViewList
          variant="playlists"
          entries={sortedPlaylists}
          sortKey={sortPlaylists}
          orderKey={orderPlaylists}
          colOptions={colOptions}
        >
          {titleBlock}
        </ViewList>
      )}
    </>
  );
};

const Title = ({
  colOptions,
  gridOptions,
  isGridView,
  isListView,
  orderPlaylists,
  platformOpts,
  setColumnVisibility,
  setOrderPlaylists,
  setSortPlaylists,
  setViewPlaylists,
  sortedPlaylists,
  sortPlaylists,
  viewPlaylists,
}) => {
  const dispatch = useDispatch();

  return (
    <>
      <TitleHeading
        key="PlaylistArray"
        title="Playlists"
        subtitle={
          sortedPlaylists ? (
            sortedPlaylists?.length + ' Playlist' + (sortedPlaylists?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
        padding={!isListView && !isGridView}
      />
      <ActionWrap padding={true} inset={isListView || isGridView}>
        <ActionToggle
          value={viewPlaylists}
          options={[
            { value: 'grid', label: 'Grid view' },
            { value: 'list', label: 'List view' },
          ]}
          setter={setViewPlaylists}
          icon={viewPlaylists === 'grid' ? 'GridIcon' : 'ListIcon'}
        />
        {viewPlaylists === 'grid' && (
          <>
            <ActionSort
              sortValue={sortPlaylists}
              orderValue={orderPlaylists}
              options={[
                { value: 'title', label: 'Alphabetical' },
                ...(platformOpts?.enableAddedAt ? [{ value: 'addedAt', label: 'Date added' }] : []),
                ...(platformOpts?.enableLastPlayed ? [{ value: 'lastPlayed', label: 'Date played' }] : []),
                { value: 'duration', label: 'Duration' },
                ...(platformOpts?.enableIsFavourite ? [{ value: 'isFavourite', label: 'Favourites' }] : []),
                ...(platformOpts?.enableUserRating ? [{ value: 'userRating', label: 'Rating' }] : []),
                { value: 'totalTracks', label: 'Track count' },
              ]}
              setSort={setSortPlaylists}
              setOrder={setOrderPlaylists}
            />
            <ActionMenu
              label="Options"
              icon="CogIcon"
              setter={setColumnVisibility}
              entries={[
                {
                  variant: 'checkbox',
                  label: 'Show total tracks',
                  attr: 'gridPlaylistsTotalTracks',
                  checked: gridOptions.totalTracks,
                },
                {
                  variant: 'checkbox',
                  label: 'Show durations',
                  attr: 'gridPlaylistsDuration',
                  checked: gridOptions.duration,
                },
                ...(platformOpts?.enableIsFavourite
                  ? [
                      {
                        variant: 'checkbox',
                        label: 'Show favourites',
                        attr: 'gridPlaylistsIsFavourite',
                        checked: gridOptions.isFavourite,
                      },
                    ]
                  : []),
                ...(platformOpts?.enableUserRating
                  ? [
                      {
                        variant: 'checkbox',
                        label: 'Show star ratings',
                        attr: 'gridPlaylistsUserRating',
                        checked: gridOptions.userRating,
                      },
                    ]
                  : []),
              ]}
            />
          </>
        )}
        {viewPlaylists === 'list' && (
          <ActionMenu
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
                label: 'Tracks',
                attr: 'colPlaylistsTotalTracks',
                checked: colOptions.totalTracks,
              },
              {
                variant: 'checkbox',
                label: 'Duration',
                attr: 'colPlaylistsDuration',
                checked: colOptions.duration,
              },
              ...(platformOpts?.enableAddedAt
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Added',
                      attr: 'colPlaylistsAddedAt',
                      checked: colOptions.addedAt,
                    },
                  ]
                : []),
              ...(platformOpts?.enableLastPlayed
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Last played',
                      attr: 'colPlaylistsLastPlayed',
                      checked: colOptions.lastPlayed,
                    },
                  ]
                : []),
              ...(platformOpts?.enableIsFavourite
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Favourite',
                      attr: 'colPlaylistsIsFavourite',
                      checked: colOptions.isFavourite,
                    },
                  ]
                : []),
              ...(platformOpts?.enableUserRating
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Rating',
                      attr: 'colPlaylistsUserRating',
                      checked: colOptions.userRating,
                    },
                  ]
                : []),
            ]}
          />
        )}
        <ActionButton
          label="New playlist"
          icon="PlusIcon"
          onClick={() => dispatch.dialogModel.showModal('PlaylistAdd')}
        />
      </ActionWrap>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistArray;
