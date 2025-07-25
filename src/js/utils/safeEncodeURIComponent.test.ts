// Generated using GitHub Copilot

import safeEncodeURIComponent from './safeEncodeURIComponent';

describe('Testing "safeEncodeURIComponent" function', () => {
  test('Test with empty input', () => {
    expect(safeEncodeURIComponent('')).toBe('');
    expect(safeEncodeURIComponent('' as any)).toBe('');
  });

  test('Test with simple strings', () => {
    expect(safeEncodeURIComponent('hello')).toBe('hello');
    expect(safeEncodeURIComponent('Hello World')).toBe('Hello__SP__World');
    expect(safeEncodeURIComponent('test123')).toBe('test123');
  });

  test('Test with special characters', () => {
    expect(safeEncodeURIComponent('&')).toBe('__AMP__');
    expect(safeEncodeURIComponent(':')).toBe('__COL__');
    expect(safeEncodeURIComponent('=')).toBe('__EQ__');
    expect(safeEncodeURIComponent('#')).toBe('__HASH__');
    expect(safeEncodeURIComponent('%')).toBe('__PCT__');
    expect(safeEncodeURIComponent('+')).toBe('__PLUS__');
    expect(safeEncodeURIComponent('?')).toBe('__QST__');
    expect(safeEncodeURIComponent('/')).toBe('__SLSH__');
    expect(safeEncodeURIComponent(' ')).toBe('__SP__');
  });

  test('Test with complex strings', () => {
    expect(safeEncodeURIComponent('hello&world')).toBe('hello__AMP__world');
    expect(safeEncodeURIComponent('query?param=value')).toBe('query__QST__param__EQ__value');
    expect(safeEncodeURIComponent('path/to/resource')).toBe('path__SLSH__to__SLSH__resource');
    expect(safeEncodeURIComponent('100% complete')).toBe('100__PCT____SP__complete');
    expect(safeEncodeURIComponent('Music: Rock & Roll')).toBe('Music__COL____SP__Rock__SP____AMP____SP__Roll');
  });

  test('Test with URL components', () => {
    const query = 'search?q=test&type=image';
    const path = '/artists/Taylor Swift/albums/1989';

    expect(safeEncodeURIComponent(query)).toBe('search__QST__q__EQ__test__AMP__type__EQ__image');
    expect(safeEncodeURIComponent(path)).toBe('__SLSH__artists__SLSH__Taylor__SP__Swift__SLSH__albums__SLSH__1989');
  });

  test('Test with unicode characters', () => {
    // For Unicode characters, the function should preserve the encodeURIComponent result
    // Let's test that the encoded strings contain the expected URL encoding patterns
    const japanese = safeEncodeURIComponent('こんにちは');
    const chinese = safeEncodeURIComponent('你好');
    const emoji = safeEncodeURIComponent('😀');

    // Check if they contain the expected encoding patterns
    expect(japanese).toMatch(/%E3%81%93/); // Part of こ
    expect(chinese).toMatch(/%E4%BD%A0/); // Part of 你
    expect(emoji).toMatch(/%F0%9F%98%80/); // 😀
  });

  test('Test with error handling and edge cases', () => {
    // Test with null and undefined, which should be handled by the function
    expect(safeEncodeURIComponent(undefined as any)).toBe('');
    expect(safeEncodeURIComponent(null as any)).toBe('');

    // Test with non-string input
    expect(safeEncodeURIComponent(123 as any)).toBe('123');
    expect(safeEncodeURIComponent(true as any)).toBe('true');
  });

  test('Test roundtrip encoding and decoding', () => {
    // Import the decode function to test roundtrip
    const safeDecodeURIComponent = require('./safeDecodeURIComponent').default;

    const testStrings = [
      'Hello World',
      'Query?param=value&another=123',
      '/path/to/resource#fragment',
      '100% complete + extra',
      'Music: Rock & Roll',
      'こんにちは',
      '😀',
    ];

    testStrings.forEach((str) => {
      const encoded = safeEncodeURIComponent(str);
      const decoded = safeDecodeURIComponent(encoded);
      expect(decoded).toBe(str);
    });
  });
});
