// Tests generated using AI

import slugifyTagName from './slugifyTagName';

describe('Testing "slugifyTagName" function', () => {
  test('Test lowercasing', () => {
    expect(slugifyTagName('Acerbic')).toBe('acerbic');
    expect(slugifyTagName('ANGST-RIDDEN')).toBe('angst-ridden');
  });

  test('Test spaces are replaced with hyphens', () => {
    expect(slugifyTagName('Album Rock')).toBe('album-rock');
    expect(slugifyTagName('Calm & Peaceful')).toBe('calm-and-peaceful');
  });

  test('Test ampersands are replaced with "and"', () => {
    expect(slugifyTagName('Adult Alternative Pop & Rock')).toBe('adult-alternative-pop-and-rock');
    expect(slugifyTagName('Comedy & Spoken')).toBe('comedy-and-spoken');
  });

  test('Test other non-alphanumeric characters collapse into a single hyphen', () => {
    expect(slugifyTagName('R&B/Soul')).toBe('randb-soul');
    expect(slugifyTagName("90's Rock")).toBe('90-s-rock');
  });

  test('Test consecutive non-alphanumeric characters collapse into a single hyphen', () => {
    expect(slugifyTagName('Rock -- Metal')).toBe('rock-metal');
    expect(slugifyTagName('Rock   Metal')).toBe('rock-metal');
  });

  test('Test leading and trailing non-alphanumeric characters are stripped', () => {
    expect(slugifyTagName('  Bright  ')).toBe('bright');
    expect(slugifyTagName('-Bright-')).toBe('bright');
    expect(slugifyTagName('& Bright &')).toBe('and-bright-and');
  });

  test('Test an already-slugified name is unchanged', () => {
    expect(slugifyTagName('symphonic-metal')).toBe('symphonic-metal');
  });

  test('Test numbers are preserved', () => {
    expect(slugifyTagName('Y2K Pop')).toBe('y2k-pop');
  });

  test('Test an empty string returns an empty string', () => {
    expect(slugifyTagName('')).toBe('');
  });
});
