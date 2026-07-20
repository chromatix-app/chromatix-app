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

    // fields
    enableCountry: false,
    enableAddedAt: false,
    enableLastPlayed: false,
    enableUserRating: false,
    enableIsFavourite: true,

    // features
    playlistManagement: true,
    enableLyrics: false,
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

    // fields
    enableCountry: true,
    enableAddedAt: true,
    enableLastPlayed: true,
    enableUserRating: true,
    enableIsFavourite: false,

    // features
    playlistManagement: true,
    enableLyrics: true,
  },
};

export default platformFeatures;
