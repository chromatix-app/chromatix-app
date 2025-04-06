// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { FilterMenu, FilterSelect, FilterToggle, ListCards, ListTable, Loading, TitleHeading } from 'js/components';
import { useGetCollectionItems } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumGenreItems = () => {
  const { libraryId, genreId } = useParams();

  const {
    collectionInfo,
    sortedCollectionItems,

    viewCollectionItems,
    sortCollectionItems,
    orderCollectionItems,
    colOptions,

    setViewCollectionItems,
    setSortCollectionItems,
    setOrderCollectionItems,
    setColumnVisibility,

    collectionThumb,
    collectionTitle,
  } = useGetCollectionItems({
    libraryId,
    collectionId: genreId,
    collectionFilter: 'genreId',
    collectionKey: 'AlbumGenres',
    itemsKey: 'AlbumGenreItems',
  });

  if (!collectionInfo) {
    return <Loading forceVisible inline showOffline />;
  }

  const isLoading = !sortedCollectionItems;
  const isEmptyList = !isLoading && sortedCollectionItems?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewCollectionItems === 'grid';
  const isListView = !isLoading && !isEmptyList && viewCollectionItems === 'list';

  return (
    <>
      {(isLoading || isEmptyList || isGridView) && (
        <Title
          collectionThumb={collectionThumb}
          collectionTitle={collectionTitle}
          colOptions={colOptions}
          genreId={genreId}
          isListView={isListView}
          libraryId={libraryId}
          orderCollectionItems={orderCollectionItems}
          setColumnVisibility={setColumnVisibility}
          setOrderCollectionItems={setOrderCollectionItems}
          setSortCollectionItems={setSortCollectionItems}
          setViewCollectionItems={setViewCollectionItems}
          sortCollectionItems={sortCollectionItems}
          sortedCollectionItems={sortedCollectionItems}
          viewCollectionItems={viewCollectionItems}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && <ListCards variant={'albums'} entries={sortedCollectionItems} />}
      {isListView && (
        <ListTable
          variant="albumGenreItems"
          entries={sortedCollectionItems}
          sortKey={sortCollectionItems}
          orderKey={orderCollectionItems}
          colOptions={colOptions}
        >
          <Title
            collectionThumb={collectionThumb}
            collectionTitle={collectionTitle}
            colOptions={colOptions}
            genreId={genreId}
            isListView={isListView}
            libraryId={libraryId}
            orderCollectionItems={orderCollectionItems}
            setColumnVisibility={setColumnVisibility}
            setOrderCollectionItems={setOrderCollectionItems}
            setSortCollectionItems={setSortCollectionItems}
            setViewCollectionItems={setViewCollectionItems}
            sortCollectionItems={sortCollectionItems}
            sortedCollectionItems={sortedCollectionItems}
            viewCollectionItems={viewCollectionItems}
          />
        </ListTable>
      )}
    </>
  );
};

const Title = ({
  collectionThumb,
  collectionTitle,
  colOptions,
  genreId,
  isListView,
  libraryId,
  orderCollectionItems,
  setColumnVisibility,
  setOrderCollectionItems,
  setSortCollectionItems,
  setViewCollectionItems,
  sortCollectionItems,
  sortedCollectionItems,
  viewCollectionItems,
}) => {
  const optionShowStarRatings_Deprecated = useSelector(
    ({ sessionModel }) => sessionModel.optionShowStarRatings_Deprecated
  );

  return (
    <TitleHeading
      key={libraryId + '-' + genreId}
      thumb={collectionThumb}
      title={collectionTitle}
      subtitle={
        sortedCollectionItems ? (
          sortedCollectionItems?.length + ' Album' + (sortedCollectionItems?.length !== 1 ? 's' : '')
        ) : (
          <>&nbsp;</>
        )
      }
      icon={'AlbumGenresIcon'}
      padding={!isListView}
      filters={
        <>
          <FilterToggle
            value={viewCollectionItems}
            options={[
              { value: 'grid', label: 'Grid view' },
              { value: 'list', label: 'List view' },
            ]}
            setter={setViewCollectionItems}
            icon={viewCollectionItems === 'grid' ? 'GridIcon' : 'ListIcon'}
          />
          {viewCollectionItems === 'grid' && (
            <>
              <FilterSelect
                value={sortCollectionItems}
                options={[
                  { value: 'title', label: 'Alphabetical' },
                  { value: 'artist', label: 'Artist' },
                  { value: 'artist-asc-releaseDate-asc', label: 'Artist, oldest release first' },
                  { value: 'artist-asc-releaseDate-desc', label: 'Artist, newest release first' },
                  { value: 'addedAt', label: 'Date added' },
                  { value: 'lastPlayed', label: 'Date played' },
                  { value: 'releaseDate', label: 'Date released' },
                  // only allow sorting by rating if the option is enabled
                  ...(optionShowStarRatings_Deprecated ? [{ value: 'userRating', label: 'Rating' }] : []),
                ]}
                setter={setSortCollectionItems}
              />
              <FilterToggle
                value={orderCollectionItems}
                options={[
                  { value: 'asc', label: 'Ascending' },
                  { value: 'desc', label: 'Descending' },
                ]}
                setter={setOrderCollectionItems}
                icon={orderCollectionItems === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
              />
            </>
          )}
          {viewCollectionItems === 'list' && (
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
                  label: 'Artist',
                  attr: 'colCollectionAlbumsArtist',
                  checked: colOptions.artist,
                },
                {
                  label: 'Genre',
                  attr: 'colCollectionAlbumsGenre',
                  checked: colOptions.genre,
                },
                {
                  label: 'Released',
                  attr: 'colCollectionAlbumsReleaseDate',
                  checked: colOptions.releaseDate,
                },
                {
                  label: 'Added',
                  attr: 'colCollectionAlbumsAddedAt',
                  checked: colOptions.addedAt,
                },
                {
                  label: 'Last Played',
                  attr: 'colCollectionAlbumsLastPlayed',
                  checked: colOptions.lastPlayed,
                },
                {
                  label: 'Rating',
                  attr: 'colCollectionAlbumsUserRating',
                  checked: colOptions.userRating,
                },
              ]}
            />
          )}
        </>
      }
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumGenreItems;
