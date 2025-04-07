import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetCollectionItems = ({
  libraryId,
  collectionId,
  collectionFilter = 'collectionId',
  collectionKey,
  itemsKey,
}) => {
  const dispatch = useDispatch();

  const mediaType = collectionKey.includes('Artist') ? 'Artist' : 'Album';
  // const collectionType = collectionFilter.replace('Id', '');

  const viewCollectionItems = useSelector(({ sessionModel }) => sessionModel[`view${itemsKey}`]);
  const sortCollectionItems = useSelector(({ sessionModel }) => sessionModel[`sort${itemsKey}`]);
  const orderCollectionItems = useSelector(({ sessionModel }) => sessionModel[`order${itemsKey}`]);

  // prevent sub-sorting in list view
  const isSubSortList = viewCollectionItems === 'list' && sortCollectionItems.split('-').length > 2;

  const actualSortCollectionItems = isSubSortList ? 'artist' : sortCollectionItems;

  const allCollections = useSelector(({ appModel }) => appModel[`all${collectionKey}`]);
  const collectionInfo = allCollections?.find((collection) => collection[collectionFilter] === collectionId);

  const allCollectionItems = useSelector(({ appModel }) => appModel[`all${itemsKey}`]);
  const collectionInfoItems = allCollectionItems[libraryId + '-' + collectionId];

  const sortedCollectionItems = collectionInfoItems
    ? sortList(collectionInfoItems, actualSortCollectionItems, orderCollectionItems)
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

  const colCollectionArtistsCountry = useSelector(({ sessionModel }) => sessionModel.colCollectionArtistsCountry);
  const colCollectionArtistsGenre = useSelector(({ sessionModel }) => sessionModel.colCollectionArtistsGenre);
  const colCollectionArtistsAddedAt = useSelector(({ sessionModel }) => sessionModel.colCollectionArtistsAddedAt);
  const colCollectionArtistsLastPlayed = useSelector(({ sessionModel }) => sessionModel.colCollectionArtistsLastPlayed);
  const colCollectionArtistsUserRating = useSelector(({ sessionModel }) => sessionModel.colCollectionArtistsUserRating);

  const colCollectionAlbumsArtist = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsArtist);
  const colCollectionAlbumsGenre = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsGenre);
  const colCollectionAlbumsReleaseDate = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsReleaseDate);
  const colCollectionAlbumsAddedAt = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsAddedAt);
  const colCollectionAlbumsLastPlayed = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsLastPlayed);
  const colCollectionAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsUserRating);

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
      plex.getAllCollections();
      plex.getCollectionItems(libraryId, collectionId, mediaType);
    } else {
      plex.getAllTags(collectionKey);
      plex.getTagItems(libraryId, collectionId, itemsKey);
      // plex[`get${itemsKey}`](libraryId, collectionId);
    }
  }, [itemsKey, collectionId, collectionKey, libraryId, mediaType]);

  return {
    collectionInfo,
    sortedCollectionItems,

    viewCollectionItems,
    sortCollectionItems: actualSortCollectionItems,
    orderCollectionItems,

    gridOptions:
      mediaType === 'Artist'
        ? {
            userRating: gridArtistCollectionItemsUserRating,
          }
        : {
            userRating: gridAlbumCollectionItemsUserRating,
          },

    colOptions:
      mediaType === 'Artist'
        ? {
            country: colCollectionArtistsCountry,
            genre: colCollectionArtistsGenre,
            addedAt: colCollectionArtistsAddedAt,
            lastPlayed: colCollectionArtistsLastPlayed,
            userRating: colCollectionArtistsUserRating,
          }
        : {
            artist: colCollectionAlbumsArtist,
            genre: colCollectionAlbumsGenre,
            releaseDate: colCollectionAlbumsReleaseDate,
            addedAt: colCollectionAlbumsAddedAt,
            lastPlayed: colCollectionAlbumsLastPlayed,
            userRating: colCollectionAlbumsUserRating,
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
