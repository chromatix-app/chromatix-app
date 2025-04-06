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
import { useGetAllPlaylists } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistList = () => {
  const {
    viewPlaylists,
    sortPlaylists,
    orderPlaylists,
    colOptions,

    setViewPlaylists,
    setSortPlaylists,
    setOrderPlaylists,
    setColumnVisibility,

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
          colOptions={colOptions}
          isListView={isListView}
          orderPlaylists={orderPlaylists}
          setColumnVisibility={setColumnVisibility}
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
        <ListTable
          variant="playlists"
          entries={sortedPlaylists}
          sortKey={sortPlaylists}
          orderKey={orderPlaylists}
          colOptions={colOptions}
        >
          <Title
            colOptions={colOptions}
            isListView={isListView}
            orderPlaylists={orderPlaylists}
            setColumnVisibility={setColumnVisibility}
            setOrderPlaylists={setOrderPlaylists}
            setSortPlaylists={setSortPlaylists}
            setViewPlaylists={setViewPlaylists}
            sortedPlaylists={sortedPlaylists}
            sortPlaylists={sortPlaylists}
            viewPlaylists={viewPlaylists}
          />
        </ListTable>
      )}
    </>
  );
};

const Title = ({
  colOptions,
  isListView,
  orderPlaylists,
  setColumnVisibility,
  setOrderPlaylists,
  setSortPlaylists,
  setViewPlaylists,
  sortedPlaylists,
  sortPlaylists,
  viewPlaylists,
}) => {
  const optionShowStarRatings_Deprecated = useSelector(
    ({ sessionModel }) => sessionModel.optionShowStarRatings_Deprecated
  );

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
                ...(optionShowStarRatings_Deprecated ? [{ value: 'userRating', label: 'Rating' }] : []),
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
        {viewPlaylists === 'list' && (
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
                label: 'Tracks',
                attr: 'colPlaylistsTotalTracks',
                checked: colOptions.totalTracks,
              },
              {
                label: 'Duration',
                attr: 'colPlaylistsDuration',
                checked: colOptions.duration,
              },
              {
                label: 'Added',
                attr: 'colPlaylistsAddedAt',
                checked: colOptions.addedAt,
              },
              {
                label: 'Last Played',
                attr: 'colPlaylistsLastPlayed',
                checked: colOptions.lastPlayed,
              },
              {
                label: 'Rating',
                attr: 'colPlaylistsUserRating',
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

export default PlaylistList;
