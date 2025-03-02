// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { FilterSelect, FilterToggle, FilterWrap, ListCards, ListTableV2, Loading, TitleHeading } from 'js/components';
import { useGetAllPlaylists } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistList = () => {
  const {
    viewPlaylists,
    sortPlaylists,
    orderPlaylists,
    setViewPlaylists,
    setSortPlaylists,
    setOrderPlaylists,
    sortedPlaylists,
  } = useGetAllPlaylists();

  const isLoading = !sortedPlaylists;
  const isEmptyList = !isLoading && sortedPlaylists?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewPlaylists === 'grid';
  const isListView = !isLoading && !isEmptyList && viewPlaylists === 'list';

  return (
    <>
      {(isLoading || isEmptyList || isGridView) && (
        <Title
          isListView={isListView}
          orderPlaylists={orderPlaylists}
          setOrderPlaylists={setOrderPlaylists}
          setSortPlaylists={setSortPlaylists}
          setViewPlaylists={setViewPlaylists}
          sortedPlaylists={sortedPlaylists}
          sortPlaylists={sortPlaylists}
          viewPlaylists={viewPlaylists}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && <ListCards variant="playlists" entries={sortedPlaylists} />}
      {isListView && (
        <ListTableV2 variant="playlists" entries={sortedPlaylists} sortKey={sortPlaylists} orderKey={orderPlaylists}>
          <Title
            isListView={isListView}
            orderPlaylists={orderPlaylists}
            setOrderPlaylists={setOrderPlaylists}
            setSortPlaylists={setSortPlaylists}
            setViewPlaylists={setViewPlaylists}
            sortedPlaylists={sortedPlaylists}
            sortPlaylists={sortPlaylists}
            viewPlaylists={viewPlaylists}
          />
        </ListTableV2>
      )}
    </>
  );
};

const Title = ({
  isListView,
  orderPlaylists,
  setOrderPlaylists,
  setSortPlaylists,
  setViewPlaylists,
  sortedPlaylists,
  sortPlaylists,
  viewPlaylists,
}) => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  return (
    <>
      <TitleHeading
        key="PlaylistList"
        title="Playlists"
        subtitle={
          sortedPlaylists ? (
            sortedPlaylists?.length + ' Playlist' + (sortedPlaylists?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
        padding={!isListView}
      />
      <FilterWrap padding={!isListView}>
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
                // only allow sorting by rating if the option is enabled
                ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
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
          </>
        )}
      </FilterWrap>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistList;
