// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import {
  ActionMenu,
  ActionSort,
  ActionToggle,
  ActionWrap,
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

  // [NOTE] the list view needs its own variant, derived from pageVariant (e.g. 'albumArtists'), rather than the
  // generic grid variant ('artists'). Sorting via the table headers derives its session state key from this variant,
  // so using the generic one would write the sort to sortArtists for both this page and the album artists page.
  const listVariant = pageVariant.charAt(0).toLowerCase() + pageVariant.slice(1);

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
          pageVariant={pageVariant}
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
            pageVariant={pageVariant}
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
          variant={listVariant}
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
            pageVariant={pageVariant}
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
  pageVariant,
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
      <ActionWrap padding={true} inset={isListView || isGridView}>
        <ActionToggle
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
            <ActionSort
              sortValue={sortArtists}
              orderValue={orderArtists}
              options={[
                { value: 'title', label: 'Alphabetical' },
                ...(platformOpts?.enableAddedAt ? [{ value: 'addedAt', label: 'Date added' }] : []),
                ...(platformOpts?.enableLastPlayed ? [{ value: 'lastPlayed', label: 'Date played' }] : []),
                ...(platformOpts?.enableIsFavourite ? [{ value: 'isFavourite', label: 'Favourites' }] : []),
                ...(platformOpts?.enableUserRating ? [{ value: 'userRating', label: 'Rating' }] : []),
              ]}
              setSort={setSortArtists}
              setOrder={setOrderArtists}
            />
            <ActionMenu
              label="Options"
              icon="CogIcon"
              setter={setColumnVisibility}
              entries={[
                ...(platformOpts?.enableIsFavourite
                  ? [
                      {
                        variant: 'checkbox',
                        label: 'Show favourites',
                        attr: `grid${pageVariant}IsFavourite`,
                        checked: gridOptions.isFavourite,
                      },
                    ]
                  : []),
                ...(platformOpts?.enableUserRating
                  ? [
                      {
                        variant: 'checkbox',
                        label: 'Show star ratings',
                        attr: `grid${pageVariant}UserRating`,
                        checked: gridOptions.userRating,
                      },
                    ]
                  : []),
              ]}
            />
          </>
        )}
        {viewArtists === 'list' && (
          <ActionMenu
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
                      attr: `col${pageVariant}Country`,
                      checked: colOptions.country,
                    },
                  ]
                : []),
              {
                variant: 'checkbox',
                label: 'Genre',
                attr: `col${pageVariant}Genre`,
                checked: colOptions.genre,
              },
              ...(platformOpts?.enableAddedAt
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Added',
                      attr: `col${pageVariant}AddedAt`,
                      checked: colOptions.addedAt,
                    },
                  ]
                : []),
              ...(platformOpts?.enableLastPlayed
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Last played',
                      attr: `col${pageVariant}LastPlayed`,
                      checked: colOptions.lastPlayed,
                    },
                  ]
                : []),
              ...(platformOpts?.enableIsFavourite
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Favourite',
                      attr: `col${pageVariant}IsFavourite`,
                      checked: colOptions.isFavourite,
                    },
                  ]
                : []),
              ...(platformOpts?.enableUserRating
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Rating',
                      attr: `col${pageVariant}UserRating`,
                      checked: colOptions.userRating,
                    },
                  ]
                : []),
            ]}
          />
        )}
      </ActionWrap>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistArray;
