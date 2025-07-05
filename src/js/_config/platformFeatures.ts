export const platformFeatures = {
  jellyfin: {
    // menu
    menuFolders: false,
    menuArtistCollections: false,
    menuAlbumCollections: false,
    menuArtistGenres: true,
    menuAlbumGenres: true,
    menuArtistStyles: false,
    menuAlbumStyles: false,
    menuArtistMoods: false,
    menuAlbumMoods: false,
    menuArtistTags: true,
    menuAlbumTags: true,

    // features
    enableUserRating: false,
    enableIsFavourite: true,
  },

  plex: {
    // menu
    menuFolders: true,
    menuArtistCollections: true,
    menuAlbumCollections: true,
    menuArtistGenres: true,
    menuAlbumGenres: true,
    menuArtistStyles: true,
    menuAlbumStyles: true,
    menuArtistMoods: true,
    menuAlbumMoods: true,
    menuArtistTags: false,
    menuAlbumTags: false,

    // features
    enableUserRating: true,
    enableIsFavourite: false,
  },
};

export default platformFeatures;
