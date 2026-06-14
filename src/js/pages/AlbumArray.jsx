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
import { useGetAlbumArray } from 'js/hooks';
import platformFeatures from 'js/_config/platformFeatures';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumArray = () => {
  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  const {
    viewAlbums,
    sortAlbums,
    orderAlbums,
    gridOptions,
    colOptions,

    setViewAlbums,
    setSortAlbums,
    setOrderAlbums,
    setColumnVisibility,

    sortedAlbums,
  } = useGetAlbumArray();

  const isLoading = !sortedAlbums;
  const isEmptyList = !isLoading && sortedAlbums?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewAlbums === 'grid';
  const isListView = !isLoading && !isEmptyList && viewAlbums === 'list';

  return (
    <>
      {(isLoading || isEmptyList) && (
        <Title
          colOptions={colOptions}
          gridOptions={gridOptions}
          isGridView={isGridView}
          isListView={isListView}
          orderAlbums={orderAlbums}
          platformOpts={platformOpts}
          setColumnVisibility={setColumnVisibility}
          setOrderAlbums={setOrderAlbums}
          setSortAlbums={setSortAlbums}
          setViewAlbums={setViewAlbums}
          sortAlbums={sortAlbums}
          sortedAlbums={sortedAlbums}
          viewAlbums={viewAlbums}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && (
        <ViewGrid
          variant="albums"
          entries={sortedAlbums}
          showFavs={gridOptions.isFavourite}
          showRatings={gridOptions.userRating}
        >
          <Title
            colOptions={colOptions}
            gridOptions={gridOptions}
            isGridView={isGridView}
            isListView={isListView}
            orderAlbums={orderAlbums}
            platformOpts={platformOpts}
            setColumnVisibility={setColumnVisibility}
            setOrderAlbums={setOrderAlbums}
            setSortAlbums={setSortAlbums}
            setViewAlbums={setViewAlbums}
            sortAlbums={sortAlbums}
            sortedAlbums={sortedAlbums}
            viewAlbums={viewAlbums}
          />
        </ViewGrid>
      )}
      {isListView && (
        <ViewList
          variant="albums"
          entries={sortedAlbums}
          sortKey={sortAlbums}
          orderKey={orderAlbums}
          colOptions={colOptions}
        >
          <Title
            colOptions={colOptions}
            gridOptions={gridOptions}
            isGridView={isGridView}
            isListView={isListView}
            orderAlbums={orderAlbums}
            platformOpts={platformOpts}
            setColumnVisibility={setColumnVisibility}
            setOrderAlbums={setOrderAlbums}
            setSortAlbums={setSortAlbums}
            setViewAlbums={setViewAlbums}
            sortAlbums={sortAlbums}
            sortedAlbums={sortedAlbums}
            viewAlbums={viewAlbums}
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
  orderAlbums,
  platformOpts,
  setColumnVisibility,
  setOrderAlbums,
  setSortAlbums,
  setViewAlbums,
  sortAlbums,
  sortedAlbums,
  viewAlbums,
}) => {
  return (
    <>
      <TitleHeading
        key="AlbumArray"
        title="Albums"
        subtitle={
          sortedAlbums ? sortedAlbums?.length + ' Album' + (sortedAlbums?.length !== 1 ? 's' : '') : <>&nbsp;</>
        }
        padding={!isListView && !isGridView}
      />
      <FilterWrap padding={true} inset={isListView || isGridView}>
        <FilterToggle
          value={viewAlbums}
          options={[
            { value: 'grid', label: 'Grid view' },
            { value: 'list', label: 'List view' },
          ]}
          setter={setViewAlbums}
          icon={viewAlbums === 'grid' ? 'GridIcon' : 'ListIcon'}
        />
        {viewAlbums === 'grid' && (
          <>
            <FilterSelect
              value={sortAlbums}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'artist', label: 'Artist' },
                { value: 'artist-asc-releaseDate-asc', label: 'Artist, oldest release first' },
                { value: 'artist-asc-releaseDate-desc', label: 'Artist, newest release first' },
                ...(platformOpts?.enableAddedAt ? [{ value: 'addedAt', label: 'Date added' }] : []),
                ...(platformOpts?.enableLastPlayed ? [{ value: 'lastPlayed', label: 'Date played' }] : []),
                { value: 'releaseDate', label: 'Date released' },
                ...(platformOpts?.enableIsFavourite ? [{ value: 'isFavourite', label: 'Favourites' }] : []),
                ...(platformOpts?.enableUserRating ? [{ value: 'userRating', label: 'Rating' }] : []),
              ]}
              setter={setSortAlbums}
            />
            <FilterToggle
              value={orderAlbums}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={setOrderAlbums}
              icon={orderAlbums === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
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
                        attr: 'gridAlbumsIsFavourite',
                        checked: gridOptions.isFavourite,
                      },
                    ]
                  : []),
                ...(platformOpts?.enableUserRating
                  ? [
                      {
                        label: 'Show star ratings',
                        attr: 'gridAlbumsUserRating',
                        checked: gridOptions.userRating,
                      },
                    ]
                  : []),
              ]}
            />
          </>
        )}
        {viewAlbums === 'list' && (
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
                label: 'Artist',
                attr: 'colAlbumsArtist',
                checked: colOptions.artist,
              },
              {
                label: 'Genre',
                attr: 'colAlbumsGenre',
                checked: colOptions.genre,
              },
              {
                label: 'Released',
                attr: 'colAlbumsReleaseDate',
                checked: colOptions.releaseDate,
              },
              ...(platformOpts?.enableAddedAt
                ? [
                    {
                      label: 'Added',
                      attr: 'colAlbumsAddedAt',
                      checked: colOptions.addedAt,
                    },
                  ]
                : []),
              ...(platformOpts?.enableLastPlayed
                ? [
                    {
                      label: 'Last played',
                      attr: 'colAlbumsLastPlayed',
                      checked: colOptions.lastPlayed,
                    },
                  ]
                : []),
              ...(platformOpts?.enableIsFavourite
                ? [
                    {
                      label: 'Favourite',
                      attr: 'colAlbumsIsFavourite',
                      checked: colOptions.isFavourite,
                    },
                  ]
                : []),
              ...(platformOpts?.enableUserRating
                ? [
                    {
                      label: 'Rating',
                      attr: 'colAlbumsUserRating',
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

export default AlbumArray;
