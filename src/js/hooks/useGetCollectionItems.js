import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import platformFeatures from 'js/_config/platformFeatures';
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

  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  collectionId = safeEncodeURIComponent(safeDecodeURIComponent(collectionId));

  const mediaType = collectionKey.includes('Artist') ? 'Artist' : 'Album';
  // const collectionType = collectionFilter.replace('Id', '');

  // [NOTE] collection items and tag (genre / mood / style / tag) items have separate settings, but all four tag types
  // share one set between them. The four tag types are therefore collapsed onto a single 'TagItems' suffix here.
  const isCollection = itemsKey.includes('CollectionItems');
  const settingsKey = `${mediaType}${isCollection ? 'CollectionItems' : 'TagItems'}`;
  const colPrefix = `col${settingsKey}`;
  const gridPrefix = `grid${settingsKey}`;

  const viewCollectionItems = useSelector(({ sessionModel }) => sessionModel[`view${itemsKey}`]);
  const sortCollectionItems = useSelector(({ sessionModel }) => sessionModel[`sort${itemsKey}`]);
  const orderCollectionItems = useSelector(({ sessionModel }) => sessionModel[`order${itemsKey}`]);

  // [NOTE] artist and album views use different subsets of these - country is artist only, artist and releaseDate
  // are album only - so the unused ones simply resolve to undefined for the media type that does not show them.
  const gridArtist = useSelector(({ sessionModel }) => sessionModel[`${gridPrefix}Artist`]);
  const gridReleaseDate = useSelector(({ sessionModel }) => sessionModel[`${gridPrefix}ReleaseDate`]);
  const gridUserRating = useSelector(({ sessionModel }) => sessionModel[`${gridPrefix}UserRating`]);
  const gridIsFavourite = useSelector(({ sessionModel }) => sessionModel[`${gridPrefix}IsFavourite`]);

  const colArtist = useSelector(({ sessionModel }) => sessionModel[`${colPrefix}Artist`]);
  const colCountry = useSelector(({ sessionModel }) => sessionModel[`${colPrefix}Country`]);
  const colGenre = useSelector(({ sessionModel }) => sessionModel[`${colPrefix}Genre`]);
  const colReleaseDate = useSelector(({ sessionModel }) => sessionModel[`${colPrefix}ReleaseDate`]);
  const colAddedAt = useSelector(({ sessionModel }) => sessionModel[`${colPrefix}AddedAt`]);
  const colLastPlayed = useSelector(({ sessionModel }) => sessionModel[`${colPrefix}LastPlayed`]);
  const colUserRating = useSelector(({ sessionModel }) => sessionModel[`${colPrefix}UserRating`]);
  const colIsFavourite = useSelector(({ sessionModel }) => sessionModel[`${colPrefix}IsFavourite`]);

  const optionSortNumbersFirst = useSelector(({ sessionModel }) => sessionModel.optionSortNumbersFirst);
  const optionSortIgnoreLeadingArticles = useSelector(
    ({ sessionModel }) => sessionModel.optionSortIgnoreLeadingArticles
  );

  // prevent sorting by a hidden field
  const allowedSort =
    mediaType === 'Artist'
      ? {
          title: true,
          addedAt:
            platformOpts.enableAddedAt &&
            (viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colAddedAt)),
          country: platformOpts.enableCountry && viewCollectionItems === 'list' && colCountry,
          lastPlayed:
            platformOpts.enableLastPlayed &&
            (viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colLastPlayed)),
          genre: viewCollectionItems === 'list' && colGenre,
          userRating:
            platformOpts.enableUserRating &&
            (viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colUserRating)),
          isFavourite:
            platformOpts.enableIsFavourite &&
            (viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colIsFavourite)),
        }
      : {
          title: true,
          artist: viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colArtist),
          'artist-asc-releaseDate-asc': viewCollectionItems === 'grid',
          'artist-asc-releaseDate-desc': viewCollectionItems === 'grid',
          addedAt:
            platformOpts.enableAddedAt &&
            (viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colAddedAt)),
          lastPlayed:
            platformOpts.enableLastPlayed &&
            (viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colLastPlayed)),
          genre: viewCollectionItems === 'list' && colGenre,
          releaseDate: viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colReleaseDate),
          userRating:
            platformOpts.enableUserRating &&
            (viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colUserRating)),
          isFavourite:
            platformOpts.enableIsFavourite &&
            (viewCollectionItems === 'grid' || (viewCollectionItems === 'list' && colIsFavourite)),
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

  const collectionThumb = collectionInfo?.thumbSm;
  const collectionThumbMedium = collectionInfo?.thumbMd;
  const collectionTitle = collectionInfo?.title;
  const collectionRating = collectionInfo?.userRating;

  const setViewCollectionItems = (viewCollectionItems) => {
    dispatch.sessionModel.setSessionState({
      [`view${itemsKey}`]: viewCollectionItems,
    });
  };

  const setSortCollectionItems = (sortCollectionItems, orderCollectionItems) => {
    dispatch.sessionModel.setSessionState({
      [`sort${itemsKey}`]: sortCollectionItems,
      ...(orderCollectionItems !== undefined && { [`order${itemsKey}`]: orderCollectionItems }),
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
            userRating: platformOpts.enableUserRating && gridUserRating,
            isFavourite: platformOpts.enableIsFavourite && gridIsFavourite,
          }
        : {
            artist: gridArtist,
            releaseDate: gridReleaseDate,
            userRating: platformOpts.enableUserRating && gridUserRating,
            isFavourite: platformOpts.enableIsFavourite && gridIsFavourite,
          },

    colOptions:
      mediaType === 'Artist'
        ? {
            country: platformOpts.enableCountry && colCountry,
            genre: colGenre,
            addedAt: platformOpts.enableAddedAt && colAddedAt,
            lastPlayed: platformOpts.enableLastPlayed && colLastPlayed,
            userRating: platformOpts.enableUserRating && colUserRating,
            isFavourite: platformOpts.enableIsFavourite && colIsFavourite,
          }
        : {
            artist: colArtist,
            genre: colGenre,
            releaseDate: colReleaseDate,
            addedAt: platformOpts.enableAddedAt && colAddedAt,
            lastPlayed: platformOpts.enableLastPlayed && colLastPlayed,
            userRating: platformOpts.enableUserRating && colUserRating,
            isFavourite: platformOpts.enableIsFavourite && colIsFavourite,
          },

    setViewCollectionItems,
    setSortCollectionItems,
    setOrderCollectionItems,
    setColumnVisibility,

    collectionThumb,
    collectionThumbMedium,
    collectionTitle,
    collectionRating,
  };
};

export default useGetCollectionItems;
