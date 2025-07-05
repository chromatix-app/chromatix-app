// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import {
  FilterMenu,
  FilterSelect,
  FilterToggle,
  FilterWrap,
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

  return (
    <>
      {(isLoading || isEmptyList) && (
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
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && (
        <ViewGrid
          variant="playlists"
          entries={sortedPlaylists}
          showFavs={gridOptions.isFavourite}
          showRatings={gridOptions.userRating}
        >
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
      <FilterWrap padding={!isListView && !isGridView}>
        <FilterToggle
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
            <FilterSelect
              value={sortPlaylists}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'addedAt', label: 'Date added' },
                { value: 'lastPlayed', label: 'Date played' },
                { value: 'duration', label: 'Duration' },
                ...(platformOpts?.enableIsFavourite ? [{ value: 'isFavourite', label: 'Favourites' }] : []),
                ...(platformOpts?.enableUserRating ? [{ value: 'userRating', label: 'Rating' }] : []),
                { value: 'totalTracks', label: 'Track count' },
              ]}
              setter={setSortPlaylists}
            />
            <FilterToggle
              value={orderPlaylists}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={setOrderPlaylists}
              icon={orderPlaylists === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
            />
            <FilterMenu
              label="Options"
              icon="CogIcon"
              setter={setColumnVisibility}
              entries={[
                ...(platformOpts?.enableIsFavourite
                  ? [
                      {
                        label: 'Show favourites',
                        attr: 'gridPlaylistsIsFavourite',
                        checked: gridOptions.isFavourite,
                      },
                    ]
                  : []),
                ...(platformOpts?.enableUserRating
                  ? [
                      {
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
          <FilterMenu
            label="Options"
            icon="CogIcon"
            setter={setColumnVisibility}
            entries={[
              {
                label: 'Title',
                disabled: true,
                checked: true,
              },
              {
                label: 'Tracks',
                attr: 'colPlaylistsTotalTracks',
                checked: colOptions.totalTracks,
              },
              {
                label: 'Duration',
                attr: 'colPlaylistsDuration',
                checked: colOptions.duration,
              },
              {
                label: 'Added',
                attr: 'colPlaylistsAddedAt',
                checked: colOptions.addedAt,
              },
              {
                label: 'Last played',
                attr: 'colPlaylistsLastPlayed',
                checked: colOptions.lastPlayed,
              },
              ...(platformOpts?.enableIsFavourite
                ? [
                    {
                      label: 'Favourite',
                      attr: 'colPlaylistsIsFavourite',
                      checked: colOptions.isFavourite,
                    },
                  ]
                : []),
              ...(platformOpts?.enableUserRating
                ? [
                    {
                      label: 'Rating',
                      attr: 'colPlaylistsUserRating',
                      checked: colOptions.userRating,
                    },
                  ]
                : []),
            ]}
          />
        )}
      </FilterWrap>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistArray;
