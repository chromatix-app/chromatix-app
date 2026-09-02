import { describe, expect, it } from 'vitest';

import slugifyTagName from './slugifyTagName';

describe('slugifyTagName', () => {
  it('lowercases and hyphenates', () => {
    expect(slugifyTagName('Acid Jazz')).toBe('acid-jazz');
  });

  it('strips accents/diacritics', () => {
    expect(slugifyTagName('Électronique')).toBe('electronique');
    expect(slugifyTagName('Yé-yé')).toBe('ye-ye');
    expect(slugifyTagName('Sigur Rós')).toBe('sigur-ros');
    expect(slugifyTagName('Café Del Mar')).toBe('cafe-del-mar');
    expect(slugifyTagName('Français')).toBe('francais');
    expect(slugifyTagName('Mötley Crüe')).toBe('motley-crue');
  });

  it('replaces "&" with "and", surrounded by hyphens regardless of surrounding whitespace', () => {
    expect(slugifyTagName('R&B')).toBe('r-and-b');
    expect(slugifyTagName('R & B')).toBe('r-and-b');
    expect(slugifyTagName('R& B')).toBe('r-and-b');
    expect(slugifyTagName('R &B')).toBe('r-and-b');
    expect(slugifyTagName('Rock & Roll')).toBe('rock-and-roll');
  });

  it('collapses other non-alphanumeric characters into hyphens', () => {
    expect(slugifyTagName('Blues - Rock')).toBe('blues-rock');
    expect(slugifyTagName('Hip  Hop')).toBe('hip-hop');
    expect(slugifyTagName('R&B/Soul')).toBe('r-and-b-soul');
  });

  it('collapses consecutive non-alphanumeric characters into a single hyphen', () => {
    expect(slugifyTagName('Rock -- Metal')).toBe('rock-metal');
    expect(slugifyTagName('Rock   Metal')).toBe('rock-metal');
  });

  it('strips leading/trailing non-alphanumeric characters', () => {
    expect(slugifyTagName('-Test-')).toBe('test');
    expect(slugifyTagName('  Bright  ')).toBe('bright');
    expect(slugifyTagName('& Bright &')).toBe('and-bright-and');
  });

  it('leaves an already-slugified name unchanged', () => {
    expect(slugifyTagName('symphonic-metal')).toBe('symphonic-metal');
  });

  it('preserves numbers', () => {
    expect(slugifyTagName('Y2K Pop')).toBe('y2k-pop');
  });

  it('returns an empty string for an empty string', () => {
    expect(slugifyTagName('')).toBe('');
  });

  it('removes apostrophes and quotes entirely rather than hyphenating them, so equivalent tags collide', () => {
    expect(slugifyTagName("80's")).toBe(slugifyTagName('80s'));
    expect(slugifyTagName("90's Rock")).toBe(slugifyTagName('90s Rock'));
    expect(slugifyTagName("Children's")).toBe('childrens');
    expect(slugifyTagName("Rock 'n' Roll")).toBe('rock-n-roll');
    expect(slugifyTagName('“Weird” Tag')).toBe('weird-tag');
  });

  it('returns an empty string for tags with no Latin/alphanumeric content', () => {
    expect(slugifyTagName('Поп')).toBe('');
    expect(slugifyTagName('アジア')).toBe('');
  });
});
