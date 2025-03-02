// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { FilterSelect, FilterToggle, FilterWrap, ListCards, ListTableV2, Loading, TitleHeading } from 'js/components';
import { useGetAllArtists } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistList = () => {
  const { viewArtists, sortArtists, orderArtists, setViewArtists, setSortArtists, setOrderArtists, sortedArtists } =
    useGetAllArtists();

  const isLoading = !sortedArtists;
  const isEmptyList = !isLoading && sortedArtists?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewArtists === 'grid';
  const isListView = !isLoading && !isEmptyList && viewArtists === 'list';

  return (
    <>
      {(isLoading || isEmptyList || isGridView) && (
        <Title
          isListView={isListView}
          orderArtists={orderArtists}
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
        <ListTableV2 variant="artists" entries={sortedArtists} sortKey={sortArtists} orderKey={orderArtists}>
          <Title
            isListView={isListView}
            orderArtists={orderArtists}
            setOrderArtists={setOrderArtists}
            setSortArtists={setSortArtists}
            setViewArtists={setViewArtists}
            sortArtists={sortArtists}
            sortedArtists={sortedArtists}
            viewArtists={viewArtists}
          />
        </ListTableV2>
      )}
    </>
  );
};

const Title = ({
  isListView,
  orderArtists,
  setOrderArtists,
  setSortArtists,
  setViewArtists,
  sortArtists,
  sortedArtists,
  viewArtists,
}) => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

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
                ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
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
      </FilterWrap>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistList;
