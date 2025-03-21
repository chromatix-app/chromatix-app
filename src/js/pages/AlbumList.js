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
  ListTableV2,
  Loading,
  TitleHeading,
} from 'js/components';
import { useGetAllAlbums } from 'js/hooks';

const isProduction = process.env.REACT_APP_ENV === 'production';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumList = () => {
  const {
    viewAlbums,
    sortAlbums,
    orderAlbums,
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
      {(isLoading || isEmptyList || isGridView) && (
        <Title
          colOptions={colOptions}
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
      {isGridView && <ListCards variant="albums" entries={sortedAlbums} />}
      {isListView && (
        <ListTableV2
          variant="albums"
          entries={sortedAlbums}
          sortKey={sortAlbums}
          orderKey={orderAlbums}
          colOptions={colOptions}
        >
          <Title
            colOptions={colOptions}
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
        </ListTableV2>
      )}
    </>
  );
};

const Title = ({
  colOptions,
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
        {!isProduction && viewAlbums === 'list' && (
          <FilterMenu
            label="Columns"
            icon="ColumnsCircleIcon"
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
                checked: colOptions.colAlbumsArtist,
              },
              {
                label: 'Released',
                attr: 'colAlbumsReleased',
                checked: colOptions.colAlbumsReleased,
              },
              {
                label: 'Added',
                attr: 'colAlbumsAdded',
                checked: colOptions.colAlbumsAdded,
              },
              {
                label: 'Last Played',
                attr: 'colAlbumsLastPlayed',
                checked: colOptions.colAlbumsLastPlayed,
              },
              // {
              //   label: 'Rating',
              //   attr: 'colAlbumsRating',
              //   checked: colOptions.colAlbumsRating,
              // },
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
