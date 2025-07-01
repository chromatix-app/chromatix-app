import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { safeDecodeURIComponent, safeEncodeURIComponent, sortList } from 'js/utils';
import * as bridge from 'js/services/bridge';

const useGetCollectionItems = ({
  libraryId,
  collectionId,
  collectionFilter = 'collectionId',
  collectionKey,
  itemsKey,
}) => {
  const dispatch = useDispatch();

  collectionId = safeEncodeURIComponent(safeDecodeURIComponent(collectionId));

  const mediaType = collectionKey.includes('Artist') ? 'Artist' : 'Album';
  // const collectionType = collectionFilter.replace('Id', '');

  const viewCollectionItems = useSelector(({ sessionModel }) => sessionModel[`view${itemsKey}`]);
  const sortCollectionItems = useSelector(({ sessionModel }) => sessionModel[`sort${itemsKey}`]);
  const orderCollectionItems = useSelector(({ sessionModel }) => sessionModel[`order${itemsKey}`]);

  const colCollectionArtistsCountry = useSelector(({ sessionModel }) => sessionModel.colCollectionArtistsCountry);
  const colCollectionArtistsGenre = useSelector(({ sessionModel }) => sessionModel.colCollectionArtistsGenre);
  const colCollectionArtistsAddedAt = useSelector(({ sessionModel }) => sessionModel.colCollectionArtistsAddedAt);
  const colCollectionArtistsLastPlayed = useSelector(({ sessionModel }) => sessionModel.colCollectionArtistsLastPlayed);
  const colCollectionArtistsUserRating = useSelector(({ sessionModel }) => sessionModel.colCollectionArtistsUserRating);
  const colCollectionArtistsIsFavourite = useSelector(
    ({ sessionModel }) => sessionModel.colCollectionArtistsIsFavourite
  );

  const colCollectionAlbumsArtist = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsArtist);
  const colCollectionAlbumsGenre = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsGenre);
  const colCollectionAlbumsReleaseDate = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsReleaseDate);
  const colCollectionAlbumsAddedAt = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsAddedAt);
  const colCollectionAlbumsLastPlayed = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsLastPlayed);
  const colCollectionAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsUserRating);
  const colCollectionAlbumsIsFavourite = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsIsFavourite);

  const optionSortNumbersFirst = useSelector(({ sessionModel }) => sessionModel.optionSortNumbersFirst);
  const optionSortIgnoreLeadingArticles = useSelector(
    ({ sessionModel }) => sessionModel.optionSortIgnoreLeadingArticles
  );

  // prevent sorting by a hidden field
  const allowedSort =
    mediaType === 'Artist'
      ? {
          title: true,
          addedAt: viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colCollectionArtistsAddedAt),
          country: viewCollectionItems === 'list' && colCollectionArtistsCountry,
          lastPlayed:
            viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colCollectionArtistsLastPlayed),
          genre: viewCollectionItems === 'list' && colCollectionArtistsGenre,
          userRating:
            viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colCollectionArtistsUserRating),
          isFavourite:
            viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colCollectionArtistsIsFavourite),
        }
      : {
          title: true,
          artist: viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colCollectionAlbumsArtist),
          'artist-asc-releaseDate-asc': viewCollectionItems === 'grid',
          'artist-asc-releaseDate-desc': viewCollectionItems === 'grid',
          addedAt: viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colCollectionAlbumsAddedAt),
          lastPlayed:
            viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colCollectionAlbumsLastPlayed),
          genre: viewCollectionItems === 'list' && colCollectionAlbumsGenre,
          releaseDate:
            viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colCollectionAlbumsReleaseDate),
          userRating:
            viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colCollectionAlbumsUserRating),
          isFavourite:
            viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colCollectionAlbumsIsFavourite),
        };
  const actualSortCollectionItems = allowedSort[sortCollectionItems] ? sortCollectionItems : 'title';
  const actualOrderCollectionItems = allowedSort[sortCollectionItems] ? orderCollectionItems : 'asc';

  const allCollections = useSelector(({ appModel }) => appModel[`all${collectionKey}`]);
  const collectionInfo = allCollections?.find((collection) => collection[collectionFilter] === collectionId);

  const allCollectionItems = useSelector(({ appModel }) => appModel[`all${itemsKey}`]);
  const collectionInfoItems = allCollectionItems[libraryId + '-' + collectionId];

  const sortedCollectionItems = collectionInfoItems
    ? sortList({
        entries: collectionInfoItems,
        options: actualSortCollectionItems,
        direction: actualOrderCollectionItems,
        sortNumbersFirst: optionSortNumbersFirst,
        ignoreLeadingArticles: optionSortIgnoreLeadingArticles,
      })
    : null;

  const collectionThumb = collectionInfo?.thumb;
  const collectionTitle = collectionInfo?.title;
  const collectionRating = collectionInfo?.userRating;

  const gridArtistCollectionItemsUserRating = useSelector(
    ({ sessionModel }) => sessionModel.gridArtistCollectionItemsUserRating
  );
  const gridAlbumCollectionItemsUserRating = useSelector(
    ({ sessionModel }) => sessionModel.gridAlbumCollectionItemsUserRating
  );
  const gridArtistCollectionItemsIsFavourite = useSelector(
    ({ sessionModel }) => sessionModel.gridArtistCollectionItemsIsFavourite
  );
  const gridAlbumCollectionItemsIsFavourite = useSelector(
    ({ sessionModel }) => sessionModel.gridAlbumCollectionItemsIsFavourite
  );

  const setViewCollectionItems = (viewCollectionItems) => {
    dispatch.sessionModel.setSessionState({
      [`view${itemsKey}`]: viewCollectionItems,
    });
  };

  const setSortCollectionItems = (sortCollectionItems) => {
    dispatch.sessionModel.setSessionState({
      [`sort${itemsKey}`]: sortCollectionItems,
    });
  };

  const setOrderCollectionItems = (orderCollectionItems) => {
    dispatch.sessionModel.setSessionState({
      [`sort${itemsKey}`]: actualSortCollectionItems,
      [`order${itemsKey}`]: orderCollectionItems,
    });
  };

  const setColumnVisibility = (columnKey, columnValue) => {
    dispatch.sessionModel.setSessionState({
      [columnKey]: columnValue,
    });
  };

  useEffect(() => {
    if (collectionKey.includes('Collections')) {
      bridge.getAllCollections();
      bridge.getCollectionItems(libraryId, collectionId, mediaType);
    } else {
      bridge.getAllTags(collectionKey);
      bridge.getTagItems(libraryId, collectionId, itemsKey);
      // bridge[`get${itemsKey}`](libraryId, collectionId);
    }
  }, [itemsKey, collectionId, collectionKey, libraryId, mediaType]);

  return {
    collectionInfo,
    sortedCollectionItems,

    viewCollectionItems,
    sortCollectionItems: actualSortCollectionItems,
    orderCollectionItems: actualOrderCollectionItems,

    gridOptions:
      mediaType === 'Artist'
        ? {
            userRating: gridArtistCollectionItemsUserRating,
            isFavourite: gridArtistCollectionItemsIsFavourite,
          }
        : {
            userRating: gridAlbumCollectionItemsUserRating,
            isFavourite: gridAlbumCollectionItemsIsFavourite,
          },

    colOptions:
      mediaType === 'Artist'
        ? {
            country: colCollectionArtistsCountry,
            genre: colCollectionArtistsGenre,
            addedAt: colCollectionArtistsAddedAt,
            lastPlayed: colCollectionArtistsLastPlayed,
            userRating: colCollectionArtistsUserRating,
            isFavourite: colCollectionArtistsIsFavourite,
          }
        : {
            artist: colCollectionAlbumsArtist,
            genre: colCollectionAlbumsGenre,
            releaseDate: colCollectionAlbumsReleaseDate,
            addedAt: colCollectionAlbumsAddedAt,
            lastPlayed: colCollectionAlbumsLastPlayed,
            userRating: colCollectionAlbumsUserRating,
            isFavourite: colCollectionAlbumsIsFavourite,
          },

    setViewCollectionItems,
    setSortCollectionItems,
    setOrderCollectionItems,
    setColumnVisibility,

    collectionThumb,
    collectionTitle,
    collectionRating,
  };
};

export default useGetCollectionItems;
