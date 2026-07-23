// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import {
  FilterMenu,
  FilterSelect,
  FilterToggle,
  FilterWrap,
  ViewGrid,
  ViewList,
  Loading,
  TitleHeading,
} from 'js/components';
import { useGetArtistArray } from 'js/hooks';
import platformFeatures from 'js/_config/platformFeatures';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistArray = ({ pageTitle = 'Artists', pageVariant = 'Artists', singularName = 'Artist' }) => {
  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

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
  } = useGetArtistArray({
    variant: pageVariant,
  });

  const isLoading = !sortedArtists;
  const isEmptyList = !isLoading && sortedArtists?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewArtists === 'grid';
  const isListView = !isLoading && !isEmptyList && viewArtists === 'list';

  return (
    <>
      {(isLoading || isEmptyList) && (
        <Title
          colOptions={colOptions}
          gridOptions={gridOptions}
          isGridView={isGridView}
          isListView={isListView}
          orderArtists={orderArtists}
          pageTitle={pageTitle}
          platformOpts={platformOpts}
          setColumnVisibility={setColumnVisibility}
          setOrderArtists={setOrderArtists}
          setSortArtists={setSortArtists}
          setViewArtists={setViewArtists}
          singularName={singularName}
          sortArtists={sortArtists}
          sortedArtists={sortedArtists}
          viewArtists={viewArtists}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && (
        <ViewGrid
          variant="artists"
          entries={sortedArtists}
          showFavs={gridOptions.isFavourite}
          showRatings={gridOptions.userRating}
        >
          <Title
            colOptions={colOptions}
            gridOptions={gridOptions}
            isGridView={isGridView}
            isListView={isListView}
            orderArtists={orderArtists}
            pageTitle={pageTitle}
            platformOpts={platformOpts}
            setColumnVisibility={setColumnVisibility}
            setOrderArtists={setOrderArtists}
            setSortArtists={setSortArtists}
            setViewArtists={setViewArtists}
            singularName={singularName}
            sortArtists={sortArtists}
            sortedArtists={sortedArtists}
            viewArtists={viewArtists}
          />
        </ViewGrid>
      )}
      {isListView && (
        <ViewList
          variant="artists"
          entries={sortedArtists}
          sortKey={sortArtists}
          orderKey={orderArtists}
          colOptions={colOptions}
        >
          <Title
            colOptions={colOptions}
            gridOptions={gridOptions}
            isGridView={isGridView}
            isListView={isListView}
            orderArtists={orderArtists}
            pageTitle={pageTitle}
            platformOpts={platformOpts}
            setColumnVisibility={setColumnVisibility}
            setOrderArtists={setOrderArtists}
            setSortArtists={setSortArtists}
            setViewArtists={setViewArtists}
            singularName={singularName}
            sortArtists={sortArtists}
            sortedArtists={sortedArtists}
            viewArtists={viewArtists}
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
  orderArtists,
  pageTitle,
  platformOpts,
  setColumnVisibility,
  setOrderArtists,
  setSortArtists,
  setViewArtists,
  singularName,
  sortArtists,
  sortedArtists,
  viewArtists,
}) => {
  return (
    <>
      <TitleHeading
        key="ArtistArray"
        title={pageTitle}
        subtitle={
          sortedArtists ? (
            sortedArtists?.length + ' ' + singularName + (sortedArtists?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
        padding={!isListView && !isGridView}
      />
      <FilterWrap padding={true} inset={isListView || isGridView}>
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
                ...(platformOpts?.enableAddedAt ? [{ value: 'addedAt', label: 'Date added' }] : []),
                ...(platformOpts?.enableLastPlayed ? [{ value: 'lastPlayed', label: 'Date played' }] : []),
                ...(platformOpts?.enableIsFavourite ? [{ value: 'isFavourite', label: 'Favourites' }] : []),
                ...(platformOpts?.enableUserRating ? [{ value: 'userRating', label: 'Rating' }] : []),
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
                ...(platformOpts?.enableIsFavourite
                  ? [
                      {
                        variant: 'checkbox',
                        label: 'Show favourites',
                        attr: 'gridArtistsIsFavourite',
                        checked: gridOptions.isFavourite,
                      },
                    ]
                  : []),
                ...(platformOpts?.enableUserRating
                  ? [
                      {
                        variant: 'checkbox',
                        label: 'Show star ratings',
                        attr: 'gridArtistsUserRating',
                        checked: gridOptions.userRating,
                      },
                    ]
                  : []),
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
                variant: 'checkbox',
                label: 'Title',
                disabled: true,
                checked: true,
              },
              ...(platformOpts?.enableCountry
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Country',
                      attr: 'colArtistsCountry',
                      checked: colOptions.country,
                    },
                  ]
                : []),
              {
                variant: 'checkbox',
                label: 'Genre',
                attr: 'colArtistsGenre',
                checked: colOptions.genre,
              },
              ...(platformOpts?.enableAddedAt
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Added',
                      attr: 'colArtistsAddedAt',
                      checked: colOptions.addedAt,
                    },
                  ]
                : []),
              ...(platformOpts?.enableLastPlayed
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Last played',
                      attr: 'colArtistsLastPlayed',
                      checked: colOptions.lastPlayed,
                    },
                  ]
                : []),
              ...(platformOpts?.enableIsFavourite
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Favourite',
                      attr: 'colArtistsIsFavourite',
                      checked: colOptions.isFavourite,
                    },
                  ]
                : []),
              ...(platformOpts?.enableUserRating
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Rating',
                      attr: 'colArtistsUserRating',
                      checked: colOptions.userRating,
                    },
                  ]
                : []),
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

export default ArtistArray;
