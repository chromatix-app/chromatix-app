import safeDecodeURIComponent from './safeDecodeURIComponent';
import safeEncodeURIComponent from './safeEncodeURIComponent';

describe('Testing "safeDecodeURIComponent" function', () => {
  test('Test with empty input', () => {
    expect(safeDecodeURIComponent('')).toBe('');
    expect(safeDecodeURIComponent('' as any)).toBe('');
  });

  test('Test with simple strings', () => {
    expect(safeDecodeURIComponent('hello')).toBe('hello');
    expect(safeDecodeURIComponent('test123')).toBe('test123');
    expect(safeDecodeURIComponent('Hello__SP__World')).toBe('Hello World');
  });

  test('Test with special character placeholders', () => {
    expect(safeDecodeURIComponent('__AMP__')).toBe('&');
    expect(safeDecodeURIComponent('__COL__')).toBe(':');
    expect(safeDecodeURIComponent('__EQ__')).toBe('=');
    expect(safeDecodeURIComponent('__HASH__')).toBe('#');
    expect(safeDecodeURIComponent('__PCT__')).toBe('%');
    expect(safeDecodeURIComponent('__PLUS__')).toBe('+');
    expect(safeDecodeURIComponent('__QST__')).toBe('?');
    expect(safeDecodeURIComponent('__SLSH__')).toBe('/');
    expect(safeDecodeURIComponent('__SP__')).toBe(' ');
  });

  test('Test with encoded complex strings', () => {
    expect(safeDecodeURIComponent('hello__AMP__world')).toBe('hello&world');
    expect(safeDecodeURIComponent('query__QST__param__EQ__value')).toBe('query?param=value');
    expect(safeDecodeURIComponent('path__SLSH__to__SLSH__resource')).toBe('path/to/resource');
    expect(safeDecodeURIComponent('100__PCT____SP__complete')).toBe('100% complete');
    expect(safeDecodeURIComponent('Music__COL____SP__Rock__SP____AMP____SP__Roll')).toBe('Music: Rock & Roll');
  });

  test('Test with encoded URL components', () => {
    const encodedQuery = 'search__QST__q__EQ__test__AMP__type__EQ__image';
    const encodedPath = '__SLSH__artists__SLSH__Taylor__SP__Swift__SLSH__albums__SLSH__1989';

    expect(safeDecodeURIComponent(encodedQuery)).toBe('search?q=test&type=image');
    expect(safeDecodeURIComponent(encodedPath)).toBe('/artists/Taylor Swift/albums/1989');
  });

  test('Test with standard URL-encoded characters', () => {
    expect(safeDecodeURIComponent('%20')).toBe(' ');
    expect(safeDecodeURIComponent('%26')).toBe('&');
    expect(safeDecodeURIComponent('%3F')).toBe('?');
  });

  test('Test with unicode characters', () => {
    expect(safeDecodeURIComponent('%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF')).toBe('こんにちは');
    expect(safeDecodeURIComponent('%E4%BD%A0%E5%A5%BD')).toBe('你好');
    expect(safeDecodeURIComponent('%F0%9F%98%80')).toBe('😀');
  });

  test('Test with malformed input', () => {
    // Test error handling when decoding fails
    const malformedInput = '%E0%A4'; // Incomplete UTF-8 sequence
    expect(safeDecodeURIComponent(malformedInput)).toBe(malformedInput);
  });

  test('Test roundtrip encoding and decoding', () => {
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
