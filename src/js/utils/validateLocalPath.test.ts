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

  test('Test with valid Windows network share paths ending in a slash', () => {
    expect(validateLocalPath('\\\\NAS\\images\\')).toBeNull();
    expect(validateLocalPath('\\\\NAS\\media\\tags\\')).toBeNull();
    expect(validateLocalPath('//NAS/images/')).toBeNull();
  });

  test('Test with an incomplete Windows network share path', () => {
    expect(validateLocalPath('\\\\NAS\\')).toBe('Path must be absolute');
    expect(validateLocalPath('\\\\')).toBe('Path must be absolute');
    expect(validateLocalPath('\\images\\')).toBe('Path must be absolute');
  });

  test('Test with a Windows network share path missing a trailing slash', () => {
    expect(validateLocalPath('\\\\NAS\\images')).toBe('Path must end with a / or \\');
  });

  test('Test with a relative path', () => {
    expect(validateLocalPath('tags/')).toBe('Path must be absolute');
    expect(validateLocalPath('./tags/')).toBe('Path must be absolute');
    expect(validateLocalPath('../tags/')).toBe('Path must be absolute');
  });

  test('Test with a path missing a trailing slash', () => {
    expect(validateLocalPath('/Users/Alex/tags')).toBe('Path must end with a / or \\');
    expect(validateLocalPath('C:/Users/Alex/tags')).toBe('Path must end with a / or \\');
    expect(validateLocalPath('C:\\Users\\Alex\\tags')).toBe('Path must end with a / or \\');
  });
});
