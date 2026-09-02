// Tests generated using AI

import validateHttpsUrl from './validateHttpsUrl';

describe('Testing "validateHttpsUrl" function', () => {
  test('Test with empty or whitespace-only input', () => {
    expect(validateHttpsUrl('')).toBe('URL is required');
    expect(validateHttpsUrl('   ')).toBe('URL is required');
  });

  test('Test with valid https URLs ending in a slash', () => {
    expect(validateHttpsUrl('https://assets.chromatix.app/tags/community/')).toBeNull();
    expect(validateHttpsUrl('https://example.com/')).toBeNull();
    expect(validateHttpsUrl('  https://example.com/  ')).toBeNull();
  });

  test('Test with a malformed URL', () => {
    expect(validateHttpsUrl('not a url')).toBe('Enter a valid URL');
    expect(validateHttpsUrl('https://')).toBe('Enter a valid URL');
  });

  test('Test with a non-https protocol', () => {
    expect(validateHttpsUrl('http://example.com/')).toBe('URL must start with https://');
    expect(validateHttpsUrl('ftp://example.com/')).toBe('URL must start with https://');
    expect(validateHttpsUrl('chromatix://local/path/')).toBe('URL must start with https://');
  });

  test('Test with a URL missing a trailing slash', () => {
    expect(validateHttpsUrl('https://example.com')).toBe('URL must end with a /');
    expect(validateHttpsUrl('https://assets.chromatix.app/tags/community')).toBe('URL must end with a /');
  });
});
