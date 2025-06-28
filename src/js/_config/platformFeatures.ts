export const platformFeatures = {
  jellyfin: {
    // menu
    menuFolders: false,
    menuArtistCollections: true,
    menuAlbumCollections: true,
    menuArtistGenres: true,
    menuAlbumGenres: true,
    menuArtistStyles: false,
    menuAlbumStyles: false,
    menuArtistMoods: false,
    menuAlbumMoods: false,
    menuArtistTags: true,
    menuAlbumTags: true,

    // // general
    // userRating: true,
    // isFavourite: false,
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

    // // general
    // userRating: false,
    // isFavourite: true,
  },
};

export default platformFeatures;
