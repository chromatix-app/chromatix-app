// ======================================================================
// IMPORTS
// ======================================================================

import {
  FilterMenu,
  FilterSelect,
  FilterToggle,
  FilterWrap,
  ListCards,
  ListTable,
  Loading,
  TitleHeading,
} from 'js/components';
import { useGetAllAlbums } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumList = () => {
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
  } = useGetAllAlbums();

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
        <ListCards
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
            setColumnVisibility={setColumnVisibility}
            setOrderAlbums={setOrderAlbums}
            setSortAlbums={setSortAlbums}
            setViewAlbums={setViewAlbums}
            sortAlbums={sortAlbums}
            sortedAlbums={sortedAlbums}
            viewAlbums={viewAlbums}
          />
        </ListCards>
      )}
      {isListView && (
        <ListTable
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
            setColumnVisibility={setColumnVisibility}
            setOrderAlbums={setOrderAlbums}
            setSortAlbums={setSortAlbums}
            setViewAlbums={setViewAlbums}
            sortAlbums={sortAlbums}
            sortedAlbums={sortedAlbums}
            viewAlbums={viewAlbums}
          />
        </ListTable>
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
        key="AlbumList"
        title="Albums"
        subtitle={
          sortedAlbums ? sortedAlbums?.length + ' Album' + (sortedAlbums?.length !== 1 ? 's' : '') : <>&nbsp;</>
        }
        padding={!isListView && !isGridView}
      />
      <FilterWrap padding={!isListView && !isGridView}>
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
                { value: 'addedAt', label: 'Date added' },
                { value: 'lastPlayed', label: 'Date played' },
                { value: 'releaseDate', label: 'Date released' },
                { value: 'userRating', label: 'Rating' },
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
                {
                  label: 'Show star ratings',
                  attr: 'gridAlbumsUserRating',
                  checked: gridOptions.userRating,
                },
                {
                  label: 'Show favourites',
                  attr: 'gridAlbumsIsFavourite',
                  checked: gridOptions.isFavourite,
                },
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
              {
                label: 'Added',
                attr: 'colAlbumsAddedAt',
                checked: colOptions.addedAt,
              },
              {
                label: 'Last played',
                attr: 'colAlbumsLastPlayed',
                checked: colOptions.lastPlayed,
              },
              {
                label: 'Rating',
                attr: 'colAlbumsUserRating',
                checked: colOptions.userRating,
              },
              {
                label: 'Favourite',
                attr: 'colAlbumsIsFavourite',
                checked: colOptions.isFavourite,
              },
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

export default AlbumList;
