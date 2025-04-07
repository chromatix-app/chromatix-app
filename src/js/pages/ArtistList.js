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
import { useGetAllArtists } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistList = () => {
  const {
    viewArtists,
    sortArtists,
    orderArtists,
    gridOptions,
    colOptions,

    setViewArtists,
    setSortArtists,
    setOrderArtists,
    setColumnVisibility,

    sortedArtists,
  } = useGetAllArtists();

  const isLoading = !sortedArtists;
  const isEmptyList = !isLoading && sortedArtists?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewArtists === 'grid';
  const isListView = !isLoading && !isEmptyList && viewArtists === 'list';

  return (
    <>
      {(isLoading || isEmptyList || isGridView) && (
        <Title
          colOptions={colOptions}
          gridOptions={gridOptions}
          isListView={isListView}
          orderArtists={orderArtists}
          setColumnVisibility={setColumnVisibility}
          setOrderArtists={setOrderArtists}
          setSortArtists={setSortArtists}
          setViewArtists={setViewArtists}
          sortArtists={sortArtists}
          sortedArtists={sortedArtists}
          viewArtists={viewArtists}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && <ListCards variant="artists" entries={sortedArtists} showRatings={gridOptions.userRating} />}
      {isListView && (
        <ListTable
          variant="artists"
          entries={sortedArtists}
          sortKey={sortArtists}
          orderKey={orderArtists}
          colOptions={colOptions}
        >
          <Title
            colOptions={colOptions}
            gridOptions={gridOptions}
            isListView={isListView}
            orderArtists={orderArtists}
            setColumnVisibility={setColumnVisibility}
            setOrderArtists={setOrderArtists}
            setSortArtists={setSortArtists}
            setViewArtists={setViewArtists}
            sortArtists={sortArtists}
            sortedArtists={sortedArtists}
            viewArtists={viewArtists}
          />
        </ListTable>
      )}
    </>
  );
};

const Title = ({
  colOptions,
  gridOptions,
  isListView,
  orderArtists,
  setColumnVisibility,
  setOrderArtists,
  setSortArtists,
  setViewArtists,
  sortArtists,
  sortedArtists,
  viewArtists,
}) => {
  return (
    <>
      <TitleHeading
        key="ArtistList"
        title="Artists"
        subtitle={
          sortedArtists ? sortedArtists?.length + ' Artist' + (sortedArtists?.length !== 1 ? 's' : '') : <>&nbsp;</>
        }
        padding={!isListView}
      />
      <FilterWrap padding={!isListView}>
        <FilterToggle
          value={viewArtists}
          options={[
            { value: 'grid', label: 'Grid view' },
            { value: 'list', label: 'List view' },
          ]}
          setter={setViewArtists}
          icon={viewArtists === 'grid' ? 'GridIcon' : 'ListIcon'}
        />
        {viewArtists === 'grid' && (
          <>
            <FilterSelect
              value={sortArtists}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'addedAt', label: 'Date added' },
                { value: 'lastPlayed', label: 'Date played' },
                { value: 'userRating', label: 'Rating' },
              ]}
              setter={setSortArtists}
            />
            <FilterToggle
              value={orderArtists}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={setOrderArtists}
              icon={orderArtists === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
            />
            <FilterMenu
              label="Options"
              icon="CogIcon"
              setter={setColumnVisibility}
              entries={[
                {
                  label: 'Show star ratings',
                  attr: 'gridArtistsUserRating',
                  checked: gridOptions.userRating,
                },
              ]}
            />
          </>
        )}
        {viewArtists === 'list' && (
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
                label: 'Country',
                attr: 'colArtistsCountry',
                checked: colOptions.country,
              },
              {
                label: 'Genre',
                attr: 'colArtistsGenre',
                checked: colOptions.genre,
              },
              {
                label: 'Added',
                attr: 'colArtistsAddedAt',
                checked: colOptions.addedAt,
              },
              {
                label: 'Last Played',
                attr: 'colArtistsLastPlayed',
                checked: colOptions.lastPlayed,
              },
              {
                label: 'Rating',
                attr: 'colArtistsUserRating',
                checked: colOptions.userRating,
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

export default ArtistList;
