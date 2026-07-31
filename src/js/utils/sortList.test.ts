// Tests generated using AI

import sortList from './sortList';

describe('Testing "sortList" function', () => {
  const entries = [
    { title: 'Song A', duration: 200, artist: 'Artist A', releaseDate: '2021-01-01' },
    { title: 'Song B', duration: 150, artist: 'Artist B', releaseDate: '2019-01-01' },
    { title: 'Song C', duration: 180, artist: 'Artist C', releaseDate: '2020-01-01' },
  ];

  // TITLE

  test('Test sorting by title ascending', () => {
    const sorted = sortList({ entries, options: 'title-asc' });
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song C');
  });

  test('Test sorting by title descending', () => {
    const sorted = sortList({ entries, options: 'title-asc', direction: 'desc' });
    expect(sorted[0].title).toBe('Song C');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song A');
  });

  test('Test sorting by title descending', () => {
    const sorted = sortList({ entries, options: 'title-desc' });
    expect(sorted[0].title).toBe('Song C');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song A');
  });

  // DURATION

  test('Test simple duration ascending', () => {
    const sorted = sortList({ entries, options: 'duration-asc' });
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song A');
  });

  test('Test simple duration descending', () => {
    const sorted = sortList({ entries, options: 'duration-asc', direction: 'desc' });
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song B');
  });

  test('Test simple duration descending', () => {
    const sorted = sortList({ entries, options: 'duration-desc' });
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song B');
  });

  test('Test sorting with primary and secondary keys', () => {
    const entriesWithSameDuration = [
      { title: 'Song A', duration: 200, artist: 'Artist B' },
      { title: 'Song B', duration: 200, artist: 'Artist A' },
      { title: 'Song C', duration: 150, artist: 'Artist C' },
    ];
    const sorted = sortList({ entries: entriesWithSameDuration, options: 'duration-asc-artist-asc' });
    expect(sorted[0].title).toBe('Song C');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song A');
  });

  // ARTIST

  test('Test sorting by artist ascending', () => {
    const sorted = sortList({ entries, options: 'artist-asc' });
    expect(sorted[0].artist).toBe('Artist A');
    expect(sorted[1].artist).toBe('Artist B');
    expect(sorted[2].artist).toBe('Artist C');
  });

  test('Test sorting by artist descending', () => {
    const sorted = sortList({ entries, options: 'artist-desc' });
    expect(sorted[0].artist).toBe('Artist C');
    expect(sorted[1].artist).toBe('Artist B');
    expect(sorted[2].artist).toBe('Artist A');
  });

  // RELEASE DATE

  test('Test sorting by releaseDate ascending', () => {
    const sorted = sortList({ entries, options: 'releaseDate-asc' });
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song A');
  });

  test('Test sorting by releaseDate descending', () => {
    const sorted = sortList({ entries, options: 'releaseDate-desc' });
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song B');
  });

  // ALBUM

  test('Test sorting by album ascending', () => {
    const entriesWithAlbums = [
      { title: 'Song A', album: 'Album B' },
      { title: 'Song B', album: 'Album A' },
      { title: 'Song C', album: 'Album C' },
    ];
    const sorted = sortList({ entries: entriesWithAlbums, options: 'album-asc' });
    expect(sorted[0].album).toBe('Album A');
    expect(sorted[1].album).toBe('Album B');
    expect(sorted[2].album).toBe('Album C');
  });

  // GENRE

  test('Test sorting by genre descending', () => {
    const entriesWithGenres = [
      { title: 'Song A', genre: 'Rock' },
      { title: 'Song B', genre: 'Jazz' },
      { title: 'Song C', genre: 'Pop' },
    ];
    const sorted = sortList({ entries: entriesWithGenres, options: 'genre-desc' });
    expect(sorted[0].genre).toBe('Rock');
    expect(sorted[1].genre).toBe('Pop');
    expect(sorted[2].genre).toBe('Jazz');
  });

  // MISSING FIELDS

  test('Test sorting with missing fields', () => {
    const entriesWithMissingFields = [
      { title: 'Song A', duration: 200 },
      { title: 'Song B' },
      { title: 'Song C', duration: 180 },
    ];
    const sorted = sortList({ entries: entriesWithMissingFields, options: 'duration-asc' });
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song A');
  });

  // EMPTY ARRAY

  test('Test sorting with empty array', () => {
    const sorted = sortList({ entries: [], options: 'title-asc' });
    expect(sorted).toEqual([]);
  });

  // SINGLE ENTRY

  test('Test sorting with single entry', () => {
    const singleEntry = [{ title: 'Song A', duration: 200 }];
    const sorted = sortList({ entries: singleEntry, options: 'duration-asc' });
    expect(sorted).toEqual(singleEntry);
  });

  // INVALID SORT KEY

  test('Test sorting with invalid sort key', () => {
    const sorted = sortList({ entries, options: 'invalidKey-asc' });
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song C');
  });

  // SORT NUMBERS LAST (DEFAULT)

  test('Test sorting with numbers last (default)', () => {
    const entriesWithMixedTitles = [{ title: 'Song A' }, { title: '1 Song' }, { title: '2 Song' }];
    const sorted = sortList({
      entries: entriesWithMixedTitles,
      options: 'title-asc',
    });
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('1 Song');
    expect(sorted[2].title).toBe('2 Song');
  });

  // SORT NUMBERS FIRST OPTION

  test('Test sorting with numbers first', () => {
    const entriesWithMixedTitles = [{ title: 'Song A' }, { title: '1 Song' }, { title: '2 Song' }];
    const sorted = sortList({
      entries: entriesWithMixedTitles,
      options: 'title-asc',
      sortNumbersFirst: true,
    });
    expect(sorted[0].title).toBe('1 Song');
    expect(sorted[1].title).toBe('2 Song');
    expect(sorted[2].title).toBe('Song A');
  });
});

describe('Testing "ignoreLeadingArticles" option', () => {
  // TITLE SORTING TESTS

  test('Test sorting titles with ignoreLeadingArticles=true', () => {
    const entriesWithArticles = [
      { title: 'The Beatles' },
      { title: 'A Perfect Circle' },
      { title: 'Beatles' },
      { title: 'An Old Soul' },
    ];
    const sorted = sortList({
      entries: entriesWithArticles,
      options: 'title-asc',
      ignoreLeadingArticles: true,
    });
    // Should sort by title without articles
    expect(sorted[0].title).toBe('Beatles');
    expect(sorted[1].title).toBe('The Beatles');
    expect(sorted[2].title).toBe('An Old Soul');
    expect(sorted[3].title).toBe('A Perfect Circle');
  });

  test('Test sorting titles with ignoreLeadingArticles=false', () => {
    const entriesWithArticles = [
      { title: 'The Beatles' },
      { title: 'A Perfect Circle' },
      { title: 'Beatles' },
      { title: 'An Old Soul' },
    ];
    const sorted = sortList({
      entries: entriesWithArticles,
      options: 'title-asc',
      ignoreLeadingArticles: false,
    });
    // Should sort alphabetically with articles included
    expect(sorted[0].title).toBe('A Perfect Circle');
    expect(sorted[1].title).toBe('An Old Soul');
    expect(sorted[2].title).toBe('Beatles');
    expect(sorted[3].title).toBe('The Beatles');
  });

  // ARTIST SORTING TESTS

  test('Test sorting artists with ignoreLeadingArticles=true', () => {
    const entriesWithArticles = [
      { artist: 'The Rolling Stones' },
      { artist: 'Rolling Stones' },
      { artist: 'A Tribe Called Quest' },
      { artist: 'An Orchestra' },
    ];
    const sorted = sortList({
      entries: entriesWithArticles,
      options: 'artist-asc',
      ignoreLeadingArticles: true,
    });
    // Should sort by artist name without articles
    expect(sorted[0].artist).toBe('An Orchestra');
    expect(sorted[1].artist).toBe('Rolling Stones');
    expect(sorted[2].artist).toBe('The Rolling Stones');
    expect(sorted[3].artist).toBe('A Tribe Called Quest');
  });

  test('Test sorting artists with ignoreLeadingArticles=false', () => {
    const entriesWithArticles = [
      { artist: 'The Rolling Stones' },
      { artist: 'Rolling Stones' },
      { artist: 'A Tribe Called Quest' },
      { artist: 'An Orchestra' },
    ];
    const sorted = sortList({
      entries: entriesWithArticles,
      options: 'artist-asc',
      ignoreLeadingArticles: false,
    });
    // Should sort alphabetically with articles included
    expect(sorted[0].artist).toBe('A Tribe Called Quest');
    expect(sorted[1].artist).toBe('An Orchestra');
    expect(sorted[2].artist).toBe('Rolling Stones');
    expect(sorted[3].artist).toBe('The Rolling Stones');
  });

  // ALBUM SORTING TESTS

  test('Test sorting albums with ignoreLeadingArticles=true', () => {
    const entriesWithArticles = [
      { album: 'The Dark Side of the Moon' },
      { album: 'Dark Side' },
      { album: 'A Night at the Opera' },
      { album: 'An Evening With' },
    ];
    const sorted = sortList({
      entries: entriesWithArticles,
      options: 'album-asc',
      ignoreLeadingArticles: true,
    });
    // Should sort by album name without articles
    expect(sorted[0].album).toBe('Dark Side');
    expect(sorted[1].album).toBe('The Dark Side of the Moon');
    expect(sorted[2].album).toBe('An Evening With');
    expect(sorted[3].album).toBe('A Night at the Opera');
  });

  // GENRE SORTING TESTS

  test('Test sorting genres with ignoreLeadingArticles=true', () => {
    const entriesWithArticles = [
      { genre: 'The Blues' },
      { genre: 'Blues' },
      { genre: 'A Cappella' },
      { genre: 'An Electronic Genre' },
    ];
    const sorted = sortList({
      entries: entriesWithArticles,
      options: 'genre-asc',
      ignoreLeadingArticles: true,
    });
    // Should sort by genre without articles
    expect(sorted[0].genre).toBe('Blues');
    expect(sorted[1].genre).toBe('The Blues');
    expect(sorted[2].genre).toBe('A Cappella');
    expect(sorted[3].genre).toBe('An Electronic Genre');
  });

  // TESTING NON-ARTICLE FIELDS

  test('Test ignoreLeadingArticles does not affect non-article fields', () => {
    const entriesWithArticles = [
      { title: 'The Song', codec: 'The AAC' },
      { title: 'A Song', codec: 'A MP3' },
      { title: 'Song', codec: 'AAC' },
      { title: 'An Song', codec: 'An OGG' },
    ];
    const sorted = sortList({
      entries: entriesWithArticles,
      options: 'codec-asc',
      ignoreLeadingArticles: true,
    });
    // Should sort normally since codec doesn't have article handling
    expect(sorted[0].codec).toBe('A MP3');
    expect(sorted[1].codec).toBe('AAC');
    expect(sorted[2].codec).toBe('An OGG');
    expect(sorted[3].codec).toBe('The AAC');
  });

  // TESTING MULTI-FIELD SORTING

  test('Test multi-field sorting with ignoreLeadingArticles=true', () => {
    const entriesWithArticles = [
      { title: 'The Song Z', artist: 'Artist Z', album: 'The Album Z' },
      { title: 'A Song X', artist: 'The Artist X', album: 'Album X' },
      { title: 'Song Y', artist: 'A Artist Y', album: 'An Album Y' },
    ];
    const sorted = sortList({
      entries: entriesWithArticles,
      options: 'artist-asc-album-asc-title-asc',
      ignoreLeadingArticles: true,
    });
    // Should sort by artist first (ignoring articles), then album, then title
    expect(sorted[0].artist).toBe('The Artist X');
    expect(sorted[1].artist).toBe('A Artist Y');
    expect(sorted[2].artist).toBe('Artist Z');
  });

  // TESTING INTERACTION WITH OTHER OPTIONS

  test('Test ignoreLeadingArticles works with sortNumbersFirst option', () => {
    const entriesWithArticlesAndNumbers = [
      { title: 'The 1 Song' },
      { title: 'A 2 Song' },
      { title: '3 Song' },
      { title: 'An 4 Song' },
    ];
    const sorted = sortList({
      entries: entriesWithArticlesAndNumbers,
      options: 'title-asc',
      ignoreLeadingArticles: true,
      sortNumbersFirst: true,
    });
    // Should first group by numbers/non-numbers, then apply article handling
    expect(sorted[0].title).toBe('The 1 Song');
    expect(sorted[1].title).toBe('A 2 Song');
    expect(sorted[2].title).toBe('3 Song');
    expect(sorted[3].title).toBe('An 4 Song');
  });

  test('Test with descending direction and ignoreLeadingArticles', () => {
    const entriesWithArticles = [
      { title: 'The Beatles' },
      { title: 'A Perfect Circle' },
      { title: 'Beatles' },
      { title: 'An Old Soul' },
    ];
    const sorted = sortList({
      entries: entriesWithArticles,
      options: 'title-asc',
      ignoreLeadingArticles: true,
      direction: 'desc',
    });
    // Should sort by title without articles in reverse order
    expect(sorted[0].title).toBe('A Perfect Circle');
    expect(sorted[1].title).toBe('An Old Soul');
    expect(sorted[2].title).toBe('The Beatles');
    expect(sorted[3].title).toBe('Beatles');
  });
});

describe('Testing boolean field sorting (isFavourite)', () => {
  // BASIC BOOLEAN SORTING

  test('Test sorting by isFavourite ascending', () => {
    const entriesWithFavourites = [
      { title: 'Song A', isFavourite: true },
      { title: 'Song B', isFavourite: false },
      { title: 'Song C', isFavourite: true },
      { title: 'Song D', isFavourite: false },
    ];
    const sorted = sortList({ entries: entriesWithFavourites, options: 'isFavourite-asc' });
    // With the current implementation, favourites come first (true values sort before false)
    expect(sorted[0].isFavourite).toBe(true);
    expect(sorted[1].isFavourite).toBe(true);
    expect(sorted[2].isFavourite).toBe(false);
    expect(sorted[3].isFavourite).toBe(false);
  });

  test('Test sorting by isFavourite descending', () => {
    const entriesWithFavourites = [
      { title: 'Song A', isFavourite: true },
      { title: 'Song B', isFavourite: false },
      { title: 'Song C', isFavourite: true },
      { title: 'Song D', isFavourite: false },
    ];
    const sorted = sortList({ entries: entriesWithFavourites, options: 'isFavourite-desc' });
    // With desc, the order is reversed from asc
    expect(sorted[0].isFavourite).toBe(false);
    expect(sorted[1].isFavourite).toBe(false);
    expect(sorted[2].isFavourite).toBe(true);
    expect(sorted[3].isFavourite).toBe(true);
  });

  // MISSING BOOLEAN VALUES

  test('Test sorting by isFavourite with missing values', () => {
    const entriesWithMissingFavourites = [
      { title: 'Song A', isFavourite: true },
      { title: 'Song B' }, // undefined isFavourite
      { title: 'Song C', isFavourite: false },
      { title: 'Song D' }, // undefined isFavourite
    ];
    const sorted = sortList({ entries: entriesWithMissingFavourites, options: 'isFavourite-asc' });
    // undefined should be treated as false (0), and favourites come first
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song C');
    expect(sorted[3].title).toBe('Song D');
  });

  // MULTI-FIELD SORTING WITH BOOLEAN

  test('Test multi-field sorting with isFavourite as primary key', () => {
    const entriesWithFavouritesAndTitles = [
      { title: 'Song Z', isFavourite: false },
      { title: 'Song A', isFavourite: true },
      { title: 'Song Y', isFavourite: false },
      { title: 'Song B', isFavourite: true },
    ];
    const sorted = sortList({ entries: entriesWithFavouritesAndTitles, options: 'isFavourite-asc-title-asc' });
    // First sort by isFavourite (favourites first), then by title
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[0].isFavourite).toBe(true);
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[1].isFavourite).toBe(true);
    expect(sorted[2].title).toBe('Song Y');
    expect(sorted[2].isFavourite).toBe(false);
    expect(sorted[3].title).toBe('Song Z');
    expect(sorted[3].isFavourite).toBe(false);
  });

  test('Test multi-field sorting with isFavourite as secondary key', () => {
    const entriesWithSameTitles = [
      { title: 'Song A', isFavourite: true },
      { title: 'Song A', isFavourite: false },
      { title: 'Song B', isFavourite: false },
      { title: 'Song B', isFavourite: true },
    ];
    const sorted = sortList({ entries: entriesWithSameTitles, options: 'title-asc-isFavourite-asc' });
    // First sort by title, then by isFavourite (favourites first)
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[0].isFavourite).toBe(true);
    expect(sorted[1].title).toBe('Song A');
    expect(sorted[1].isFavourite).toBe(false);
    expect(sorted[2].title).toBe('Song B');
    expect(sorted[2].isFavourite).toBe(true);
    expect(sorted[3].title).toBe('Song B');
    expect(sorted[3].isFavourite).toBe(false);
  });

  // BOOLEAN WITH DIRECTION PARAMETER

  test('Test isFavourite sorting with global direction parameter', () => {
    const entriesWithFavourites = [
      { title: 'Song A', isFavourite: true },
      { title: 'Song B', isFavourite: false },
      { title: 'Song C', isFavourite: true },
    ];
    const sorted = sortList({
      entries: entriesWithFavourites,
      options: 'isFavourite-asc',
      direction: 'desc',
    });
    // Global desc should reverse the isFavourite sort
    expect(sorted[0].isFavourite).toBe(false);
    expect(sorted[1].isFavourite).toBe(true);
    expect(sorted[2].isFavourite).toBe(true);
  });

  // ALL FALSE VALUES

  test('Test sorting by isFavourite when all values are false', () => {
    const entriesAllFalse = [
      { title: 'Song C', isFavourite: false },
      { title: 'Song A', isFavourite: false },
      { title: 'Song B', isFavourite: false },
    ];
    const sorted = sortList({ entries: entriesAllFalse, options: 'isFavourite-asc-title-asc' });
    // Should fall back to secondary sort by title
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song C');
  });

  // ALL TRUE VALUES

  test('Test sorting by isFavourite when all values are true', () => {
    const entriesAllTrue = [
      { title: 'Song C', isFavourite: true },
      { title: 'Song A', isFavourite: true },
      { title: 'Song B', isFavourite: true },
    ];
    const sorted = sortList({ entries: entriesAllTrue, options: 'isFavourite-asc-title-asc' });
    // Should fall back to secondary sort by title
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[2].title).toBe('Song C');
  });
});

describe('Testing FORCED_SORT_KEYS functionality', () => {
  // ISFAVOURITE FORCED SORT TESTS

  test('Test isFavourite automatically uses title as secondary sort (asc)', () => {
    const entriesWithSameFavourites = [
      { title: 'Song Z', isFavourite: true },
      { title: 'Song A', isFavourite: true },
      { title: 'Song M', isFavourite: false },
      { title: 'Song B', isFavourite: false },
    ];
    const sorted = sortList({ entries: entriesWithSameFavourites, options: 'isFavourite-asc' });
    // Favourites first, then sorted by title alphabetically
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[0].isFavourite).toBe(true);
    expect(sorted[1].title).toBe('Song Z');
    expect(sorted[1].isFavourite).toBe(true);
    expect(sorted[2].title).toBe('Song B');
    expect(sorted[2].isFavourite).toBe(false);
    expect(sorted[3].title).toBe('Song M');
    expect(sorted[3].isFavourite).toBe(false);
  });

  test('Test isFavourite forced sort keeps title asc even with global desc', () => {
    const entriesWithSameFavourites = [
      { title: 'Song Z', isFavourite: true },
      { title: 'Song A', isFavourite: true },
      { title: 'Song M', isFavourite: false },
      { title: 'Song B', isFavourite: false },
    ];
    const sorted = sortList({
      entries: entriesWithSameFavourites,
      options: 'isFavourite-asc',
      direction: 'desc',
    });
    // isFavourite reversed but title stays asc due to FORCED_SORT_KEYS
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[0].isFavourite).toBe(false);
    expect(sorted[1].title).toBe('Song M');
    expect(sorted[1].isFavourite).toBe(false);
    expect(sorted[2].title).toBe('Song A');
    expect(sorted[2].isFavourite).toBe(true);
    expect(sorted[3].title).toBe('Song Z');
    expect(sorted[3].isFavourite).toBe(true);
  });

  // USERRATING FORCED SORT TESTS

  test('Test userRating automatically uses title as secondary sort (asc)', () => {
    const entriesWithRatings = [
      { title: 'Song Z', userRating: 5 },
      { title: 'Song A', userRating: 5 },
      { title: 'Song M', userRating: 3 },
      { title: 'Song B', userRating: 3 },
    ];
    const sorted = sortList({ entries: entriesWithRatings, options: 'userRating-asc' });
    // Lower ratings first, then sorted by title alphabetically
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[0].userRating).toBe(3);
    expect(sorted[1].title).toBe('Song M');
    expect(sorted[1].userRating).toBe(3);
    expect(sorted[2].title).toBe('Song A');
    expect(sorted[2].userRating).toBe(5);
    expect(sorted[3].title).toBe('Song Z');
    expect(sorted[3].userRating).toBe(5);
  });

  test('Test userRating forced sort keeps title asc even with global desc', () => {
    const entriesWithRatings = [
      { title: 'Song Z', userRating: 5 },
      { title: 'Song A', userRating: 5 },
      { title: 'Song M', userRating: 3 },
      { title: 'Song B', userRating: 3 },
    ];
    const sorted = sortList({
      entries: entriesWithRatings,
      options: 'userRating-asc',
      direction: 'desc',
    });
    // userRating reversed but title stays asc due to FORCED_SORT_KEYS
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[0].userRating).toBe(5);
    expect(sorted[1].title).toBe('Song Z');
    expect(sorted[1].userRating).toBe(5);
    expect(sorted[2].title).toBe('Song B');
    expect(sorted[2].userRating).toBe(3);
    expect(sorted[3].title).toBe('Song M');
    expect(sorted[3].userRating).toBe(3);
  });

  test('Test userRating with missing values and forced sort', () => {
    const entriesWithMissingRatings = [
      { title: 'Song Z', userRating: 5 },
      { title: 'Song A' }, // undefined userRating
      { title: 'Song M', userRating: 0 },
      { title: 'Song B' }, // undefined userRating
    ];
    const sorted = sortList({ entries: entriesWithMissingRatings, options: 'userRating-asc' });
    // undefined treated as 0, then sorted by title alphabetically
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[0].userRating).toBe(undefined);
    expect(sorted[1].title).toBe('Song B');
    expect(sorted[1].userRating).toBe(undefined);
    expect(sorted[2].title).toBe('Song M');
    expect(sorted[2].userRating).toBe(0);
    expect(sorted[3].title).toBe('Song Z');
    expect(sorted[3].userRating).toBe(5);
  });

  // KIND FORCED SORT TESTS

  test('Test kind automatically uses sortOrder as secondary sort (asc)', () => {
    const entriesWithKind = [
      { title: 'Song A', kind: 'Music', sortOrder: 3 },
      { title: 'Song B', kind: 'Music', sortOrder: 1 },
      { title: 'Song C', kind: 'Podcast', sortOrder: 2 },
      { title: 'Song D', kind: 'Podcast', sortOrder: 4 },
    ];
    const sorted = sortList({ entries: entriesWithKind, options: 'kind-asc' });
    // First by kind alphabetically, then by sortOrder numerically
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[0].kind).toBe('Music');
    expect(sorted[0].sortOrder).toBe(1);
    expect(sorted[1].title).toBe('Song A');
    expect(sorted[1].kind).toBe('Music');
    expect(sorted[1].sortOrder).toBe(3);
    expect(sorted[2].title).toBe('Song C');
    expect(sorted[2].kind).toBe('Podcast');
    expect(sorted[2].sortOrder).toBe(2);
    expect(sorted[3].title).toBe('Song D');
    expect(sorted[3].kind).toBe('Podcast');
    expect(sorted[3].sortOrder).toBe(4);
  });

  test('Test kind forced sort keeps sortOrder asc even with global desc', () => {
    const entriesWithKind = [
      { title: 'Song A', kind: 'Music', sortOrder: 3 },
      { title: 'Song B', kind: 'Music', sortOrder: 1 },
      { title: 'Song C', kind: 'Podcast', sortOrder: 2 },
      { title: 'Song D', kind: 'Podcast', sortOrder: 4 },
    ];
    const sorted = sortList({
      entries: entriesWithKind,
      options: 'kind-asc',
      direction: 'desc',
    });
    // kind reversed but sortOrder stays asc due to FORCED_SORT_KEYS
    expect(sorted[0].title).toBe('Song C');
    expect(sorted[0].kind).toBe('Podcast');
    expect(sorted[0].sortOrder).toBe(2);
    expect(sorted[1].title).toBe('Song D');
    expect(sorted[1].kind).toBe('Podcast');
    expect(sorted[1].sortOrder).toBe(4);
    expect(sorted[2].title).toBe('Song B');
    expect(sorted[2].kind).toBe('Music');
    expect(sorted[2].sortOrder).toBe(1);
    expect(sorted[3].title).toBe('Song A');
    expect(sorted[3].kind).toBe('Music');
    expect(sorted[3].sortOrder).toBe(3);
  });

  // EXPLICIT SECONDARY SORT OVERRIDES FORCED SORT

  test('Test explicit secondary sort overrides forced sort for isFavourite', () => {
    const entriesWithFavourites = [
      { title: 'Song Z', isFavourite: true, duration: 100 },
      { title: 'Song A', isFavourite: true, duration: 200 },
      { title: 'Song M', isFavourite: false, duration: 150 },
      { title: 'Song B', isFavourite: false, duration: 180 },
    ];
    const sorted = sortList({ entries: entriesWithFavourites, options: 'isFavourite-asc-duration-asc' });
    // Favourites first, then sorted by duration (not title)
    expect(sorted[0].title).toBe('Song Z');
    expect(sorted[0].isFavourite).toBe(true);
    expect(sorted[0].duration).toBe(100);
    expect(sorted[1].title).toBe('Song A');
    expect(sorted[1].isFavourite).toBe(true);
    expect(sorted[1].duration).toBe(200);
    expect(sorted[2].title).toBe('Song M');
    expect(sorted[2].isFavourite).toBe(false);
    expect(sorted[2].duration).toBe(150);
    expect(sorted[3].title).toBe('Song B');
    expect(sorted[3].isFavourite).toBe(false);
    expect(sorted[3].duration).toBe(180);
  });

  test('Test explicit secondary sort overrides forced sort for userRating', () => {
    const entriesWithRatings = [
      { title: 'Song Z', userRating: 5, artist: 'Artist B' },
      { title: 'Song A', userRating: 5, artist: 'Artist A' },
      { title: 'Song M', userRating: 3, artist: 'Artist D' },
      { title: 'Song B', userRating: 3, artist: 'Artist C' },
    ];
    const sorted = sortList({ entries: entriesWithRatings, options: 'userRating-asc-artist-asc' });
    // Lower ratings first, then sorted by artist (not title)
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[0].userRating).toBe(3);
    expect(sorted[0].artist).toBe('Artist C');
    expect(sorted[1].title).toBe('Song M');
    expect(sorted[1].userRating).toBe(3);
    expect(sorted[1].artist).toBe('Artist D');
    expect(sorted[2].title).toBe('Song A');
    expect(sorted[2].userRating).toBe(5);
    expect(sorted[2].artist).toBe('Artist A');
    expect(sorted[3].title).toBe('Song Z');
    expect(sorted[3].userRating).toBe(5);
    expect(sorted[3].artist).toBe('Artist B');
  });
});

describe('Testing userRating field sorting', () => {
  // BASIC USERRATING SORTING

  test('Test sorting by userRating ascending', () => {
    const entriesWithRatings = [
      { title: 'Song A', userRating: 5 },
      { title: 'Song B', userRating: 1 },
      { title: 'Song C', userRating: 3 },
      { title: 'Song D', userRating: 2 },
    ];
    const sorted = sortList({ entries: entriesWithRatings, options: 'userRating-asc' });
    expect(sorted[0].userRating).toBe(1);
    expect(sorted[1].userRating).toBe(2);
    expect(sorted[2].userRating).toBe(3);
    expect(sorted[3].userRating).toBe(5);
  });

  test('Test sorting by userRating descending', () => {
    const entriesWithRatings = [
      { title: 'Song A', userRating: 5 },
      { title: 'Song B', userRating: 1 },
      { title: 'Song C', userRating: 3 },
      { title: 'Song D', userRating: 2 },
    ];
    const sorted = sortList({ entries: entriesWithRatings, options: 'userRating-desc' });
    expect(sorted[0].userRating).toBe(5);
    expect(sorted[1].userRating).toBe(3);
    expect(sorted[2].userRating).toBe(2);
    expect(sorted[3].userRating).toBe(1);
  });

  test('Test sorting by userRating with missing values', () => {
    const entriesWithMissingRatings = [
      { title: 'Song A', userRating: 5 },
      { title: 'Song B' }, // undefined userRating
      { title: 'Song C', userRating: 3 },
      { title: 'Song D' }, // undefined userRating
    ];
    const sorted = sortList({ entries: entriesWithMissingRatings, options: 'userRating-asc' });
    // undefined should be treated as 0
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[1].title).toBe('Song D');
    expect(sorted[2].userRating).toBe(3);
    expect(sorted[3].userRating).toBe(5);
  });

  test('Test sorting by userRating with zero values', () => {
    const entriesWithZeroRatings = [
      { title: 'Song A', userRating: 5 },
      { title: 'Song B', userRating: 0 },
      { title: 'Song C', userRating: 3 },
      { title: 'Song D', userRating: 0 },
    ];
    const sorted = sortList({ entries: entriesWithZeroRatings, options: 'userRating-asc' });
    expect(sorted[0].userRating).toBe(0);
    expect(sorted[1].userRating).toBe(0);
    expect(sorted[2].userRating).toBe(3);
    expect(sorted[3].userRating).toBe(5);
  });

  test('Test multi-field sorting with userRating as primary key', () => {
    const entriesWithRatingsAndTitles = [
      { title: 'Song Z', userRating: 3 },
      { title: 'Song A', userRating: 5 },
      { title: 'Song Y', userRating: 3 },
      { title: 'Song B', userRating: 5 },
    ];
    const sorted = sortList({ entries: entriesWithRatingsAndTitles, options: 'userRating-asc-title-asc' });
    // First sort by userRating, then by title
    expect(sorted[0].title).toBe('Song Y');
    expect(sorted[0].userRating).toBe(3);
    expect(sorted[1].title).toBe('Song Z');
    expect(sorted[1].userRating).toBe(3);
    expect(sorted[2].title).toBe('Song A');
    expect(sorted[2].userRating).toBe(5);
    expect(sorted[3].title).toBe('Song B');
    expect(sorted[3].userRating).toBe(5);
  });

  test('Test userRating sorting with global direction parameter', () => {
    const entriesWithRatings = [
      { title: 'Song A', userRating: 5 },
      { title: 'Song B', userRating: 1 },
      { title: 'Song C', userRating: 3 },
    ];
    const sorted = sortList({
      entries: entriesWithRatings,
      options: 'userRating-asc',
      direction: 'desc',
    });
    // Global desc should reverse the userRating sort
    expect(sorted[0].userRating).toBe(5);
    expect(sorted[1].userRating).toBe(3);
    expect(sorted[2].userRating).toBe(1);
  });
});

describe('Testing totalItems field sorting', () => {
  // BASIC TOTALITEMS SORTING

  test('Test sorting by totalItems ascending', () => {
    const entriesWithTotalItems = [
      { title: 'Album A', totalItems: 12 },
      { title: 'Album B', totalItems: 3 },
      { title: 'Album C', totalItems: 8 },
    ];
    const sorted = sortList({ entries: entriesWithTotalItems, options: 'totalItems-asc' });
    expect(sorted[0].totalItems).toBe(3);
    expect(sorted[1].totalItems).toBe(8);
    expect(sorted[2].totalItems).toBe(12);
  });

  test('Test sorting by totalItems descending', () => {
    const entriesWithTotalItems = [
      { title: 'Album A', totalItems: 12 },
      { title: 'Album B', totalItems: 3 },
      { title: 'Album C', totalItems: 8 },
    ];
    const sorted = sortList({ entries: entriesWithTotalItems, options: 'totalItems-desc' });
    expect(sorted[0].totalItems).toBe(12);
    expect(sorted[1].totalItems).toBe(8);
    expect(sorted[2].totalItems).toBe(3);
  });

  test('Test sorting by totalItems with missing values', () => {
    const entriesWithMissingTotalItems = [
      { title: 'Album A', totalItems: 5 },
      { title: 'Album B' }, // undefined totalItems
      { title: 'Album C', totalItems: 2 },
      { title: 'Album D' }, // undefined totalItems
    ];
    const sorted = sortList({ entries: entriesWithMissingTotalItems, options: 'totalItems-asc' });
    // undefined should be treated as 0
    expect(sorted[0].title).toBe('Album B');
    expect(sorted[1].title).toBe('Album D');
    expect(sorted[2].totalItems).toBe(2);
    expect(sorted[3].totalItems).toBe(5);
  });
});

describe('Testing kind field sorting', () => {
  // BASIC KIND SORTING

  test('Test sorting by kind ascending', () => {
    const entriesWithKind = [
      { title: 'Song A', kind: 'Podcast' },
      { title: 'Song B', kind: 'Audiobook' },
      { title: 'Song C', kind: 'Music' },
      { title: 'Song D', kind: 'Video' },
    ];
    const sorted = sortList({ entries: entriesWithKind, options: 'kind-asc' });
    expect(sorted[0].kind).toBe('Audiobook');
    expect(sorted[1].kind).toBe('Music');
    expect(sorted[2].kind).toBe('Podcast');
    expect(sorted[3].kind).toBe('Video');
  });

  test('Test sorting by kind descending', () => {
    const entriesWithKind = [
      { title: 'Song A', kind: 'Podcast' },
      { title: 'Song B', kind: 'Audiobook' },
      { title: 'Song C', kind: 'Music' },
      { title: 'Song D', kind: 'Video' },
    ];
    const sorted = sortList({ entries: entriesWithKind, options: 'kind-desc' });
    expect(sorted[0].kind).toBe('Video');
    expect(sorted[1].kind).toBe('Podcast');
    expect(sorted[2].kind).toBe('Music');
    expect(sorted[3].kind).toBe('Audiobook');
  });

  test('Test sorting by kind with missing values', () => {
    const entriesWithMissingKind = [
      { title: 'Song A', kind: 'Music' },
      { title: 'Song B' }, // undefined kind
      { title: 'Song C', kind: 'Podcast' },
      { title: 'Song D' }, // undefined kind
    ];
    const sorted = sortList({ entries: entriesWithMissingKind, options: 'kind-asc' });
    // undefined should be treated as empty string and sort first
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[1].title).toBe('Song D');
    expect(sorted[2].kind).toBe('Music');
    expect(sorted[3].kind).toBe('Podcast');
  });
});
