// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

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
      {isGridView && <ListCards variant="artists" entries={sortedArtists} />}
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
  const optionShowStarRatings_Deprecated = useSelector(
    ({ sessionModel }) => sessionModel.optionShowStarRatings_Deprecated
  );

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
                // only allow sorting by rating if the option is enabled
                ...(optionShowStarRatings_Deprecated ? [{ value: 'userRating', label: 'Rating' }] : []),
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
          </>
        )}
        {viewArtists === 'list' && (
          <FilterMenu
            label="Options"
            icon="EllipsisCircleIcon"
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
