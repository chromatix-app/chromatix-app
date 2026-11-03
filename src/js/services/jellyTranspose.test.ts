// Tests generated using AI

import {
  transposeAlbumArray,
  transposeAlbumArtistArray,
  transposeArtistArray,
  transposePlaylistArray,
} from './jellyTranspose';

// ======================================================================
// HELPERS
// ======================================================================

const response = (items: object[]) => ({ data: { Items: items } });

const artists = (items: object[]) => transposeArtistArray(response(items), '1', 'https://server', 'token');

// ======================================================================
// TESTS
// ======================================================================

describe('Testing "sortTitle" in Jellyfin transposes', () => {
  test('Uses ForcedSortName as typed for artists, album artists, albums and playlists', () => {
    const item = { Id: '1', Name: 'The Offspring', SortName: 'offspring', ForcedSortName: 'Offspring' };
    const [artist] = artists([item]);
    const [albumArtist] = transposeAlbumArtistArray(response([item]), '1', 'https://server', 'token');
    const [album] = transposeAlbumArray(
      response([{ Id: '2', Name: 'The Brightest Void', ForcedSortName: 'Brightest Void' }]),
      '1',
      'https://server',
      'token'
    );
    const [playlist] = transposePlaylistArray(
      response([{ Id: '3', Name: 'A1 Test', ForcedSortName: 'Test' }]),
      '1',
      'https://server',
      'token'
    );
    expect(artist.sortTitle).toBe('Offspring');
    expect(albumArtist.sortTitle).toBe('Offspring');
    expect(album.sortTitle).toBe('Brightest Void');
    expect(playlist.sortTitle).toBe('Test');
  });

  test('Never uses the generated SortName', () => {
    const [artist] = artists([{ Id: '1', Name: 'The Offspring', SortName: 'offspring' }]);
    expect(artist).not.toHaveProperty('sortTitle');
  });

  test('Leaves sortTitle out when ForcedSortName is the same as the name', () => {
    const [artist] = artists([{ Id: '1', Name: 'Nightwish', ForcedSortName: 'Nightwish' }]);
    expect(artist).not.toHaveProperty('sortTitle');
  });

  test('Trims ForcedSortName and leaves it out when empty or only whitespace', () => {
    const [trimmed, empty, blank] = artists([
      { Id: '1', Name: 'David Bowie', ForcedSortName: ' Bowie, David  ' },
      { Id: '2', Name: 'Nightwish', ForcedSortName: '' },
      { Id: '3', Name: 'Epica', ForcedSortName: '   ' },
    ]);
    expect(trimmed.sortTitle).toBe('Bowie, David');
    expect(empty).not.toHaveProperty('sortTitle');
    expect(blank).not.toHaveProperty('sortTitle');
  });
});
