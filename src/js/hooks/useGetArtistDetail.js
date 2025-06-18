import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as bridge from 'js/services/bridge';

const useGetArtistDetail = ({ libraryId, artistId }) => {
  const dispatch = useDispatch();

  const allArtists = useSelector(({ appModel }) => appModel.allArtists);
  const artistInfo = allArtists?.find((artist) => artist.artistId === artistId);

  const artistThumb = artistInfo?.thumb;
  const artistName = artistInfo?.title;
  const artistCountry = artistInfo?.country;
  const artistGenre = artistInfo?.genre;
  const artistRating = artistInfo?.userRating;

  const gridArtistAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.gridArtistAlbumsUserRating);
  const artistAlbumsGroupByType = useSelector(({ sessionModel }) => sessionModel.artistAlbumsGroupByType);

  const colArtistAlbumsGenre = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsGenre);
  const colArtistAlbumsReleaseDate = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsReleaseDate);
  const colArtistAlbumsAddedAt = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsAddedAt);
  const colArtistAlbumsLastPlayed = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsLastPlayed);
  const colArtistAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsUserRating);

  const colArtistTracksArtwork = useSelector(({ sessionModel }) => sessionModel.colArtistTracksArtwork);
  const colArtistTracksArtist = useSelector(({ sessionModel }) => sessionModel.colArtistTracksArtist);
  const colArtistTracksAlbum = useSelector(({ sessionModel }) => sessionModel.colArtistTracksAlbum);
  const colArtistTracksReleaseDate = useSelector(({ sessionModel }) => sessionModel.colArtistTracksReleaseDate);
  const colArtistTracksCodec = useSelector(({ sessionModel }) => sessionModel.colArtistTracksCodec);
  const colArtistTracksBitrate = useSelector(({ sessionModel }) => sessionModel.colArtistTracksBitrate);
  const colArtistTracksDuration = useSelector(({ sessionModel }) => sessionModel.colArtistTracksDuration);
  const colArtistTracksUserRating = useSelector(({ sessionModel }) => sessionModel.colArtistTracksUserRating);

  const optionSortNumbersFirst = useSelector(({ sessionModel }) => sessionModel.optionSortNumbersFirst);
  const optionSortIgnoreLeadingArticles = useSelector(
    ({ sessionModel }) => sessionModel.optionSortIgnoreLeadingArticles
  );

  const allArtistAlbums = useSelector(({ appModel }) => appModel.allArtistAlbums);
  const artistAlbums = allArtistAlbums[libraryId + '-' + artistId];

  const allArtistRelatedAlbums = useSelector(({ appModel }) => appModel.allArtistRelatedAlbums);
  const artistRelated = allArtistRelatedAlbums[libraryId + '-' + artistId];

  const allArtistAppearanceAlbums = useSelector(({ appModel }) => appModel.allArtistAppearanceAlbums);
  const artistAppearances = allArtistAppearanceAlbums[libraryId + '-' + artistId];

  const allArtistTracks = useSelector(({ appModel }) => appModel.allArtistTracks);
  const artistTracks = allArtistTracks[libraryId + '-' + artistId];

  const artistAlbumTotal = artistAlbums?.length || 0;
  const artistRelatedTotal = artistRelated?.reduce((acc, entry) => acc + entry.related.length, 0) || 0;
  const artistAppearancesTotal = artistAppearances?.length || 0;
  const artistReleasesTotal = artistAlbumTotal + artistRelatedTotal + artistAppearancesTotal;
  const artistTracksTotal = artistTracks?.length || 0;

  const viewArtistAlbums = useSelector(({ sessionModel }) => sessionModel.viewArtistAlbums);
  const sortArtistAlbums = useSelector(({ sessionModel }) => sessionModel.sortArtistAlbums);
  const orderArtistAlbums = useSelector(({ sessionModel }) => sessionModel.orderArtistAlbums);

  const sortArtistTracks = useSelector(({ sessionModel }) => sessionModel.sortArtistTracks);
  const orderArtistTracks = useSelector(({ sessionModel }) => sessionModel.orderArtistTracks);

  // prevent sorting by a hidden field
  const allowedSort = {
    title: true,
    addedAt: viewArtistAlbums === 'grid' || (viewArtistAlbums === 'list' && colArtistAlbumsAddedAt),
    lastPlayed: viewArtistAlbums === 'grid' || (viewArtistAlbums === 'list' && colArtistAlbumsLastPlayed),
    genre: viewArtistAlbums === 'list' && colArtistAlbumsGenre,
    releaseDate: viewArtistAlbums === 'grid' || (viewArtistAlbums === 'list' && colArtistAlbumsReleaseDate),
    userRating: viewArtistAlbums === 'grid' || (viewArtistAlbums === 'list' && colArtistAlbumsUserRating),
  };
  const actualSortArtistAlbums = allowedSort[sortArtistAlbums] ? sortArtistAlbums : 'title';
  const actualOrderArtistAlbums = allowedSort[sortArtistAlbums] ? orderArtistAlbums : 'asc';

  const allowedTrackSort = {
    title: true,
    artist: colArtistTracksArtist,
    album: colArtistTracksAlbum,
    releaseDate: colArtistTracksReleaseDate,
    codec: colArtistTracksCodec,
    bitrate: colArtistTracksBitrate,
    userRating: colArtistTracksUserRating,
    duration: colArtistTracksDuration,
  };
  const actualSortArtistTracks = allowedTrackSort[sortArtistTracks] ? sortArtistTracks : 'title';
  const actualOrderArtistTracks = allowedTrackSort[sortArtistTracks] ? orderArtistTracks : 'asc';

  // Sort albums
  const sortedArtistAlbums = artistAlbums
    ? sortList({
        entries: artistAlbums,
        options: actualSortArtistAlbums,
        direction: actualOrderArtistAlbums,
        sortNumbersFirst: optionSortNumbersFirst,
        ignoreLeadingArticles: optionSortIgnoreLeadingArticles,
      })
    : null;
  const sortedArtistRelated = artistRelated?.map((entry) => {
    const sortedEntry =
      entry && entry.related
        ? sortList({
            entries: entry.related,
            options: actualSortArtistAlbums,
            direction: actualOrderArtistAlbums,
            sortNumbersFirst: optionSortNumbersFirst,
            ignoreLeadingArticles: optionSortIgnoreLeadingArticles,
          })
        : null;
    return {
      ...entry,
      related: sortedEntry,
    };
  });
  const sortedArtistAppearances = artistAppearances
    ? sortList({
        entries: artistAppearances,
        options: actualSortArtistAlbums,
        direction: actualOrderArtistAlbums,
        sortNumbersFirst: optionSortNumbersFirst,
        ignoreLeadingArticles: optionSortIgnoreLeadingArticles,
      })
    : null;

  // Combine all releases into a single array
  let sortedAllReleases = [];
  if (sortedArtistAlbums) {
    sortedAllReleases.push(
      ...sortedArtistAlbums.map((album) => {
        return {
          ...album,
          albumGroup: 'Albums',
          releaseGroup: '',
        };
      })
    );
  }
  if (sortedArtistRelated) {
    for (let i = 0; i < sortedArtistRelated.length; i++) {
      const related = sortedArtistRelated[i];
      for (let j = 0; j < related.related.length; j++) {
        const album = related.related[j];
        sortedAllReleases.push({
          ...album,
          albumGroup: related.title,
          releaseGroup: '',
        });
      }
    }
  }
  if (!artistAlbumsGroupByType) {
    sortedAllReleases = sortList({
      entries: sortedAllReleases,
      options: actualSortArtistAlbums,
      direction: actualOrderArtistAlbums,
      sortNumbersFirst: optionSortNumbersFirst,
      ignoreLeadingArticles: optionSortIgnoreLeadingArticles,
    });
  }

  // Combine all releases and appearances into a single array
  let sortedAllReleasesAndAppearances = [...sortedAllReleases];
  if (sortedArtistAppearances) {
    sortedAllReleasesAndAppearances.push(
      ...sortedArtistAppearances.map((album) => {
        return {
          ...album,
          albumGroup: 'Appears On',
          releaseGroup: 'Appears On',
        };
      })
    );
  }

  // Sort tracks
  const sortedArtistTracks = useMemo(() => {
    if (!artistTracks) return null;
    // Modify sort string for specific cases
    let sortAppend = '';
    if (['album', 'releaseDate'].includes(actualSortArtistTracks)) {
      sortAppend = '-asc-album-asc-discNumber-asc-trackNumber-asc';
      if (actualOrderArtistTracks === 'desc') {
        sortAppend = sortAppend.replace('-discNumber-asc-trackNumber-asc', '-discNumber-desc-trackNumber-desc');
      }
    }
    // Add originalIndex to each entry
    const entriesWithOriginalIndex = artistTracks?.map((entry, index) => ({
      ...entry,
      originalIndex: index,
    }));
    // Sort entries
    return artistTracks
      ? sortList({
          entries: entriesWithOriginalIndex,
          options: actualSortArtistTracks + sortAppend,
          direction: actualOrderArtistTracks,
          sortNumbersFirst: optionSortNumbersFirst,
          ignoreLeadingArticles: optionSortIgnoreLeadingArticles,
        })
      : null;
  }, [
    artistTracks,
    actualSortArtistTracks,
    actualOrderArtistTracks,
    optionSortNumbersFirst,
    optionSortIgnoreLeadingArticles,
  ]);

  const sortedArtistTracksOrder = useMemo(() => {
    return sortedArtistTracks?.map((entry) => entry.originalIndex);
  }, [sortedArtistTracks]);

  const setViewArtistAlbums = (viewArtistAlbums) => {
    dispatch.sessionModel.setSessionState({
      viewArtistAlbums,
    });
  };

  const setSortArtistAlbums = (sortArtistAlbums) => {
    dispatch.sessionModel.setSessionState({
      sortArtistAlbums,
    });
  };

  const setOrderArtistAlbums = (orderArtistAlbums) => {
    dispatch.sessionModel.setSessionState({
      sortArtistAlbums: actualSortArtistAlbums,
      orderArtistAlbums,
    });
  };

  const setColumnVisibility = (columnKey, columnValue) => {
    dispatch.sessionModel.setSessionState({
      [columnKey]: columnValue,
    });
  };

  // Get the required artist data
  useEffect(() => {
    // bridge.getAllArtists();
    if (!artistInfo) {
      bridge.getArtistDetails(libraryId, artistId);
    }
    bridge.getAllArtistAlbums(libraryId, artistId);
    bridge.getAllArtistRelatedAlbums(libraryId, artistId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryId, artistId]);

  // Fallback in case artist data is not included in the allArtists array
  useEffect(() => {
    if (allArtists && !artistInfo) {
      bridge.getArtistDetails(libraryId, artistId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allArtists, artistInfo]);

  // Get the artist appearance albums
  useEffect(() => {
    if (libraryId && artistId && artistName) {
      bridge.getAllArtistAppearanceAlbums(libraryId, artistId, artistName);
    }
  }, [libraryId, artistId, artistName]);

  // Get the artist tracks
  useEffect(() => {
    if (viewArtistAlbums === 'track' && libraryId && artistId && artistName) {
      bridge.getAllArtistTracks(libraryId, artistId, artistName);
    }
  }, [libraryId, artistId, artistName, viewArtistAlbums]);

  return {
    artistInfo,
    artistThumb,
    artistName,
    artistCountry,
    artistGenre,
    artistRating,

    sortedArtistAlbums,
    sortedArtistRelated,
    sortedArtistAppearances,

    sortedAllReleasesAndAppearances,
    sortedArtistTracks: viewArtistAlbums === 'track' ? sortedArtistTracks : null,
    sortedArtistTracksOrder: viewArtistAlbums === 'track' ? sortedArtistTracksOrder : null,

    artistAlbumsGroupByType,

    gridOptions: {
      userRating: gridArtistAlbumsUserRating,
    },

    colOptions: {
      genre: colArtistAlbumsGenre,
      releaseDate: colArtistAlbumsReleaseDate,
      addedAt: colArtistAlbumsAddedAt,
      lastPlayed: colArtistAlbumsLastPlayed,
      userRating: colArtistAlbumsUserRating,
    },

    colTrackOptions: {
      artwork: colArtistTracksArtwork,
      artist: colArtistTracksArtist,
      album: colArtistTracksAlbum,
      releaseDate: colArtistTracksReleaseDate,
      codec: colArtistTracksCodec,
      bitrate: colArtistTracksBitrate,
      duration: colArtistTracksDuration,
      userRating: colArtistTracksUserRating,
    },

    artistAlbumTotal,
    artistRelatedTotal,
    artistReleasesTotal,
    artistTracksTotal,

    viewArtistAlbums,
    sortArtistAlbums: actualSortArtistAlbums,
    orderArtistAlbums: actualOrderArtistAlbums,

    sortArtistTracks: actualSortArtistTracks,
    orderArtistTracks: actualOrderArtistTracks,

    setViewArtistAlbums,
    setSortArtistAlbums,
    setOrderArtistAlbums,
    setColumnVisibility,
  };
};

export default useGetArtistDetail;
