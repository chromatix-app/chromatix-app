// Generated using GitHub Copilot

import migrateSessionState, {
  applyKeySplits,
  renamedThemes,
  viewSettingsSplits,
  viewSettingsSplitSentinel,
} from './migrateSessionState';

const playingState = { playingVersion: 2, playingTrackIndex: null, playingShuffle: false };

describe('Testing "migrateSessionState" function', () => {
  test('Migrates accessibilityContrast to currentContrast', () => {
    expect(migrateSessionState({ accessibilityContrast: true }).currentContrast).toBe('medium');
    expect(migrateSessionState({ accessibilityContrast: false }).currentContrast).toBe('default');
    expect('accessibilityContrast' in migrateSessionState({ accessibilityContrast: true })).toBe(false);
  });

  test('Migrates accessibilityFocus to themeKeyFocus', () => {
    const result = migrateSessionState({ accessibilityFocus: true });

    expect(result.themeKeyFocus).toBe(true);
    expect('accessibilityFocus' in result).toBe(false);
  });

  test('Migrates optionLogPlexPlayback to optionLogPlaybackToServer', () => {
    const result = migrateSessionState({ optionLogPlexPlayback: false });

    expect(result.optionLogPlaybackToServer).toBe(false);
    expect('optionLogPlexPlayback' in result).toBe(false);
  });

  test('Removes model data that was once saved to local storage by mistake', () => {
    const result = migrateSessionState({
      appModel: { foo: 1 },
      persistentModel: { bar: 2 },
      playerModel: { baz: 3 },
      sessionModel: { qux: 4 },
      volumeLevel: 50,
    });

    expect('appModel' in result).toBe(false);
    expect('persistentModel' in result).toBe(false);
    expect('playerModel' in result).toBe(false);
    expect('sessionModel' in result).toBe(false);
    expect(result.volumeLevel).toBe(50);
  });

  test('Busts the playing state cache when the stored version is outdated', () => {
    const result = migrateSessionState({ playingVersion: 1, playingShuffle: true }, playingState);

    expect(result.playingVersion).toBe(2);
    expect(result.playingShuffle).toBe(false);
  });

  test('Busts the playing state cache when no version is stored', () => {
    const result = migrateSessionState({ playingShuffle: true }, playingState);

    expect(result.playingVersion).toBe(2);
    expect(result.playingShuffle).toBe(false);
  });

  test('Leaves the playing state alone when the version is current', () => {
    const result = migrateSessionState({ playingVersion: 2, playingShuffle: true }, playingState);

    expect(result.playingShuffle).toBe(true);
  });

  test('Migrates renamed theme keys', () => {
    expect(migrateSessionState({ currentTheme: 'chromatix' }).currentTheme).toBe('chromatix-magenta');
    expect(migrateSessionState({ currentTheme: 'white-pink' }).currentTheme).toBe('white-magenta');
  });

  test('Leaves current theme keys untouched', () => {
    expect(migrateSessionState({ currentTheme: 'chromatix-teal' }).currentTheme).toBe('chromatix-teal');
  });

  test('Applies the view settings split', () => {
    const result = migrateSessionState({
      viewArtists: 'list',
      gridCollectionsTotalItems: false,
      [viewSettingsSplitSentinel]: true,
    });

    expect(result.viewAlbumArtists).toBe('list');
    expect(result.gridArtistCollectionsTotalItems).toBe(false);
    expect(result.gridAlbumCollectionsTotalItems).toBe(false);
  });

  test('Migrates collection item columns from their pre-split names', () => {
    // these columns were renamed as well as split (colCollectionArtists* -> colArtistCollectionItems*), so the old
    // name is what an upgrading user has stored - migrating from the new name would silently drop their settings
    const result = migrateSessionState({
      colCollectionArtistsCountry: false,
      colCollectionAlbumsReleaseDate: false,
      [viewSettingsSplitSentinel]: true,
    });

    expect(result.colArtistCollectionItemsCountry).toBe(false);
    expect(result.colArtistTagItemsCountry).toBe(false);
    expect(result.colAlbumCollectionItemsReleaseDate).toBe(false);
    expect(result.colAlbumTagItemsReleaseDate).toBe(false);
    expect('colCollectionArtistsCountry' in result).toBe(false);
    expect('colCollectionAlbumsReleaseDate' in result).toBe(false);
  });

  test('Ignores accessibility settings that are not boolean', () => {
    const result = migrateSessionState({ accessibilityContrast: 'medium', accessibilityFocus: 'yes' });

    // non-boolean values are left alone rather than being coerced
    expect(result.accessibilityContrast).toBe('medium');
    expect(result.accessibilityFocus).toBe('yes');
    expect('currentContrast' in result).toBe(false);
    expect('themeKeyFocus' in result).toBe(false);
  });

  test('Applies renamed settings and view splits independently of each other', () => {
    // the renamed settings and the split settings must not interfere, whichever order they run in
    const result = migrateSessionState({
      accessibilityContrast: true,
      accessibilityFocus: true,
      optionLogPlexPlayback: false,
      viewArtists: 'list',
      colArtistsCountry: false,
      [viewSettingsSplitSentinel]: true,
    });

    expect(result.currentContrast).toBe('medium');
    expect(result.themeKeyFocus).toBe(true);
    expect(result.optionLogPlaybackToServer).toBe(false);
    expect(result.viewAlbumArtists).toBe('list');
    expect(result.colAlbumArtistsCountry).toBe(false);
  });

  test('Migrates every declared split when all old keys are present', () => {
    const legacy: Record<string, unknown> = {};
    viewSettingsSplits.forEach(({ oldKey }, index) => {
      // give each key a distinct value so mismatched copies are detectable
      legacy[oldKey] = `value-${index}`;
    });

    const result = migrateSessionState(legacy);

    viewSettingsSplits.forEach(({ oldKey, newKeys }, index) => {
      newKeys.forEach((newKey) => {
        expect(result[newKey], `${oldKey} -> ${newKey}`).toBe(`value-${index}`);
      });
      if (!newKeys.includes(oldKey)) {
        expect(oldKey in result, `${oldKey} should have been removed`).toBe(false);
      }
    });
  });

  test('Does not mutate the object it is given', () => {
    const original = { accessibilityFocus: true, viewArtists: 'list', currentTheme: 'chromatix' };
    const snapshot = { ...original };
    migrateSessionState(original, playingState);

    expect(original).toEqual(snapshot);
  });

  test('Is idempotent when run repeatedly', () => {
    const once = migrateSessionState(
      {
        accessibilityContrast: true,
        accessibilityFocus: false,
        optionLogPlexPlayback: true,
        currentTheme: 'plex',
        viewArtists: 'list',
        gridCollectionsTotalItems: false,
        gridCollectionsUserRating: true,
        colCollectionArtistsGenre: false,
      },
      playingState
    );
    const twice = migrateSessionState(once, playingState);

    expect(twice).toEqual(once);
  });

  test('Returns an empty object unchanged when there is no playing state to apply', () => {
    expect(migrateSessionState({})).toEqual({});
  });

  test('Leaves an already up to date state untouched', () => {
    const current = {
      currentContrast: 'default',
      themeKeyFocus: false,
      optionLogPlaybackToServer: true,
      currentTheme: 'chromatix-teal',
      viewArtists: 'grid',
      viewAlbumArtists: 'list',
      colArtistTagItemsGenre: true,
      gridAlbumCollectionsTotalItems: false,
      playingVersion: 2,
    };

    expect(migrateSessionState(current, playingState)).toEqual(current);
  });

  test('Migrates a realistic legacy state end to end', () => {
    const result = migrateSessionState(
      {
        accessibilityContrast: true,
        currentTheme: 'chromatix',
        viewArtists: 'list',
        sortArtists: 'addedAt',
        orderArtists: 'desc',
        colArtistsCountry: false,
        gridCollectionsTotalItems: false,
        gridCollectionsUserRating: true,
        colCollectionAddedAt: false,
        colCollectionArtistsGenre: false,
        playingVersion: 1,
      },
      playingState
    );

    // renamed settings
    expect(result.currentContrast).toBe('medium');
    expect(result.currentTheme).toBe('chromatix-magenta');

    // artists split, retaining the original keys
    expect(result.viewArtists).toBe('list');
    expect(result.viewAlbumArtists).toBe('list');
    expect(result.sortAlbumArtists).toBe('addedAt');
    expect(result.orderAlbumArtists).toBe('desc');
    expect(result.colArtistsCountry).toBe(false);
    expect(result.colAlbumArtistsCountry).toBe(false);

    // collections split, renaming the original keys
    expect(result.gridArtistCollectionsTotalItems).toBe(false);
    expect(result.gridAlbumCollectionsTotalItems).toBe(false);
    expect('gridCollectionsTotalItems' in result).toBe(false);
    expect(result.colArtistCollectionsAddedAt).toBe(false);
    expect(result.colAlbumCollectionsAddedAt).toBe(false);
    expect('colCollectionAddedAt' in result).toBe(false);

    // collection items split into collection and tag settings, and renamed at the same time
    expect(result.colArtistCollectionItemsGenre).toBe(false);
    expect(result.colArtistTagItemsGenre).toBe(false);
    expect('colCollectionArtistsGenre' in result).toBe(false);

    // playing state cache busted
    expect(result.playingVersion).toBe(2);
  });
});

describe('Testing "applyKeySplits" function', () => {
  test('Copies a renamed key to both new keys and removes the old key', () => {
    const result = applyKeySplits({ oldThing: 1 }, [{ oldKey: 'oldThing', newKeys: ['newA', 'newB'] }]);

    expect(result).toEqual({ newA: 1, newB: 1 });
  });

  test('Retains the original key when it is one of the new keys', () => {
    const result = applyKeySplits({ thing: 'x' }, [{ oldKey: 'thing', newKeys: ['thing', 'otherThing'] }]);

    expect(result).toEqual({ thing: 'x', otherThing: 'x' });
  });

  test('Preserves falsy values rather than skipping them', () => {
    const result = applyKeySplits({ thing: false }, [{ oldKey: 'thing', newKeys: ['a', 'b'] }]);

    expect(result.a).toBe(false);
    expect(result.b).toBe(false);
  });

  test('Does not overwrite a new key that already has a value', () => {
    // a split that retains its old key would otherwise re-seed on every load, undoing the user's own changes
    const result = applyKeySplits({ thing: 'grid', otherThing: 'list' }, [
      { oldKey: 'thing', newKeys: ['thing', 'otherThing'] },
    ]);

    expect(result.thing).toBe('grid');
    expect(result.otherThing).toBe('list');
  });

  test('Does not overwrite a new key that has been set to a falsy value', () => {
    const result = applyKeySplits({ thing: true, otherThing: false }, [
      { oldKey: 'thing', newKeys: ['thing', 'otherThing'] },
    ]);

    expect(result.otherThing).toBe(false);
  });

  test('Keeps split views independent once they have diverged', () => {
    // simulate: user upgrades, then changes one of the split views, then reloads the app
    const afterUpgrade = applyKeySplits({ viewArtists: 'grid' }, viewSettingsSplits);
    const afterUserChange = { ...afterUpgrade, viewAlbumArtists: 'list' };
    const afterReload = applyKeySplits(afterUserChange, viewSettingsSplits);

    expect(afterReload.viewArtists).toBe('grid');
    expect(afterReload.viewAlbumArtists).toBe('list');
  });

  test('Ignores splits whose old key is absent', () => {
    const result = applyKeySplits({ kept: 1 }, [{ oldKey: 'missing', newKeys: ['a'] }]);

    expect(result).toEqual({ kept: 1 });
  });

  test('Leaves unrelated keys untouched', () => {
    const result = applyKeySplits({ unrelated: 'keep', oldThing: 1 }, [{ oldKey: 'oldThing', newKeys: ['newA'] }]);

    expect(result.unrelated).toBe('keep');
  });

  test('Does not mutate the object it is given', () => {
    const original = { oldThing: 1 };
    applyKeySplits(original, [{ oldKey: 'oldThing', newKeys: ['newA'] }]);

    expect(original).toEqual({ oldThing: 1 });
  });
});

describe('Testing "viewSettingsSplitSentinel"', () => {
  test('Is one of the declared splits', () => {
    const oldKeys = viewSettingsSplits.map(({ oldKey }) => oldKey);

    expect(oldKeys).toContain(viewSettingsSplitSentinel);
  });

  test('Is a split that renames its old key, so it is removed once migrated', () => {
    const split = viewSettingsSplits.find(({ oldKey }) => oldKey === viewSettingsSplitSentinel);

    // a retained key is never removed, so it could never signal that the migration is complete
    expect(split?.newKeys).not.toContain(viewSettingsSplitSentinel);
  });

  test('Gates the split, so an already migrated state is left alone', () => {
    // no sentinel present, but a retained old key is - the splits must not run again
    const alreadyMigrated = { viewArtists: 'grid', viewAlbumArtists: 'list' };

    expect(migrateSessionState(alreadyMigrated)).toEqual(alreadyMigrated);
  });

  test('Runs the split when the sentinel is present', () => {
    const result = migrateSessionState({
      [viewSettingsSplitSentinel]: false,
      viewArtists: 'list',
    });

    expect(result.viewAlbumArtists).toBe('list');
    expect(viewSettingsSplitSentinel in result).toBe(false);
  });
});

describe('Testing "viewSettingsSplits" definitions', () => {
  test('Every split declares at least one new key', () => {
    viewSettingsSplits.forEach(({ oldKey, newKeys }) => {
      expect(newKeys.length, `${oldKey} has no new keys`).toBeGreaterThan(0);
    });
  });

  test('No old key is declared more than once', () => {
    const oldKeys = viewSettingsSplits.map(({ oldKey }) => oldKey);

    expect(new Set(oldKeys).size).toBe(oldKeys.length);
  });

  test('No new key is written by more than one split', () => {
    const newKeys = viewSettingsSplits.flatMap(({ newKeys: keys }) => keys);

    expect(new Set(newKeys).size).toBe(newKeys.length);
  });

  test('A retained old key only ever appears within its own split', () => {
    const allNewKeys = new Set(viewSettingsSplits.flatMap(({ newKeys }) => newKeys));

    viewSettingsSplits.forEach(({ oldKey, newKeys }) => {
      if (allNewKeys.has(oldKey)) {
        expect(newKeys, `${oldKey} is written by a different split`).toContain(oldKey);
      }
    });
  });
});

describe('Testing "renamedThemes" definitions', () => {
  test('No theme is renamed to another renamed theme', () => {
    Object.values(renamedThemes).forEach((newTheme) => {
      expect(renamedThemes[newTheme], `${newTheme} is itself renamed`).toBeUndefined();
    });
  });
});
