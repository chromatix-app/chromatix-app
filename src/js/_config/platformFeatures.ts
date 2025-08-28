export const platformFeatures = {
  jellyfin: {
    // menu - library
    menuArtists: true,
    menuAlbumArtists: true,
    menuAlbums: true,
    menuFolders: false,
    menuPlaylists: true,

    // menu - browse
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
    enableCountry: false,
    enableUserRating: false,
    enableIsFavourite: true,
  },

  plex: {
    // menu - library
    menuArtists: true,
    menuAlbumArtists: false,
    menuAlbums: true,
    menuFolders: true,
    menuPlaylists: true,

    // menu - browse
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
    enableCountry: true,
    enableUserRating: true,
    enableIsFavourite: false,
  },
};

export default platformFeatures;
