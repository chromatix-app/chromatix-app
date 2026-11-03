// Tests generated using AI

import { transposeAlbumArray, transposeArtistArray, transposePlaylistArray } from './plexTranspose';

// ======================================================================
// HELPERS
// ======================================================================

const response = (metadata: object[]) => ({ data: { MediaContainer: { Metadata: metadata } } });

const artists = (metadata: object[]) => transposeArtistArray(response(metadata), '1', 'https://server', 'token');
const albums = (metadata: object[]) => transposeAlbumArray(response(metadata), '1', 'https://server', 'token');

// ======================================================================
// TESTS
// ======================================================================

describe('Testing "sortTitle" in Plex transposes', () => {
  test('Keeps a sort title set by hand', () => {
    const [artist] = artists([{ ratingKey: '1', title: 'David Bowie', titleSort: 'Bowie, David' }]);
    const [album] = albums([{ ratingKey: '2', title: 'Greatest Hits', titleSort: 'Queen Greatest Hits' }]);
    expect(artist.sortTitle).toBe('Bowie, David');
    expect(album.sortTitle).toBe('Queen Greatest Hits');
  });

  test('Leaves sortTitle out when there is no sort title', () => {
    const [artist] = artists([{ ratingKey: '1', title: 'Nightwish' }]);
    expect(artist).not.toHaveProperty('sortTitle');
  });

  test('Leaves sortTitle out when the sort title is the same as the title', () => {
    const [artist] = artists([{ ratingKey: '1', title: 'Nightwish', titleSort: 'Nightwish' }]);
    expect(artist).not.toHaveProperty('sortTitle');
  });

  test('Leaves sortTitle out when Plex generated the sort title', () => {
    const [artist] = artists([{ ratingKey: '1', title: 'The Offspring', titleSort: 'Offspring' }]);
    const [album] = albums([{ ratingKey: '2', title: 'Skeletá', titleSort: 'Skeleta' }]);
    expect(artist).not.toHaveProperty('sortTitle');
    expect(album).not.toHaveProperty('sortTitle');
  });

  test('Trims the sort title and leaves it out when only whitespace', () => {
    const [trimmed, blank] = artists([
      { ratingKey: '1', title: 'David Bowie', titleSort: '  Bowie, David ' },
      { ratingKey: '2', title: 'Nightwish', titleSort: '   ' },
    ]);
    expect(trimmed.sortTitle).toBe('Bowie, David');
    expect(blank).not.toHaveProperty('sortTitle');
  });

  test('Never gives playlists a sort title', () => {
    const [playlist] = transposePlaylistArray(
      response([{ ratingKey: '3', title: 'Workout', titleSort: 'Best' }]),
      '1',
      'https://server',
      'token',
      0,
      {}
    );
    expect(playlist).not.toHaveProperty('sortTitle');
  });
});
