type SessionState = Record<string, unknown>;

type KeySplit = {
  oldKey: string;
  newKeys: string[];
};

// ======================================================================
// DEFINITIONS
// ======================================================================

// [NOTE] the presence of this key is what marks the view settings split as still needing to run. It has to be one of
// the splits that renames its old key (rather than retaining it), because a retained key is never removed and so
// would always look like the migration is outstanding. Session state is saved as a whole, so every old key is
// present before the migration and every renamed one is absent afterwards - checking a single key is enough.
export const viewSettingsSplitSentinel = 'gridCollectionsUserRating';

// [NOTE] view settings used to be shared between similar views - artists and album artists shared one set, both
// collection listings shared another, and collection items shared with genre / mood / style / tag items. Each view
// now has its own settings, so the old shared value is copied into every new key it used to feed.
//
// Where one side of a split keeps the original key name (e.g. colArtists* stays the artists key), that key appears
// in its own newKeys array so it is retained rather than deleted. Every oldKey below is a key as it existed before
// the split, which is what an upgrading user actually has stored - not necessarily its current name.

export const viewSettingsSplits: KeySplit[] = [
  // artists -> artists + album artists
  ...['UserRating', 'IsFavourite'].map((field) => ({
    oldKey: `gridArtists${field}`,
    newKeys: [`gridArtists${field}`, `gridAlbumArtists${field}`],
  })),
  ...['Country', 'Genre', 'AddedAt', 'LastPlayed', 'UserRating', 'IsFavourite'].map((field) => ({
    oldKey: `colArtists${field}`,
    newKeys: [`colArtists${field}`, `colAlbumArtists${field}`],
  })),
  { oldKey: 'viewArtists', newKeys: ['viewArtists', 'viewAlbumArtists'] },
  { oldKey: 'sortArtists', newKeys: ['sortArtists', 'sortAlbumArtists'] },
  { oldKey: 'orderArtists', newKeys: ['orderArtists', 'orderAlbumArtists'] },

  // collections -> artist collections + album collections
  ...['TotalItems', 'UserRating'].map((field) => ({
    oldKey: `gridCollections${field}`,
    newKeys: [`gridArtistCollections${field}`, `gridAlbumCollections${field}`],
  })),
  ...['TotalItems', 'AddedAt', 'UserRating'].map((field) => ({
    oldKey: `colCollection${field}`,
    newKeys: [`colArtistCollections${field}`, `colAlbumCollections${field}`],
  })),

  // collection items -> collection items + tag items
  ...['UserRating', 'IsFavourite'].map((field) => ({
    oldKey: `gridArtistCollectionItems${field}`,
    newKeys: [`gridArtistCollectionItems${field}`, `gridArtistTagItems${field}`],
  })),
  ...['Artist', 'ReleaseDate', 'UserRating', 'IsFavourite'].map((field) => ({
    oldKey: `gridAlbumCollectionItems${field}`,
    newKeys: [`gridAlbumCollectionItems${field}`, `gridAlbumTagItems${field}`],
  })),
  // [NOTE] the column settings for collection items were also renamed at this point, from colCollectionArtists* /
  // colCollectionAlbums* to colArtistCollectionItems* / colAlbumCollectionItems*, so that they match the naming of
  // their grid counterparts. The old names are what a user upgrading from a previous version actually has stored.
  ...['Country', 'Genre', 'AddedAt', 'LastPlayed', 'UserRating', 'IsFavourite'].map((field) => ({
    oldKey: `colCollectionArtists${field}`,
    newKeys: [`colArtistCollectionItems${field}`, `colArtistTagItems${field}`],
  })),
  ...['Artist', 'Genre', 'ReleaseDate', 'AddedAt', 'LastPlayed', 'UserRating', 'IsFavourite'].map((field) => ({
    oldKey: `colCollectionAlbums${field}`,
    newKeys: [`colAlbumCollectionItems${field}`, `colAlbumTagItems${field}`],
  })),
];

// [NOTE] theme keys that have been renamed over time
export const renamedThemes: Record<string, string> = {
  chromatix: 'chromatix-magenta',
  plex: 'chromatix-yellow',
  'black-blue-1': 'black-blue',
  'black-blue-2': 'black-indigo-2',
  'black-green-1': 'black-green',
  'black-green-2': 'black-mint',
  'black-indigo': 'black-violet',
  'black-pink': 'black-magenta',
  'chromatix-blue-1': 'chromatix-blue',
  'chromatix-blue-2': 'chromatix-indigo-2',
  'chromatix-green-1': 'chromatix-green',
  'chromatix-green-2': 'chromatix-mint',
  'chromatix-indigo': 'chromatix-violet',
  'white-blue-1': 'white-blue',
  'white-blue-2': 'white-indigo-2',
  'white-green-1': 'white-green',
  'white-green-2': 'white-mint',
  'white-indigo': 'white-violet',
  'white-pink': 'white-magenta',
};

// ======================================================================
// HELPERS
// ======================================================================

/**
 * Applies a set of key splits, seeding each new key with the old key's value.
 * Old keys that were renamed are removed; old keys retained by their own split are kept.
 * A new key that already holds a value is left alone, so that settings the user has since changed are not
 * overwritten - this matters because splits that retain their old key would otherwise re-apply on every load.
 * @param state - Session state to migrate; not mutated
 * @param splits - Key split definitions
 * @returns New state object with the splits applied
 */

export const applyKeySplits = (state: SessionState, splits: KeySplit[]): SessionState => {
  const migrated: SessionState = { ...state };

  splits.forEach(({ oldKey, newKeys }) => {
    if (typeof migrated[oldKey] === 'undefined') {
      return;
    }

    const oldValue = migrated[oldKey];

    // Seed any new key that does not have a value yet, before the old key is (potentially) removed
    newKeys.forEach((newKey) => {
      if (newKey !== oldKey && typeof migrated[newKey] === 'undefined') {
        migrated[newKey] = oldValue;
      }
    });

    // Old keys that were renamed have now been copied across, so are no longer needed
    if (!newKeys.includes(oldKey)) {
      delete migrated[oldKey];
    }
  });

  return migrated;
};

// ======================================================================
// MIGRATION
// ======================================================================

/**
 * Brings session state loaded from local storage up to date with the current state shape.
 * Applies renamed settings, splits settings that used to be shared between views, strips data that was once
 * saved by mistake, and busts the playing state cache when its version is outdated.
 * Safe to run on every load - each step is a no-op once it has been applied.
 * @param state - Raw session state parsed from local storage; not mutated
 * @param playingState - Current playing state defaults, used to bust an outdated playing state cache
 * @returns New state object with all migrations applied
 */

const migrateSessionState = (state: SessionState, playingState: SessionState = {}): SessionState => {
  let migrated: SessionState = { ...state };

  // [NOTE] migrate old accessibilityContrast setting to currentContrast
  if (typeof migrated.accessibilityContrast === 'boolean') {
    console.log('%cMigrating old accessibilityContrast setting to currentContrast', 'color:red;');
    migrated.currentContrast = migrated.accessibilityContrast ? 'medium' : 'default';
    delete migrated.accessibilityContrast;
  }

  // [NOTE] migrate old accessibilityFocus setting to themeKeyFocus
  if (typeof migrated.accessibilityFocus === 'boolean') {
    console.log('%cMigrating old accessibilityFocus setting to themeKeyFocus', 'color:red;');
    migrated.themeKeyFocus = migrated.accessibilityFocus;
    delete migrated.accessibilityFocus;
  }

  // [NOTE] migrate old optionLogPlexPlayback setting to optionLogPlaybackToServer
  if (typeof migrated.optionLogPlexPlayback !== 'undefined') {
    console.log('%cMigrating old optionLogPlexPlayback setting to optionLogPlaybackToServer', 'color:red;');
    migrated.optionLogPlaybackToServer = migrated.optionLogPlexPlayback;
    delete migrated.optionLogPlexPlayback;
  }

  // [NOTE] split view settings that were previously shared between similar views
  if (typeof migrated[viewSettingsSplitSentinel] !== 'undefined') {
    console.log('%cSplitting view settings that were previously shared between similar views', 'color:red;');
    migrated = applyKeySplits(migrated, viewSettingsSplits);
  }

  // [NOTE] clean up some old data that was once accidentally saved to local storage
  if (migrated.appModel) {
    console.log('%cRemoving some old data that was once accidentally saved to local storage', 'color:red;');
    delete migrated.appModel;
    delete migrated.persistentModel;
    delete migrated.playerModel;
    delete migrated.sessionModel;
  }

  // [NOTE] bust the playing state cache if the version is outdated
  const currentPlayingVersion = playingState.playingVersion as number | undefined;
  if (
    typeof currentPlayingVersion !== 'undefined' &&
    (!migrated.playingVersion || (migrated.playingVersion as number) < currentPlayingVersion)
  ) {
    console.log('%cBusting the playing state cache because the version is outdated', 'color:red;');
    migrated = { ...migrated, ...playingState };
  }

  // [NOTE] migrate renamed theme keys
  if (typeof migrated.currentTheme === 'string' && renamedThemes[migrated.currentTheme]) {
    console.log('%cMigrating renamed theme keys', 'color:red;');
    migrated.currentTheme = renamedThemes[migrated.currentTheme];
  }

  return migrated;
};

export default migrateSessionState;
