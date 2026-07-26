// Generated using GitHub Copilot

import validateEntityName from './validateEntityName';

describe('Testing "validateEntityName" function', () => {
  test('Test with empty or whitespace-only input', () => {
    expect(validateEntityName('', [])).toBe('Name is required');
    expect(validateEntityName('   ', [])).toBe('Name is required');
  });

  test('Test with valid names', () => {
    expect(validateEntityName('My Playlist', [])).toBeNull();
    expect(validateEntityName('  Trimmed  ', [])).toBeNull();
    expect(validateEntityName("90's Rock & Roll", [])).toBeNull();
  });

  test('Test with a name over the length limit', () => {
    expect(validateEntityName('a'.repeat(129), [])).toBe('Name must be 128 characters or fewer');
    expect(validateEntityName('a'.repeat(128), [])).toBeNull();
  });

  test('Test with unsafe characters', () => {
    expect(validateEntityName('a/b', [])).toBe('Name cannot contain /');
    expect(validateEntityName('a\\b', [])).toBe('Name cannot contain \\');
    expect(validateEntityName('a:b', [])).toBe('Name cannot contain :');
    expect(validateEntityName('a*b', [])).toBe('Name cannot contain *');
    expect(validateEntityName('a?b', [])).toBe('Name cannot contain ?');
    expect(validateEntityName('a"b', [])).toBe('Name cannot contain "');
    expect(validateEntityName('a<b', [])).toBe('Name cannot contain <');
    expect(validateEntityName('a>b', [])).toBe('Name cannot contain >');
    expect(validateEntityName('a|b', [])).toBe('Name cannot contain |');
  });

  test('Test with multiple different unsafe characters, deduplicated', () => {
    expect(validateEntityName('a/b:c', [])).toBe('Name cannot contain / :');
    expect(validateEntityName('a/b/c', [])).toBe('Name cannot contain /');
  });

  test('Test unsafe characters are reported in first-occurrence order', () => {
    expect(validateEntityName('a:b/c:d', [])).toBe('Name cannot contain : /');
  });

  test('Test the length check takes priority over the unsafe character check', () => {
    const tooLongAndUnsafe = 'a/'.repeat(65);
    expect(tooLongAndUnsafe.length).toBeGreaterThan(128);
    expect(validateEntityName(tooLongAndUnsafe, [])).toBe('Name must be 128 characters or fewer');
  });

  test('Test existing names with untrimmed whitespace are still matched as duplicates', () => {
    expect(validateEntityName('Road Trip', [' Road Trip '])).toBe('Name already in use');
    expect(validateEntityName('Road Trip', ['\tRoad Trip\n'])).toBe('Name already in use');
  });

  test('Test with a duplicate name (case-insensitive)', () => {
    expect(validateEntityName('Road Trip', ['Road Trip'])).toBe('Name already in use');
    expect(validateEntityName('road trip', ['Road Trip'])).toBe('Name already in use');
    expect(validateEntityName(' Road Trip ', ['Road Trip'])).toBe('Name already in use');
    expect(validateEntityName('Road Trip 2', ['Road Trip'])).toBeNull();
  });

  test('Test editing allows keeping the current name', () => {
    expect(validateEntityName('Road Trip', ['Road Trip'], 'Road Trip')).toBeNull();
    expect(validateEntityName('road trip', ['Road Trip'], 'Road Trip')).toBeNull();
    expect(validateEntityName('Road Trip', ['Road Trip', 'Other'], 'Road Trip')).toBeNull();
  });

  test('Test editing still rejects a rename onto a different existing name', () => {
    expect(validateEntityName('Other', ['Road Trip', 'Other'], 'Road Trip')).toBe('Name already in use');
  });

  test('Test an empty or omitted currentName is treated the same as not editing', () => {
    expect(validateEntityName('Road Trip', ['Road Trip'], '')).toBe('Name already in use');
    expect(validateEntityName('Road Trip', ['Road Trip'], undefined)).toBe('Name already in use');
    expect(validateEntityName('Road Trip', ['Road Trip'])).toBe('Name already in use');
  });
});
