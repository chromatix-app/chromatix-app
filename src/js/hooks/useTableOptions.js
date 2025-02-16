import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useTableOptions = (variant, albumId, playlistId, folderId, sortKey, orderKey) => {
  const dispatch = useDispatch();

  const contentBreakpoint = useSelector(({ appModel }) => appModel.contentBreakpoint);
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const userRatingsAreVisible = optionShowStarRatings && contentBreakpoint >= 800;

  const [returnState, setReturnState] = useState(
    getTableOptions(variant, albumId, playlistId, folderId, sortKey, orderKey, userRatingsAreVisible, dispatch)
  );

  useEffect(() => {
    setReturnState(
      getTableOptions(variant, albumId, playlistId, folderId, sortKey, orderKey, userRatingsAreVisible, dispatch)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, sortKey, orderKey, userRatingsAreVisible]);

  return returnState;
};

const getTableOptions = (
  variant,
  albumId,
  playlistId,
  folderId,
  sortKey,
  orderKey,
  userRatingsAreVisible,
  dispatch
) => {
  let tableVariant;
  let tableOptions;

  // HELPERS FOR SORTING WHEN CLICKING ON TABLE HEADERS
  const handleSortList = (event) => {
    const sortKey = event.currentTarget.dataset.sort;
    dispatch.sessionModel.setSortList({
      variant,
      sortKey,
    });
  };

  const sortId = (variant === 'albumTracks' && albumId) || (variant === 'playlistTracks' && playlistId) || null;
  const handleSortTracks = (event) => {
    const sortKey = event.currentTarget.dataset.sort;
    dispatch.sessionModel.setSortTracks({
      variant,
      sortId,
      sortKey,
    });
  };

  const handleSortFunction =
    variant === 'albumTracks' || variant === 'playlistTracks' ? handleSortTracks : handleSortList;

  // ARTISTS
  if (
    variant === 'artists' ||
    variant === 'artistCollectionItems' ||
    variant === 'artistGenreItems' ||
    variant === 'artistMoodItems' ||
    variant === 'artistStyleItems'
  ) {
    tableVariant = 'artists';
    tableOptions = [
      {
        colKey: 'thumb',
        label: '',
        colWidth: '41px',
        visible: true,
        visibleInHeader: false,
      },
      {
        colKey: 'title',
        label: 'Artist',
        isDefault: true,
        colWidth: '1.2fr',
        headerStyle: {
          gridColumn: '1 / span 2',
        },
        isAsc: sortKey === 'title' && orderKey === 'asc',
        isDesc: sortKey === 'title' && orderKey === 'desc',
        visible: true,
      },
      // {
      //   colKey: 'genre',
      //   label: 'Genre',
      //   colWidth: '0.8fr',
      //   isAsc: sortKey === 'genre' && orderKey === 'asc',
      //   isDesc: sortKey === 'genre' && orderKey === 'desc',
      //   visible: true,
      // },
      {
        colKey: 'addedAt',
        label: 'Added',
        colWidth: '0.8fr',
        isAsc: sortKey === 'addedAt' && orderKey === 'asc',
        isDesc: sortKey === 'addedAt' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'lastPlayed',
        label: 'Last Played',
        colWidth: '0.8fr',
        isAsc: sortKey === 'lastPlayed' && orderKey === 'asc',
        isDesc: sortKey === 'lastPlayed' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'userRating',
        label: 'Rating',
        colWidth: '0.5fr',
        isAsc: sortKey === 'userRating' && orderKey === 'asc',
        isDesc: sortKey === 'userRating' && orderKey === 'desc',
        visible: userRatingsAreVisible,
      },
    ];
  }

  // ALBUMS
  else if (
    variant === 'albums' ||
    variant === 'albumCollectionItems' ||
    variant === 'albumGenreItems' ||
    variant === 'albumMoodItems' ||
    variant === 'albumStyleItems'
  ) {
    tableVariant = 'albums';
    tableOptions = [
      {
        colKey: 'thumb',
        label: '',
        colWidth: '41px',
        visible: true,
        visibleInHeader: false,
      },
      {
        colKey: 'title',
        label: 'Title',
        isDefault: true,
        colWidth: '1.2fr',
        headerStyle: {
          gridColumn: '1 / span 2',
        },
        isAsc: sortKey === 'title' && orderKey === 'asc',
        isDesc: sortKey === 'title' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'artist',
        label: 'Artist',
        colWidth: '1fr',
        isAsc: sortKey === 'artist' && orderKey === 'asc',
        isDesc: sortKey === 'artist' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'releaseDate',
        label: 'Released',
        colWidth: '0.8fr',
        isAsc: sortKey === 'releaseDate' && orderKey === 'asc',
        isDesc: sortKey === 'releaseDate' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'addedAt',
        label: 'Added',
        colWidth: '0.8fr',
        isAsc: sortKey === 'addedAt' && orderKey === 'asc',
        isDesc: sortKey === 'addedAt' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'lastPlayed',
        label: 'Last Played',
        colWidth: '0.8fr',
        isAsc: sortKey === 'lastPlayed' && orderKey === 'asc',
        isDesc: sortKey === 'lastPlayed' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'userRating',
        label: 'Rating',
        colWidth: '0.5fr',
        isAsc: sortKey === 'userRating' && orderKey === 'asc',
        isDesc: sortKey === 'userRating' && orderKey === 'desc',
        visible: userRatingsAreVisible,
      },
    ];
  }

  // FOLDERS
  else if (variant === 'folders') {
    tableVariant = 'folders';
    tableOptions = [
      {
        colKey: 'sortOrder',
        label: '#',
        isDefault: true,
        colWidth: '30px',
        headerClassName: 'colCenter',
        isAsc: sortKey === 'sortOrder' && orderKey === 'asc',
        isDesc: sortKey === 'sortOrder' && orderKey === 'desc',
        showArrows: false,
        visible: true,
      },
      {
        colKey: 'thumb',
        label: '',
        icon: 'FolderIcon',
        colWidth: '41px',
        visible: true,
        visibleInHeader: false,
      },
      {
        colKey: 'title',
        label: 'Title',
        colWidth: '2fr',
        headerStyle: {
          gridColumn: '2 / span 2',
        },
        isAsc: sortKey === 'title' && orderKey === 'asc',
        isDesc: sortKey === 'title' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'kind',
        label: 'Kind',
        colWidth: '1fr',
        isAsc: sortKey === 'kind' && orderKey === 'asc',
        isDesc: sortKey === 'kind' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'empty',
        colWidth: '1px',
        visible: true,
      },
    ];
  }

  // PLAYLISTS
  else if (variant === 'playlists') {
    tableVariant = 'playlists';
    tableOptions = [
      {
        colKey: 'thumb',
        label: '',
        colWidth: '41px',
        visible: true,
        visibleInHeader: false,
      },
      {
        colKey: 'title',
        label: 'Title',
        isDefault: true,
        colWidth: '1.2fr',
        headerStyle: {
          gridColumn: '1 / span 2',
        },
        isAsc: sortKey === 'title' && orderKey === 'asc',
        isDesc: sortKey === 'title' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'totalTracks',
        label: 'Tracks',
        colWidth: '1fr',
        isAsc: sortKey === 'totalTracks' && orderKey === 'asc',
        isDesc: sortKey === 'totalTracks' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'duration',
        label: 'Duration',
        colWidth: '1fr',
        isAsc: sortKey === 'duration' && orderKey === 'asc',
        isDesc: sortKey === 'duration' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'addedAt',
        label: 'Added',
        colWidth: '1fr',
        isAsc: sortKey === 'addedAt' && orderKey === 'asc',
        isDesc: sortKey === 'addedAt' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'lastPlayed',
        label: 'Last Played',
        colWidth: '1fr',
        isAsc: sortKey === 'lastPlayed' && orderKey === 'asc',
        isDesc: sortKey === 'lastPlayed' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'userRating',
        label: 'Rating',
        colWidth: '0.5fr',
        isAsc: sortKey === 'userRating' && orderKey === 'asc',
        isDesc: sortKey === 'userRating' && orderKey === 'desc',
        visible: userRatingsAreVisible,
      },
    ];
  }

  // COLLECTIONS
  else if (variant === 'artistCollections' || variant === 'albumCollections') {
    tableVariant = 'collections';
    tableOptions = [
      {
        colKey: 'thumb',
        label: '',
        colWidth: '41px',
        visible: true,
        visibleInHeader: false,
      },
      {
        colKey: 'title',
        label: 'Title',
        isDefault: true,
        colWidth: '1.2fr',
        headerStyle: {
          gridColumn: '1 / span 2',
        },
        isAsc: sortKey === 'title' && orderKey === 'asc',
        isDesc: sortKey === 'title' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'addedAt',
        label: 'Added',
        colWidth: '1fr',
        isAsc: sortKey === 'addedAt' && orderKey === 'asc',
        isDesc: sortKey === 'addedAt' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'userRating',
        label: 'Rating',
        colWidth: '0.5fr',
        isAsc: sortKey === 'userRating' && orderKey === 'asc',
        isDesc: sortKey === 'userRating' && orderKey === 'desc',
        visible: userRatingsAreVisible,
      },
    ];
  }

  // TAGS
  else if (
    variant === 'artistGenres' ||
    variant === 'albumGenres' ||
    variant === 'artistMoods' ||
    variant === 'albumMoods' ||
    variant === 'artistStyles' ||
    variant === 'albumStyles'
  ) {
    tableVariant = 'tags';
    tableOptions = [
      {
        colKey: 'thumb',
        label: '',
        icon: variant.charAt(0).toUpperCase() + variant.slice(1) + 'Icon',
        colWidth: '41px',
        visible: true,
        visibleInHeader: false,
      },
      {
        colKey: 'title',
        label: 'Title',
        isDefault: true,
        colWidth: '1.2fr',
        headerStyle: {
          gridColumn: '1 / span 2',
        },
        isAsc: sortKey === 'title' && orderKey === 'asc',
        isDesc: sortKey === 'title' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'empty',
        colWidth: '1fr',
        visible: true,
      },
    ];
  }

  // PLAYLIST TRACKS
  else if (variant === 'playlistTracks') {
    tableVariant = 'playlistTracks';
    tableOptions = [
      {
        colKey: 'sortOrder',
        label: '#',
        isDefault: true,
        colWidth: '30px',
        headerClassName: 'colCenter',
        isAsc: sortKey === 'sortOrder' && orderKey === 'asc',
        isDesc: sortKey === 'sortOrder' && orderKey === 'desc',
        showArrows: false,
        visible: true,
      },
      {
        colKey: 'thumb',
        label: '',
        icon: 'FolderIcon',
        colWidth: '41px',
        visible: true,
        visibleInHeader: false,
      },
      {
        colKey: 'title',
        label: 'Title',
        colWidth: '1.2fr',
        headerStyle: {
          gridColumn: '2 / span 2',
        },
        isAsc: sortKey === 'title' && orderKey === 'asc',
        isDesc: sortKey === 'title' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'artist',
        label: 'Artist',
        colWidth: '1fr',
        isAsc: sortKey === 'artist' && orderKey === 'asc',
        isDesc: sortKey === 'artist' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'album',
        label: 'Album',
        colWidth: '1fr',
        isAsc: sortKey === 'album' && orderKey === 'asc',
        isDesc: sortKey === 'album' && orderKey === 'desc',
        visible: true,
      },
      {
        colKey: 'userRating',
        label: 'Rating',
        colWidth: '0.5fr',
        isAsc: sortKey === 'userRating' && orderKey === 'asc',
        isDesc: sortKey === 'userRating' && orderKey === 'desc',
        visible: userRatingsAreVisible,
      },
      {
        colKey: 'duration',
        label: 'Duration',
        colWidth: 'minmax(72px, auto)',
        isAsc: sortKey === 'duration' && orderKey === 'asc',
        isDesc: sortKey === 'duration' && orderKey === 'desc',
        visible: true,
      },
    ];
  }

  // DETERMINE THE GRID TEMPLATE COLUMNS
  const gridTemplateColumns =
    tableOptions?.reduce((acc, option) => {
      return option.visible ? acc + ' ' + option.colWidth : acc;
    }, '') || '';

  // RETURN
  return {
    tableVariant,
    tableOptions,
    gridTemplateColumns,
    handleSortFunction,
  };
};

export default useTableOptions;
