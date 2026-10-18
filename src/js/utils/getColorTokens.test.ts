// Tests generated using AI

import chroma from 'chroma-js';

import getColorTokens, { ColorTokensInput } from './getColorTokens';

const dark: ColorTokensInput = {
  background: '#021c27',
  text: '#ffffff',
  core: '#f7277a',
  contrast: 'default',
  tinting: 'auto',
};

const light: ColorTokensInput = {
  background: '#ffffff',
  text: '#111111',
  core: '#f7277a',
  contrast: 'default',
  tinting: 'auto',
};

describe('Testing "getColorTokens" function', () => {
  test('Normalises the base colours to 6-digit lowercase hex', () => {
    const { tokens } = getColorTokens({ ...dark, background: '#000', text: '#FFF', core: 'red' });
    expect(tokens['--color-primary-bg']).toBe('#000000');
    expect(tokens['--color-text']).toBe('#ffffff');
    expect(tokens['--color-core-main']).toBe('#ff0000');
  });

  test('Detects light and dark themes from the background with auto tinting', () => {
    expect(getColorTokens(dark).isLightTheme).toBe(false);
    expect(getColorTokens(light).isLightTheme).toBe(true);
  });

  test('Detects light and dark text', () => {
    expect(getColorTokens(dark).isLightText).toBe(true);
    expect(getColorTokens(light).isLightText).toBe(false);
  });

  test('Tinting overrides the light or dark detection', () => {
    expect(getColorTokens({ ...dark, tinting: 'darken' }).isLightTheme).toBe(true);
    expect(getColorTokens({ ...light, tinting: 'lighten' }).isLightTheme).toBe(false);
  });

  test('Surfaces lighten on dark themes and darken on light themes', () => {
    const luminance = (input: ColorTokensInput, token: string) =>
      chroma(String(getColorTokens(input).tokens[token])).luminance();
    expect(luminance(dark, '--color-secondary-bg')).toBeGreaterThan(luminance(dark, '--color-primary-bg'));
    expect(luminance(light, '--color-secondary-bg')).toBeLessThan(luminance(light, '--color-primary-bg'));
  });

  test('Higher contrast increases opacities', () => {
    const opacity = (contrast: ColorTokensInput['contrast']) => getColorTokens({ ...dark, contrast }).tokens;
    expect(opacity('default')['--opacity-04']).toBe(0.4);
    expect(opacity('medium')['--opacity-04']).toBeGreaterThan(0.4);
    expect(opacity('high')['--opacity-04']).toBeGreaterThan(Number(opacity('medium')['--opacity-04']));
  });

  test('Disabled tokens stay the same at every contrast level', () => {
    const disabled = (contrast: ColorTokensInput['contrast']) => {
      const { tokens } = getColorTokens({ ...dark, contrast });
      return Object.fromEntries(Object.entries(tokens).filter(([key]) => key.includes('disabled')));
    };
    expect(disabled('default')['--opacity-disabled']).toBe(0.4);
    expect(disabled('high')).toEqual(disabled('default'));
    expect(disabled('medium')).toEqual(disabled('default'));
  });

  test('Opacity colours append an alpha suffix to the text colour', () => {
    const { tokens } = getColorTokens(dark);
    expect(tokens['--color-opacity-05']).toBe('#ffffff80');
  });

  test('Flattened tokens are solid 6-digit hex', () => {
    const { tokens } = getColorTokens(dark);
    expect(tokens['--color-field-on-primary-focus-border']).toMatch(/^#[0-9a-f]{6}$/);
    expect(tokens['--color-checkbox-on-primary-border']).toMatch(/^#[0-9a-f]{6}$/);
  });

  test('Field focus borders reach the focus contrast for each contrast level', () => {
    const focus = (contrast: ColorTokensInput['contrast'], surface: string) => {
      const { tokens } = getColorTokens({ ...light, contrast });
      return chroma.contrast(
        String(tokens[`--color-field-on-${surface}-focus-border`]),
        String(tokens[`--color-field-on-${surface}-bg`])
      );
    };
    for (const surface of ['primary', 'secondary']) {
      expect(focus('default', surface)).toBeGreaterThanOrEqual(3);
      expect(focus('medium', surface)).toBeGreaterThanOrEqual(3.5);
      expect(focus('high', surface)).toBeGreaterThanOrEqual(4);
    }
  });

  test('Field focus border falls back to the text colour when the target is impossible', () => {
    const { tokens } = getColorTokens({ ...dark, background: '#2a2a2a', text: '#6a6a6a' });
    expect(tokens['--color-field-on-primary-focus-border']).toBe('#6a6a6a');
  });
});
