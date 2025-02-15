// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { FilterSelect, FilterToggle, FilterWrap, ListCards, ListTableV2, Loading, TitleHeading } from 'js/components';
import { useGetAllAlbums } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumList = () => {
  const { viewAlbums, sortAlbums, orderAlbums, setViewAlbums, setSortAlbums, setOrderAlbums, sortedAlbums } =
    useGetAllAlbums();

  const isLoading = !sortedAlbums;
  const isEmptyList = !isLoading && sortedAlbums?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewAlbums === 'grid';
  const isListView = !isLoading && !isEmptyList && viewAlbums === 'list';

  return (
    <>
      {(isLoading || isEmptyList || isGridView) && (
        <Title
          isListView={isListView}
          orderAlbums={orderAlbums}
          setOrderAlbums={setOrderAlbums}
          setSortAlbums={setSortAlbums}
          setViewAlbums={setViewAlbums}
          sortAlbums={sortAlbums}
          sortedAlbums={sortedAlbums}
          viewAlbums={viewAlbums}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && <ListCards variant="albums" entries={sortedAlbums} />}
      {isListView && (
        <ListTableV2 variant="albums" entries={sortedAlbums} sortKey={sortAlbums} orderKey={orderAlbums}>
          <Title
            isListView={isListView}
            orderAlbums={orderAlbums}
            setOrderAlbums={setOrderAlbums}
            setSortAlbums={setSortAlbums}
            setViewAlbums={setViewAlbums}
            sortAlbums={sortAlbums}
            sortedAlbums={sortedAlbums}
            viewAlbums={viewAlbums}
          />
        </ListTableV2>
      )}
    </>
  );
};

const Title = ({
  isListView,
  orderAlbums,
  setOrderAlbums,
  setSortAlbums,
  setViewAlbums,
  sortAlbums,
  sortedAlbums,
  viewAlbums,
}) => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  return (
    <>
      <TitleHeading
        key="AlbumList"
        title="Albums"
        subtitle={
          sortedAlbums ? sortedAlbums?.length + ' Album' + (sortedAlbums?.length !== 1 ? 's' : '') : <>&nbsp;</>
        }
        padding={!isListView}
      />
      <FilterWrap padding={!isListView}>
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
                // only allow sorting by rating if the option is enabled
                ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
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
          </>
        )}
      </FilterWrap>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumList;
