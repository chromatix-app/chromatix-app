// Tests generated using AI

import isGeneratedSortTitle from './isGeneratedSortTitle';

describe('Testing "isGeneratedSortTitle" function', () => {
  test('Treats a sort title identical to the title as generated', () => {
    expect(isGeneratedSortTitle('Nightwish', 'Nightwish')).toBe(true);
  });

  test('Treats a sort title with the leading article removed as generated', () => {
    expect(isGeneratedSortTitle('The Offspring', 'Offspring')).toBe(true);
    expect(isGeneratedSortTitle('A Matter Of Life And Death', 'Matter Of Life And Death')).toBe(true);
    expect(isGeneratedSortTitle('An Evening With', 'Evening With')).toBe(true);
  });

  test('Treats a sort title with accents removed as generated', () => {
    expect(isGeneratedSortTitle('Skeletá', 'Skeleta')).toBe(true);
    expect(isGeneratedSortTitle('Mötley Crüe', 'Motley Crue')).toBe(true);
  });

  test('Treats a sort title with both the article and accents removed as generated', () => {
    expect(isGeneratedSortTitle('The Café Tapes', 'Cafe Tapes')).toBe(true);
  });

  test('Ignores case and surrounding whitespace', () => {
    expect(isGeneratedSortTitle('The Offspring', 'offspring')).toBe(true);
    expect(isGeneratedSortTitle(' Nightwish ', 'NIGHTWISH')).toBe(true);
  });

  test('Treats a sort title that differs from the title as hand-set', () => {
    expect(isGeneratedSortTitle('David Bowie', 'Bowie, David')).toBe(false);
    expect(isGeneratedSortTitle('The Beatles', 'Beatles, The')).toBe(false);
    expect(isGeneratedSortTitle('Greatest Hits', 'Queen Greatest Hits')).toBe(false);
    expect(isGeneratedSortTitle('The Offspring', 'Offspring2')).toBe(false);
  });

  test('Treats a sort title left over from an edited title as hand-set', () => {
    expect(isGeneratedSortTitle('Omegacoustic', 'Omegacoustic - EP')).toBe(false);
    expect(isGeneratedSortTitle('The Unforgiving', 'Unforgiving (Special Edition)')).toBe(false);
  });

  test('Only removes an article at the start, followed by a space', () => {
    expect(isGeneratedSortTitle('Theatre Of Tragedy', 'atre Of Tragedy')).toBe(false);
    expect(isGeneratedSortTitle('Anthrax', 'thrax')).toBe(false);
    expect(isGeneratedSortTitle('Into The Night', 'Into Night')).toBe(false);
  });

  test('Treats a sort title that only adds a leading article as generated', () => {
    expect(isGeneratedSortTitle('Offspring', 'The Offspring')).toBe(true);
  });
});
