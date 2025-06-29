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
    expect(sorted[0].isFavourite).toBe(false);
    expect(sorted[1].isFavourite).toBe(false);
    expect(sorted[2].isFavourite).toBe(true);
    expect(sorted[3].isFavourite).toBe(true);
  });

  test('Test sorting by isFavourite descending', () => {
    const entriesWithFavourites = [
      { title: 'Song A', isFavourite: true },
      { title: 'Song B', isFavourite: false },
      { title: 'Song C', isFavourite: true },
      { title: 'Song D', isFavourite: false },
    ];
    const sorted = sortList({ entries: entriesWithFavourites, options: 'isFavourite-desc' });
    expect(sorted[0].isFavourite).toBe(true);
    expect(sorted[1].isFavourite).toBe(true);
    expect(sorted[2].isFavourite).toBe(false);
    expect(sorted[3].isFavourite).toBe(false);
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
    // undefined should be treated as false (0)
    expect(sorted[0].title).toBe('Song B');
    expect(sorted[1].title).toBe('Song C');
    expect(sorted[2].title).toBe('Song D');
    expect(sorted[3].title).toBe('Song A');
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
    // First sort by isFavourite (false first), then by title
    expect(sorted[0].title).toBe('Song Y');
    expect(sorted[0].isFavourite).toBe(false);
    expect(sorted[1].title).toBe('Song Z');
    expect(sorted[1].isFavourite).toBe(false);
    expect(sorted[2].title).toBe('Song A');
    expect(sorted[2].isFavourite).toBe(true);
    expect(sorted[3].title).toBe('Song B');
    expect(sorted[3].isFavourite).toBe(true);
  });

  test('Test multi-field sorting with isFavourite as secondary key', () => {
    const entriesWithSameTitles = [
      { title: 'Song A', isFavourite: true },
      { title: 'Song A', isFavourite: false },
      { title: 'Song B', isFavourite: false },
      { title: 'Song B', isFavourite: true },
    ];
    const sorted = sortList({ entries: entriesWithSameTitles, options: 'title-asc-isFavourite-asc' });
    // First sort by title, then by isFavourite (false first)
    expect(sorted[0].title).toBe('Song A');
    expect(sorted[0].isFavourite).toBe(false);
    expect(sorted[1].title).toBe('Song A');
    expect(sorted[1].isFavourite).toBe(true);
    expect(sorted[2].title).toBe('Song B');
    expect(sorted[2].isFavourite).toBe(false);
    expect(sorted[3].title).toBe('Song B');
    expect(sorted[3].isFavourite).toBe(true);
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
    expect(sorted[0].isFavourite).toBe(true);
    expect(sorted[1].isFavourite).toBe(true);
    expect(sorted[2].isFavourite).toBe(false);
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
