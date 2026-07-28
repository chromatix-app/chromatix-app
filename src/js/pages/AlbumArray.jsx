// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import {
  ActionMenu,
  ActionSort,
  ActionToggle,
  ActionWrap,
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
          showArtist={gridOptions.artist}
          showReleaseDate={gridOptions.releaseDate}
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
      <ActionWrap padding={true} inset={isListView || isGridView}>
        <ActionToggle
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
            <ActionSort
              sortValue={sortAlbums}
              orderValue={orderAlbums}
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
              setSort={setSortAlbums}
              setOrder={setOrderAlbums}
            />
            <ActionMenu
              label="Options"
              icon="CogIcon"
              setter={setColumnVisibility}
              entries={[
                {
                  variant: 'checkbox',
                  label: 'Show album artists',
                  attr: 'gridAlbumsArtist',
                  checked: gridOptions.artist,
                },
                {
                  variant: 'checkbox',
                  label: 'Show release dates',
                  attr: 'gridAlbumsReleaseDate',
                  checked: gridOptions.releaseDate,
                },
                ...(platformOpts?.enableIsFavourite
                  ? [
                      {
                        variant: 'checkbox',
                        label: 'Show favourites',
                        attr: 'gridAlbumsIsFavourite',
                        checked: gridOptions.isFavourite,
                      },
                    ]
                  : []),
                ...(platformOpts?.enableUserRating
                  ? [
                      {
                        variant: 'checkbox',
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
                label: 'Artist',
                attr: 'colAlbumsArtist',
                checked: colOptions.artist,
              },
              {
                variant: 'checkbox',
                label: 'Genre',
                attr: 'colAlbumsGenre',
                checked: colOptions.genre,
              },
              {
                variant: 'checkbox',
                label: 'Released',
                attr: 'colAlbumsReleaseDate',
                checked: colOptions.releaseDate,
              },
              ...(platformOpts?.enableAddedAt
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Added',
                      attr: 'colAlbumsAddedAt',
                      checked: colOptions.addedAt,
                    },
                  ]
                : []),
              ...(platformOpts?.enableLastPlayed
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Last played',
                      attr: 'colAlbumsLastPlayed',
                      checked: colOptions.lastPlayed,
                    },
                  ]
                : []),
              ...(platformOpts?.enableIsFavourite
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Favourite',
                      attr: 'colAlbumsIsFavourite',
                      checked: colOptions.isFavourite,
                    },
                  ]
                : []),
              ...(platformOpts?.enableUserRating
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Rating',
                      attr: 'colAlbumsUserRating',
                      checked: colOptions.userRating,
                    },
                  ]
                : []),
            ]}
          />
        )}
      </ActionWrap>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumArray;
