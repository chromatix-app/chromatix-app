// Tests generated using AI

import validateLocalPath from './validateLocalPath';

describe('Testing "validateLocalPath" function', () => {
  test('Test with empty or whitespace-only input', () => {
    expect(validateLocalPath('')).toBe('Path is required');
    expect(validateLocalPath('   ')).toBe('Path is required');
  });

  test('Test with valid POSIX absolute paths ending in a slash', () => {
    expect(validateLocalPath('/Users/Alex/Documents/Chromatix/tags/')).toBeNull();
    expect(validateLocalPath('  /Users/Alex/tags/  ')).toBeNull();
  });

  test('Test with valid Windows absolute paths ending in a slash', () => {
    expect(validateLocalPath('C:/Users/Alex/tags/')).toBeNull();
    expect(validateLocalPath('C:\\Users\\Alex\\tags\\')).toBeNull();
  });

  test('Test with a relative path', () => {
    expect(validateLocalPath('tags/')).toBe('Path must be absolute');
    expect(validateLocalPath('./tags/')).toBe('Path must be absolute');
    expect(validateLocalPath('../tags/')).toBe('Path must be absolute');
  });

  test('Test with a path missing a trailing slash', () => {
    expect(validateLocalPath('/Users/Alex/tags')).toBe('Path must end with a /');
    expect(validateLocalPath('C:/Users/Alex/tags')).toBe('Path must end with a /');
  });
});
