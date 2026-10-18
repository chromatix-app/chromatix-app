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

  test('Core button text switches to the text colour only when the background is unreadable on core', () => {
    const coreText = (input: ColorTokensInput) => getColorTokens(input).tokens['--color-core-on-primary-text'];
    // Chromatix magenta: the background reads well enough on core, so it stays
    expect(coreText(dark)).toBe('#021c27');
    // White with a green core: white on green is unreadable, so the dark text colour takes over
    expect(coreText({ ...light, core: '#9de50d' })).toBe('#111111');
    // White with magenta: white on magenta passes at every contrast level
    expect(coreText(light)).toBe('#ffffff');
    expect(coreText({ ...light, contrast: 'high' })).toBe('#ffffff');
  });

  test('Core text switches on both surfaces together when either is unreadable', () => {
    // White with orange: white on orange passes, but the darker secondary background fails, so both switch
    const { tokens } = getColorTokens({ ...light, core: '#ff6f10' });
    expect(tokens['--color-core-on-primary-text']).toBe('#111111');
    expect(tokens['--color-core-on-secondary-text']).toBe('#111111');
  });

  test('Core hovers reach the hover contrast for each contrast level', () => {
    for (const contrast of ['default', 'medium', 'high'] as const) {
      const { tokens } = getColorTokens({ ...dark, contrast });
      const target = { default: 1.15, medium: 1.2, high: 1.25 }[contrast];
      expect(chroma.contrast(tokens['--color-core-hover'], tokens['--color-core-main'])).toBeGreaterThanOrEqual(target);
    }
  });

  test('Checked checkboxes fill with core, shifted where it is too faint against the background', () => {
    const checked = (input: ColorTokensInput) => getColorTokens(input).tokens['--color-checkbox-on-primary-checked-bg'];
    const onBackground = (input: ColorTokensInput) => chroma.contrast(checked(input), input.background);
    // Chromatix magenta: core already stands out, so it stays
    expect(checked(dark)).toBe('#f7277a');
    // White with a green core: core is faint on white, so it darkens just enough to reach each level's target
    const green = { ...light, core: '#7fbb09' };
    expect(onBackground(green)).toBeGreaterThanOrEqual(3);
    expect(onBackground(green)).toBeLessThan(3.1);
    expect(onBackground({ ...green, contrast: 'high' })).toBeGreaterThanOrEqual(4);
    // It keeps its hue (within 5 degrees) rather than turning grey
    expect(Math.abs(chroma(checked(green)).get('lch.h') - chroma('#7fbb09').get('lch.h'))).toBeLessThan(5);
    // The tick is always the primary background
    expect(getColorTokens(green).tokens['--color-checkbox-on-primary-checked-tick']).toBe('#ffffff');
  });

  test('Checked checkboxes fall back to the text colour when no shift can reach the target', () => {
    // Grey with white text at high contrast: even white only reaches 3.95 against the grey
    const grey = {
      background: '#808080',
      text: '#ffffff',
      core: '#f7277a',
      contrast: 'high',
      tinting: 'auto',
    } as const;
    expect(getColorTokens(grey).tokens['--color-checkbox-on-primary-checked-bg']).toBe('#ffffff');
  });

  test('Slider fills shift core to reach the focus contrast against their own surface', () => {
    const { tokens } = getColorTokens({ ...light, core: '#7fbb09', contrast: 'high' });
    expect(chroma.contrast(tokens['--color-slider-on-primary-fill'], light.background)).toBeGreaterThanOrEqual(4);
    expect(
      chroma.contrast(tokens['--color-slider-on-secondary-fill'], tokens['--color-secondary-bg'])
    ).toBeGreaterThanOrEqual(4);
    // Chromatix magenta already stands out on both surfaces, so it stays
    expect(getColorTokens(dark).tokens['--color-slider-on-secondary-fill']).toBe('#f7277a');
  });

  test('Selected select items reach the focus contrast against both the popup and the highlighted row', () => {
    for (const contrast of ['default', 'high'] as const) {
      const { tokens } = getColorTokens({ ...dark, contrast });
      const selected = tokens['--color-select-on-secondary-checked-text'];
      const target = contrast === 'high' ? 4 : 3;
      expect(chroma.contrast(selected, tokens['--color-secondary-bg'])).toBeGreaterThanOrEqual(target);
      expect(chroma.contrast(selected, tokens['--color-item-on-secondary-hover'])).toBeGreaterThanOrEqual(target);
    }
    // Chromatix magenta reaches 3 on both at default, so it stays
    expect(getColorTokens(dark).tokens['--color-select-on-secondary-checked-text']).toBe('#f7277a');
  });

  test('Active items reach the focus contrast against every row state', () => {
    const { tokens } = getColorTokens({ ...dark, contrast: 'high' });
    const onSecondary = tokens['--color-item-on-secondary-active-text'];
    for (const row of ['--color-secondary-bg', '--color-item-on-secondary-hover', '--color-item-on-secondary-active']) {
      expect(chroma.contrast(onSecondary, tokens[row])).toBeGreaterThanOrEqual(4);
    }
    const onPrimary = tokens['--color-item-on-primary-active-text'];
    for (const row of ['--color-primary-bg', '--color-item-on-primary-hover']) {
      expect(chroma.contrast(onPrimary, tokens[row])).toBeGreaterThanOrEqual(4);
    }
    // Selected select items share the secondary colour
    expect(tokens['--color-select-on-secondary-checked-text']).toBe(onSecondary);
  });

  test('An unknown contrast setting falls back to default', () => {
    const unknown = getColorTokens({ ...dark, contrast: 'unknown' as ColorTokensInput['contrast'] });
    expect(unknown).toEqual(getColorTokens(dark));
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
