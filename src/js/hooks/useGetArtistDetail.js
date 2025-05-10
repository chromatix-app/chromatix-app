import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

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

  const colArtistAlbumsGenre = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsGenre);
  const colArtistAlbumsReleaseDate = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsReleaseDate);
  const colArtistAlbumsAddedAt = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsAddedAt);
  const colArtistAlbumsLastPlayed = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsLastPlayed);
  const colArtistAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsUserRating);

  const colArtistTracksArtist = useSelector(({ sessionModel }) => sessionModel.colArtistTracksArtist);
  const colArtistTracksAlbum = useSelector(({ sessionModel }) => sessionModel.colArtistTracksAlbum);
  const colArtistTracksReleaseDate = useSelector(({ sessionModel }) => sessionModel.colArtistTracksReleaseDate);
  const colArtistTracksCodec = useSelector(({ sessionModel }) => sessionModel.colArtistTracksCodec);
  const colArtistTracksBitrate = useSelector(({ sessionModel }) => sessionModel.colArtistTracksBitrate);
  const colArtistTracksDuration = useSelector(({ sessionModel }) => sessionModel.colArtistTracksDuration);
  const colArtistTracksUserRating = useSelector(({ sessionModel }) => sessionModel.colArtistTracksUserRating);

  const allArtistAlbums = useSelector(({ appModel }) => appModel.allArtistAlbums);
  const artistAlbums = allArtistAlbums[libraryId + '-' + artistId];

  const allArtistRelated = useSelector(({ appModel }) => appModel.allArtistRelated);
  const artistRelated = allArtistRelated[libraryId + '-' + artistId];

  const allArtistCompilationAlbums = useSelector(({ appModel }) => appModel.allArtistCompilationAlbums);
  const artistCompilations = allArtistCompilationAlbums[libraryId + '-' + artistId];

  const allArtistTracks = useSelector(({ appModel }) => appModel.allArtistTracks);
  const artistTracks = allArtistTracks[libraryId + '-' + artistId];

  const artistAlbumTotal = artistAlbums?.length || 0;
  const artistRelatedTotal = artistRelated?.reduce((acc, entry) => acc + entry.related.length, 0) || 0;
  const artistCompilationsTotal = artistCompilations?.length || 0;
  const artistReleasesTotal = artistAlbumTotal + artistRelatedTotal + artistCompilationsTotal;
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
    ? sortList(artistAlbums, actualSortArtistAlbums, actualOrderArtistAlbums)
    : null;
  const sortedArtistRelated = artistRelated?.map((entry) => {
    const sortedEntry =
      entry && entry.related ? sortList(entry.related, actualSortArtistAlbums, actualOrderArtistAlbums) : null;
    return {
      ...entry,
      related: sortedEntry,
    };
  });
  const sortedArtistCompilations = artistCompilations
    ? sortList(artistCompilations, actualSortArtistAlbums, actualOrderArtistAlbums)
    : null;

  // Combine all albums into a single array
  const allAlbums = [];
  if (sortedArtistAlbums) {
    allAlbums.push(
      ...sortedArtistAlbums.map((album) => {
        return {
          ...album,
          albumGroup: 'Albums',
        };
      })
    );
  }
  if (sortedArtistRelated) {
    for (let i = 0; i < sortedArtistRelated.length; i++) {
      const related = sortedArtistRelated[i];
      for (let j = 0; j < related.related.length; j++) {
        const album = related.related[j];
        allAlbums.push({
          ...album,
          albumGroup: related.title,
        });
      }
    }
  }
  if (sortedArtistCompilations) {
    allAlbums.push(
      ...sortedArtistCompilations.map((album) => {
        return {
          ...album,
          albumGroup: 'Appears On',
        };
      })
    );
  }

  // Sort tracks
  let sortAppend = '';
  if (['album', 'releaseDate'].includes(actualSortArtistTracks)) {
    sortAppend = '-asc-album-asc-trackNumber-asc';
    if (actualOrderArtistTracks === 'desc') {
      sortAppend = sortAppend.replace('-trackNumber-asc', '-trackNumber-desc');
    }
  }

  const entriesWithOriginalIndex = artistTracks?.map((entry, index) => ({
    ...entry,
    originalIndex: index,
  }));
  const sortedArtistTracks = artistTracks
    ? sortList(entriesWithOriginalIndex, actualSortArtistTracks + sortAppend, actualOrderArtistTracks)
    : null;

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
    // plex.getAllArtists();
    if (!artistInfo) {
      plex.getArtistDetails(libraryId, artistId);
    }
    plex.getAllArtistAlbums(libraryId, artistId);
    plex.getAllArtistRelated(libraryId, artistId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryId, artistId]);

  // Fallback in case artist data is not included in the allArtists array
  useEffect(() => {
    if (allArtists && !artistInfo) {
      plex.getArtistDetails(libraryId, artistId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allArtists, artistInfo]);

  // Get the artist compilation albums
  useEffect(() => {
    if (libraryId && artistId && artistName) {
      plex.getAllArtistAppearanceAlbums(libraryId, artistId, artistName);
    }
  }, [libraryId, artistId, artistName]);

  // Get the artist tracks
  useEffect(() => {
    if (viewArtistAlbums === 'track' && libraryId && artistId && artistName) {
      plex.getAllArtistTracks(libraryId, artistId, artistName);
    }
  }, [libraryId, artistId, artistName, viewArtistAlbums]);

  return {
    artistInfo,
    artistThumb,
    artistName,
    artistCountry,
    artistGenre,
    artistRating,

    artistAlbums: sortedArtistAlbums,
    artistRelated: sortedArtistRelated,
    artistCompilations: sortedArtistCompilations,
    sortedArtistAlbums: allAlbums,
    sortedArtistTracks: viewArtistAlbums === 'track' ? sortedArtistTracks : null,
    sortedArtistTracksOrder: viewArtistAlbums === 'track' ? sortedArtistTracksOrder : null,

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
