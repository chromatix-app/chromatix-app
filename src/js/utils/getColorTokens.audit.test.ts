// Tests generated using AI

// Writes an HTML report of WCAG contrast ratios for key token pairs across every dev theme and contrast level.
// Run on its own with `npm run test:colors`, which opens the report in the browser. The report can compare against
// any saved snapshot: `original` (the values before the colour fixes) or a dated baseline. `npm run test:colors:baseline`
// saves the current ratios as a new baseline, never overwriting older ones; `COLORS_SAVE=original npm run test:colors`
// overwrites the original. Saved snapshots live in tests/colors/ (committed); the report is written to test-results/colors/.
// The report is only written when COLORS_REPORT is set (as the test:colors scripts do), so normal test runs skip it.
// The guardrails at the end enforce minimum ratios, and run with the normal tests

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import chroma from 'chroma-js';

import { devThemes } from 'js/_config/devThemes';
import { themes } from 'js/_config/themes';

import getColorTokens, { ColorContrast, ColorTokensInput, contrastLevels } from './getColorTokens';

// ======================================================================
// SETUP
// ======================================================================

const reportPath = path.resolve('test-results/colors/audit.html');

const snapshotDir = path.resolve('tests/colors');

interface Snapshot {
  savedAt: string;
  // Short commit the ratios were saved at, and whether it had uncommitted changes
  commit?: string;
  dirty?: boolean;
  ratios: Record<string, number>;
}

// Snapshot IDs are their file names: `original`, or `baseline-<UTC timestamp>` so they sort by date
const isSnapshotId = (id: string): boolean => id === 'original' || id.startsWith('baseline-');

// COLORS_SAVE=baseline saves a new dated baseline; COLORS_SAVE=original overwrites the original
const saveAs = ['original', 'baseline'].find((name) => name === process.env.COLORS_SAVE);

/** Runs a git command and returns its output, or undefined if git isn't available. */
const git = (command: string): string | undefined => {
  try {
    return execSync(`git ${command}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return undefined;
  }
};

/** Reads every saved snapshot, original first then baselines newest first. */
const readSnapshots = (): Record<string, Snapshot> => {
  const ids = (fs.existsSync(snapshotDir) ? fs.readdirSync(snapshotDir) : [])
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.slice(0, -'.json'.length))
    .filter(isSnapshotId)
    .sort((a, b) => (a === 'original' ? -1 : b === 'original' ? 1 : b.localeCompare(a)));
  return Object.fromEntries(
    ids.map((id) => [id, JSON.parse(fs.readFileSync(path.join(snapshotDir, `${id}.json`), 'utf8'))])
  );
};

/** Saves the current ratios as the original or a new dated baseline. */
const saveSnapshot = (name: string, ratios: Record<string, number>) => {
  const savedAt = new Date().toISOString();
  const id = name === 'original' ? 'original' : `baseline-${savedAt.slice(0, 19).replace('T', '-').replace(/:/g, '')}`;
  const snapshot: Snapshot = {
    savedAt,
    commit: git('rev-parse --short HEAD'),
    dirty: !!git('status --porcelain'),
    ratios,
  };
  fs.mkdirSync(snapshotDir, { recursive: true });
  fs.writeFileSync(path.join(snapshotDir, `${id}.json`), JSON.stringify(snapshot, null, 2));
};

/** Labels a snapshot for the report, e.g. "Baseline 1 Nov 2026, 11:53 · 8edcadc3 (uncommitted changes)". */
const snapshotLabel = (id: string, { savedAt, commit, dirty }: Snapshot): string => {
  const date = new Date(savedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  const version = commit ? ` · ${commit}${dirty ? ' (uncommitted changes)' : ''}` : '';
  return `${id === 'original' ? 'Original' : 'Baseline'} ${date}${version}`;
};

// Ratios below this difference from a snapshot are treated as unchanged
const changeThreshold = 0.005;

const contrasts: ColorContrast[] = ['default', 'medium', 'high'];

// Focus border, item accent and hover targets per contrast level, from getColorTokens
const targetsFor = (key: 'focusContrast' | 'itemAccentContrast' | 'hoverContrast') =>
  Object.fromEntries(contrasts.map((contrast) => [contrast, contrastLevels[contrast][key]])) as Record<
    ColorContrast,
    number
  >;
const focusTargets = targetsFor('focusContrast');
const itemAccentTargets = targetsFor('itemAccentContrast');
const hoverTargets = targetsFor('hoverContrast');

// Below this, a theme's own text on its background already fails, so the UI can't fully fix it
const limitedThemeRatio = 4.5;

// Resolves a dev theme to the base colours getColorTokens takes
const toInput = (devTheme: (typeof devThemes)[number], contrast: ColorContrast): ColorTokensInput => {
  const preset = devTheme.theme ? themes[devTheme.theme as keyof typeof themes] : null;
  return {
    background: preset ? preset.background : devTheme.background!,
    text: preset ? preset.text : devTheme.text!,
    core: preset ? preset.primary : devTheme.primary!,
    contrast,
    tinting: preset ? 'auto' : devTheme.tinting!,
  };
};

// Composites a colour (which may carry an alpha suffix) at an extra opacity over a solid background
const over = (background: string, color: string, opacity = 1): string => {
  const parsed = chroma(color);
  return chroma.mix(background, parsed.alpha(1), parsed.alpha() * opacity, 'rgb').hex();
};

// ======================================================================
// PAIRS
// ======================================================================

type Kind = 'text' | 'surface' | 'focus' | 'ui' | 'border' | 'hover' | 'disabled';
type Rating = 'good' | 'ok' | 'poor' | 'none';

// fg is the text, border or hover colour; bg is the surface or resting fill it sits on. `outline` draws a UI part's
// swatch as an outline rather than a fill (e.g. an unchecked checkbox)
type Pair = (t: Record<string, string>, opacityDisabled: number) => { fg: string; bg: string; outline?: boolean };

// `swatchKind` draws the swatches as another kind (e.g. text rated against the focus targets)
interface Group {
  title: string;
  description: string;
  kind: Kind;
  swatchKind?: Kind;
  pairs: Record<string, Pair>;
}

// Good and OK minimums per kind; text and focus follow WCAG, border and hover are suggestions
const bands: Record<Kind, [number, number] | null> = {
  text: [4.5, 3],
  surface: [1.15, 1.05],
  focus: [3, 2],
  ui: [3, 2],
  border: [1.15, 1.05],
  hover: [1.2, 1.1],
  disabled: null,
};

// Focus borders and hovers are rated against their contrast level's target, with OK a little below it
const bandFor = (kind: Kind, contrast: ColorContrast): [number, number] | null =>
  kind === 'focus'
    ? [focusTargets[contrast], focusTargets[contrast] - 1]
    : kind === 'hover'
      ? [hoverTargets[contrast], hoverTargets[contrast] - 0.05]
      : bands[kind];

// Every band by contrast level and kind, for the report's comparison script
const bandsByContrast = Object.fromEntries(
  contrasts.map((contrast) => [
    contrast,
    Object.fromEntries((Object.keys(bands) as Kind[]).map((kind) => [kind, bandFor(kind, contrast)])),
  ])
);

const rate = (kind: Kind, ratio: number, contrast: ColorContrast): Rating => {
  const band = bandFor(kind, contrast);
  if (!band) return 'none';
  return ratio >= band[0] ? 'good' : ratio >= band[1] ? 'ok' : 'poor';
};

// Disabled opacities that don't use the shared disabled tokens, left as chosen by eye. Each snippet (its disabled
// selector and declaration, whitespace ignored) is checked against its stylesheet below, so the audit fails if one
// changes without this list being updated
const otherDisabledOpacities: Record<string, { file: string; snippet: string; pair: Pair }> = {
  'Sidebar history (0.25)': {
    file: 'components/SideBar/SideBar.module.scss',
    snippet: '&:disabled { opacity: 0.25;',
    pair: (t) => ({ fg: over(t['--color-secondary-bg'], t['--color-text'], 0.25), bg: t['--color-secondary-bg'] }),
  },
  'Control bar (0.5)': {
    file: 'components/ControlBar/ControlBar.module.scss',
    snippet: '&:disabled { opacity: 0.5;',
    pair: (t) => ({ fg: over(t['--color-secondary-bg'], t['--color-text'], 0.5), bg: t['--color-secondary-bg'] }),
  },
  // The disabled play button is a text-coloured fill at 0.3 on the control bar
  'Play button (0.3)': {
    file: 'components/ControlBar/ControlBar.module.scss',
    snippet:
      '&:disabled { background: var(--color-text) !important; border-color: var(--color-text) !important; opacity: 0.3;',
    pair: (t) => ({ fg: over(t['--color-secondary-bg'], t['--color-text'], 0.3), bg: t['--color-secondary-bg'] }),
  },
  'Radio (0.35)': {
    file: 'components/SettingsList/SettingsList.module.scss',
    snippet: "input[type='radio']:disabled + span::before { opacity: 0.35;",
    pair: (t) => ({
      fg: over(t['--color-primary-bg'], t['--color-checkbox-on-primary-border'], 0.35),
      bg: t['--color-primary-bg'],
    }),
  },
  // Still scales with contrast
  'Tab group (opacity-025)': {
    file: 'components/FormTabGroup/FormTabGroup.module.scss',
    snippet: '&:disabled { cursor: default; > * { opacity: var(--opacity-025);',
    pair: (t) => ({
      fg: over(t['--color-button-on-primary-bg'], t['--color-text'], Number(t['--opacity-025'])),
      bg: t['--color-button-on-primary-bg'],
    }),
  },
  // Still scales with contrast, inside a slider already faded by the disabled opacity
  'Slider thumb (opacity-05)': {
    file: 'components/RangeSlider/RangeSlider.module.scss',
    snippet: '.inputDisabled & { background: var(--color-text); opacity: var(--opacity-05);',
    pair: (t, opacityDisabled) => ({
      fg: over(t['--color-primary-bg'], t['--color-text'], Number(t['--opacity-05']) * opacityDisabled),
      bg: t['--color-primary-bg'],
    }),
  },
};

const groups: Group[] = [
  {
    title: 'Surfaces',
    description: 'How distinct each surface is from the one beneath it (left half beneath, right half on top).',
    kind: 'surface',
    pairs: {
      'Secondary on primary': (t) => ({ fg: t['--color-secondary-bg'], bg: t['--color-primary-bg'] }),
      'Tertiary on secondary': (t) => ({ fg: t['--color-tertiary-bg'], bg: t['--color-secondary-bg'] }),
    },
  },
  {
    title: 'Text',
    description:
      'Text on each surface, core button text on the core colour (on primary and secondary), and mono button text on its fill.',
    kind: 'text',
    pairs: {
      'On primary': (t) => ({ fg: t['--color-text'], bg: t['--color-primary-bg'] }),
      'On secondary': (t) => ({ fg: t['--color-text'], bg: t['--color-secondary-bg'] }),
      'On tertiary': (t) => ({ fg: t['--color-text'], bg: t['--color-tertiary-bg'] }),
      'Core button': (t) => ({ fg: t['--color-core-on-primary-text'], bg: t['--color-core-main'] }),
      'Core button on secondary': (t) => ({ fg: t['--color-core-on-secondary-text'], bg: t['--color-core-main'] }),
      'Mono button': (t) => ({ fg: t['--color-button-mono-text'], bg: t['--color-button-mono-bg'] }),
    },
  },
  {
    title: 'Hover',
    description: 'The hover fill against the resting fill (left half resting, right half hovered).',
    kind: 'hover',
    pairs: {
      Core: (t) => ({ fg: t['--color-core-hover'], bg: t['--color-core-main'] }),
      Mono: (t) => ({ fg: t['--color-button-mono-hover'], bg: t['--color-button-mono-bg'] }),
      'On primary': (t) => ({ fg: t['--color-button-on-primary-hover'], bg: t['--color-button-on-primary-bg'] }),
      'On secondary': (t) => ({
        fg: t['--color-button-on-secondary-hover'],
        bg: t['--color-button-on-secondary-bg'],
      }),
      'Item on primary': (t) => ({ fg: t['--color-item-on-primary-hover'], bg: t['--color-primary-bg'] }),
      'Ghost card on primary': (t) => ({ fg: t['--color-card-ghost-on-primary-hover'], bg: t['--color-primary-bg'] }),
      'Item on secondary': (t) => ({ fg: t['--color-item-on-secondary-hover'], bg: t['--color-secondary-bg'] }),
      'Item on tertiary': (t) => ({ fg: t['--color-item-on-tertiary-hover'], bg: t['--color-tertiary-bg'] }),
      // The selected sidebar item, which should stay stronger than its hover
      'Item active on secondary': (t) => ({ fg: t['--color-item-on-secondary-active'], bg: t['--color-secondary-bg'] }),
    },
  },
  {
    title: 'Button borders',
    description: 'Each button border against its resting fill, then against its hover fill.',
    kind: 'border',
    pairs: {
      Core: (t) => ({ fg: t['--color-core-border'], bg: t['--color-core-main'] }),
      Mono: (t) => ({ fg: t['--color-button-mono-border'], bg: t['--color-button-mono-bg'] }),
      'On primary': (t) => ({ fg: t['--color-button-on-primary-border'], bg: t['--color-button-on-primary-bg'] }),
      'On secondary': (t) => ({
        fg: t['--color-button-on-secondary-border'],
        bg: t['--color-button-on-secondary-bg'],
      }),
      'Core hovered': (t) => ({ fg: t['--color-core-border'], bg: t['--color-core-hover'] }),
      'Mono hovered': (t) => ({ fg: t['--color-button-mono-border'], bg: t['--color-button-mono-hover'] }),
      'On primary hovered': (t) => ({
        fg: t['--color-button-on-primary-border'],
        bg: t['--color-button-on-primary-hover'],
      }),
      'On secondary hovered': (t) => ({
        fg: t['--color-button-on-secondary-border'],
        bg: t['--color-button-on-secondary-hover'],
      }),
    },
  },
  {
    title: 'Field focus borders',
    description: 'The focus border against the field background.',
    kind: 'focus',
    pairs: {
      'On primary': (t) => ({ fg: t['--color-field-on-primary-focus-border'], bg: t['--color-field-on-primary-bg'] }),
      'On secondary': (t) => ({
        fg: t['--color-field-on-secondary-focus-border'],
        bg: t['--color-field-on-secondary-bg'],
      }),
    },
  },
  {
    title: 'Checkboxes, radios and sliders',
    description:
      'The checked fill and unchecked border against the primary background (the tick is the background, so it reads as well as the fill), and the slider fill (core, shifted like the checked fill, shown on hover and focus) on each surface.',
    kind: 'ui',
    pairs: {
      Checked: (t) => ({ fg: t['--color-checkbox-on-primary-checked-bg'], bg: t['--color-primary-bg'] }),
      Unchecked: (t) => ({ fg: t['--color-checkbox-on-primary-border'], bg: t['--color-primary-bg'], outline: true }),
      'Slider on primary': (t) => ({ fg: t['--color-slider-on-primary-fill'], bg: t['--color-primary-bg'] }),
      'Slider on secondary': (t) => ({ fg: t['--color-slider-on-secondary-fill'], bg: t['--color-secondary-bg'] }),
    },
  },
  {
    title: 'Selected items in selects',
    description:
      'The selected item’s label in FormSelect and FormTheme popups (core, shifted to the item accent contrast against both), on the popup and on the highlighted row. The tick is the same colour.',
    kind: 'ui',
    swatchKind: 'text',
    pairs: {
      'On popup': (t) => ({ fg: t['--color-select-on-secondary-checked-text'], bg: t['--color-secondary-bg'] }),
      'On highlighted row': (t) => ({
        fg: t['--color-select-on-secondary-checked-text'],
        bg: t['--color-item-on-secondary-hover'],
      }),
    },
  },
  {
    title: 'Core accents',
    description:
      'Plain core as text, icons and marks on each surface: on primary (links, the playing track, favourites, the downloads link, the drop indicator) and its row hover, and on secondary (modal link hovers) and its hover. Reported only, with no guardrails, since a theme’s core is the user’s choice.',
    kind: 'focus',
    swatchKind: 'text',
    pairs: {
      'On primary': (t) => ({ fg: t['--color-core-main'], bg: t['--color-primary-bg'] }),
      'On primary hover': (t) => ({ fg: t['--color-core-main'], bg: t['--color-card-ghost-on-primary-hover'] }),
      'On secondary': (t) => ({ fg: t['--color-core-main'], bg: t['--color-secondary-bg'] }),
      'On secondary hover': (t) => ({ fg: t['--color-core-main'], bg: t['--color-item-on-secondary-hover'] }),
    },
  },
  {
    title: 'Active items',
    description:
      'Active control bar buttons, the current user menu item and the sidebar’s active link (core, shifted to the item accent contrast against every row state), on secondary, its hover and its active row, and in the full-page player on primary and its hover.',
    kind: 'ui',
    swatchKind: 'text',
    pairs: {
      'On secondary': (t) => ({ fg: t['--color-item-on-secondary-active-text'], bg: t['--color-secondary-bg'] }),
      'On secondary hover': (t) => ({
        fg: t['--color-item-on-secondary-active-text'],
        bg: t['--color-item-on-secondary-hover'],
      }),
      'On secondary active': (t) => ({
        fg: t['--color-item-on-secondary-active-text'],
        bg: t['--color-item-on-secondary-active'],
      }),
      'On primary': (t) => ({ fg: t['--color-item-on-primary-active-text'], bg: t['--color-primary-bg'] }),
      'On primary hover': (t) => ({
        fg: t['--color-item-on-primary-active-text'],
        bg: t['--color-item-on-primary-hover'],
      }),
    },
  },
  {
    title: 'Electron menu',
    description:
      'The Windows and Linux app menu on tertiary when logged in (on secondary when logged out, like other menus): item text on the menu and its row hover, plus section headings and plain labels.',
    kind: 'text',
    pairs: {
      'Text on hover': (t) => ({ fg: t['--color-text'], bg: t['--color-item-on-tertiary-hover'] }),
      Heading: (t) => ({ fg: over(t['--color-tertiary-bg'], t['--color-opacity-05']), bg: t['--color-tertiary-bg'] }),
      Label: (t) => ({ fg: over(t['--color-tertiary-bg'], t['--color-opacity-04']), bg: t['--color-tertiary-bg'] }),
    },
  },
  {
    title: 'Disabled',
    description:
      'Text on its fill, enabled then disabled. Not rated: a bigger drop means disabled looks more distinct.',
    kind: 'disabled',
    pairs: {
      'Field enabled': (t) => ({ fg: t['--color-text'], bg: t['--color-field-on-primary-bg'] }),
      // The whole field fades by the disabled opacity over primary
      'Field disabled': (t, opacityDisabled) => ({
        fg: over(t['--color-primary-bg'], t['--color-text'], opacityDisabled),
        bg: over(t['--color-primary-bg'], t['--color-field-on-primary-bg'], opacityDisabled),
      }),
      'On primary enabled': (t) => ({ fg: t['--color-button-on-primary-text'], bg: t['--color-button-on-primary-bg'] }),
      // Disabled-all onPrimary buttons use the disabled button colours for the text and fill
      'On primary disabled': (t) => {
        const fill = over(t['--color-primary-bg'], t['--color-button-disabled-bg']);
        return { fg: over(fill, t['--color-button-disabled-text']), bg: fill };
      },
      // Menus sit on the secondary background
      'Menu item enabled': (t) => ({ fg: t['--color-text'], bg: t['--color-secondary-bg'] }),
      'Menu item disabled': (t) => ({
        fg: over(t['--color-secondary-bg'], t['--color-disabled-text']),
        bg: t['--color-secondary-bg'],
      }),
      // Checkbox icons in disabled menu items fade further than the item's text
      'Menu checkbox disabled': (t) => ({
        fg: over(t['--color-secondary-bg'], t['--color-disabled-text'], Number(t['--opacity-disabled-icon'])),
        bg: t['--color-secondary-bg'],
      }),
      // The Electron menu sits on tertiary when logged in
      'Electron menu item enabled': (t) => ({ fg: t['--color-text'], bg: t['--color-tertiary-bg'] }),
      'Electron menu item disabled': (t) => ({
        fg: over(t['--color-tertiary-bg'], t['--color-disabled-text']),
        bg: t['--color-tertiary-bg'],
      }),
    },
  },
  {
    title: 'Other disabled opacities',
    description:
      'Disabled values chosen by eye rather than the shared disabled tokens, measured on the surface each sits on. Not rated.',
    kind: 'disabled',
    pairs: Object.fromEntries(Object.entries(otherDisabledOpacities).map(([name, { pair }]) => [name, pair])),
  },
];

// ======================================================================
// HTML
// ======================================================================

const escape = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const swatch = (kind: Kind, fg: string, bg: string, outline = false): string => {
  if (kind === 'text' || kind === 'disabled') {
    return `<span class="swatch" style="background:${bg};color:${fg}">Aa</span>`;
  }
  if (kind === 'hover' || kind === 'surface') {
    return `<span class="swatch" style="background:linear-gradient(90deg, ${bg} 50%, ${fg} 50%)"></span>`;
  }
  if (kind === 'ui') {
    const mark = outline ? `border:2px solid ${fg}` : `background:${fg}`;
    return `<span class="swatch" style="background:${bg}"><span class="mark" style="${mark}"></span></span>`;
  }
  return `<span class="swatch" style="background:${bg};border:2px solid ${fg}"></span>`;
};

// Every ratio in the report by contrast, group, theme and pair, for saving and comparing snapshots
const ratioKey = (...parts: string[]): string => parts.join(' | ');

const renderGroup = (group: Group, contrast: ColorContrast, ratios: Record<string, number>): string => {
  const head = Object.keys(group.pairs)
    .map((name) => `<th>${escape(name)}</th>`)
    .join('');

  const rows = devThemes
    .map((devTheme) => {
      const { tokens, isLightTheme } = getColorTokens(toInput(devTheme, contrast));
      const t = tokens as Record<string, string>;
      const opacityDisabled = Number(tokens['--opacity-disabled']);

      const cells = Object.entries(group.pairs)
        .map(([name, pair]) => {
          const { fg, bg, outline } = pair(t, opacityDisabled);
          const ratio = Number(chroma.contrast(fg, bg).toFixed(2));
          const key = ratioKey(contrast, group.title, devTheme.label, name);
          ratios[key] = ratio;

          // The comparison script fills the delta and marks changed cells
          return `<td class="${rate(group.kind, ratio, contrast)}" data-key="${escape(key)}" data-ratio="${ratio}" data-kind="${group.kind}">${swatch(group.swatchKind ?? group.kind, fg, bg, outline)}<span class="ratio">${ratio.toFixed(2)}</span><span class="delta"></span></td>`;
        })
        .join('');

      const tags = `<span class="tag">${isLightTheme ? 'Light' : 'Dark'}</span>`;

      return `<tr><th scope="row">${escape(devTheme.label)}${tags}</th>${cells}</tr>`;
    })
    .join('');

  return `
    <section>
      <h2>${escape(group.title)}</h2>
      <p>${escape(group.description)}</p>
      <div class="scroll"><table><thead><tr><th>Theme</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>
    </section>`;
};

const legendRow = (kind: Kind, label: string, basis: string): string => {
  const band = bands[kind]!;
  return `<tr><th scope="row">${label}</th><td class="good">${band[0]} and above</td><td class="ok">${band[1]}–${band[0]}</td><td class="poor">Below ${band[1]}</td><td>${basis}</td></tr>`;
};

// Renders every contrast level's tables, recording each ratio into `ratios`
const renderPanels = (ratios: Record<string, number>): string =>
  contrasts
    .map(
      (contrast, index) =>
        `<div class="panel" role="tabpanel" id="${contrast}"${index === 0 ? '' : ' hidden'}>${groups.map((group) => renderGroup(group, contrast, ratios)).join('')}</div>`
    )
    .join('');

const renderReport = (panels: string, snapshots: Record<string, Snapshot>): string => {
  const tabs = contrasts
    .map(
      (contrast, index) =>
        `<button type="button" role="tab" aria-selected="${index === 0}" data-panel="${contrast}">${contrast[0].toUpperCase()}${contrast.slice(1)} contrast <span class="count" data-count="${contrast}"></span></button>`
    )
    .join('');

  // Snapshots arrive original first, then baselines newest first
  const [latest, ...earlier] = Object.keys(snapshots).filter((id) => id !== 'original');
  const button = (id: string | undefined, label: string) =>
    `<button type="button" data-compare="${id ?? ''}"${id ? '' : ' disabled'}>${label}</button>`;
  const compareOptions =
    button(snapshots.original && 'original', 'Original') +
    button(latest, 'Latest baseline') +
    (earlier.length
      ? `<select data-compare-select aria-label="Earlier baselines"><option value="">Earlier baselines</option>${earlier
          .map((id) => `<option value="${id}">${escape(snapshotLabel(id, snapshots[id]))}</option>`)
          .join('')}</select>`
      : '') +
    button('nothing', 'Nothing');

  // Compares with the latest baseline by default, falling back to the original
  const initialCompare = latest ?? (snapshots.original ? 'original' : 'nothing');

  // Escapes `<` so the embedded JSON can't close the script tag
  const embedded = Object.fromEntries(
    Object.entries(snapshots).map(([id, snapshot]) => [
      id,
      { label: snapshotLabel(id, snapshot), ratios: snapshot.ratios },
    ])
  );
  const snapshotJson = JSON.stringify(embedded).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Colour Audit</title>
<style>
  :root {
    --page: #f7f7f8; --surface: #ffffff; --line: #e2e2e6; --ink: #1c1c22; --muted: #6b6b76;
    --good: #d9f2df; --good-ink: #14532d; --ok: #fdf0c8; --ok-ink: #713f12; --poor: #fbd5d5; --poor-ink: #7f1d1d;
    --drop: #dc2626;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --page: #141418; --surface: #1d1d23; --line: #2e2e36; --ink: #ececf1; --muted: #9a9aa6;
      --good: #173d24; --good-ink: #bbf7d0; --ok: #43360f; --ok-ink: #fde68a; --poor: #4a1a1a; --poor-ink: #fecaca;
      --drop: #f87171;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 20px 16px 48px; background: var(--page); color: var(--ink); font: 12px/1.4 system-ui, sans-serif; }
  h1 { margin: 0 0 4px; font-size: 20px; }
  h2 { margin: 0 0 2px; font-size: 15px; }
  p { margin: 0 0 8px; color: var(--muted); }
  section, .legend { margin-top: 20px; }
  .scroll { overflow-x: auto; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 4px 8px; border-bottom: 1px solid var(--line); text-align: left; white-space: nowrap; }
  thead th { font-size: 11px; color: var(--muted); font-weight: 600; }
  tbody tr:last-child > * { border-bottom: 0; }
  tbody th { font-weight: 500; }
  td.good { background: var(--good); color: var(--good-ink); }
  td.ok { background: var(--ok); color: var(--ok-ink); }
  td.poor { background: var(--poor); color: var(--poor-ink); font-weight: 600; }
  .drops-only td[data-key]:not(.down) { opacity: 0.2; }
  .delta { margin-left: 6px; font-size: 11px; font-weight: 600; }
  .delta:not(:empty) { padding: 0 6px; border: 1px solid currentColor; border-radius: 999px; }
  .delta.good { background: var(--good); color: var(--good-ink); }
  .delta.ok { background: var(--ok); color: var(--ok-ink); }
  .delta.poor { background: var(--poor); color: var(--poor-ink); }
  .delta.none { background: var(--surface); color: var(--muted); }
  .down .delta { border: 2px solid var(--drop); }
  .count { margin-left: 4px; font-size: 11px; }
  .ups { opacity: 0.7; }
  .drops { color: var(--drop); font-weight: 600; }
  .swatch { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 18px; margin-right: 6px; border-radius: 4px; font-weight: 600; vertical-align: middle; box-shadow: 0 0 0 1px rgba(127,127,127,0.25); }
  .mark { box-sizing: border-box; width: 10px; height: 10px; border-radius: 2px; }
  .ratio { font-variant-numeric: tabular-nums; }
  .tag { display: inline-block; margin-left: 6px; padding: 0 5px; border: 1px solid var(--line); border-radius: 999px; font-size: 10px; color: var(--muted); }
  .bar { position: sticky; top: 0; z-index: 1; display: flex; flex-wrap: wrap; gap: 8px 20px; align-items: center; padding: 8px 0; background: var(--page); }
  .compare { display: flex; gap: 6px; align-items: center; color: var(--muted); }
  .compare button { padding: 3px 9px; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); color: var(--ink); font: inherit; cursor: pointer; }
  .compare button[aria-pressed='true'] { background: var(--ink); border-color: var(--ink); color: var(--page); }
  .compare button:disabled { opacity: 0.4; cursor: default; }
  .compare select { padding: 3px 6px; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); color: var(--ink); font: inherit; }
  .compare select.active { background: var(--ink); border-color: var(--ink); color: var(--page); }
  .drops-toggle { display: flex; gap: 4px; align-items: center; color: var(--muted); }
  .tabs button { margin-right: 4px; padding: 4px 10px; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); color: var(--ink); font: inherit; cursor: pointer; }
  .tabs button[aria-selected='true'] { background: var(--ink); border-color: var(--ink); color: var(--page); }
</style>
</head>
<body>
<main>
  <h1>Colour Audit</h1>
  <p>WCAG contrast ratios for key colour pairs from <code>getColorTokens</code>, for every dev theme. 1 means identical colours, 21 is black on white. Generated ${new Date().toLocaleString('en-GB')}.</p>
  <p id="compare-note"></p>

  <div class="legend">
    <h2>Ratings</h2>
    <div class="scroll"><table>
      <thead><tr><th>Pair</th><th>Good</th><th>OK</th><th>Poor</th><th>Basis</th></tr></thead>
      <tbody>
        ${legendRow('surface', 'Surfaces', 'Suggestion, no WCAG target; below 1.05 is indistinguishable')}
        ${legendRow('text', 'Text', 'WCAG: 4.5 for normal text, 3 for large text')}
        <tr><th scope="row">Hover</th><td class="good">The target and above</td><td class="ok">Up to 0.05 below</td><td class="poor">More than 0.05 below</td><td>Targets of ${hoverTargets.default}, ${hoverTargets.medium} and ${hoverTargets.high} by contrast level; no WCAG target</td></tr>
        ${legendRow('border', 'Borders', 'Suggestion, no WCAG target; below 1.05 is invisible')}
        <tr><th scope="row">Focus borders, selected select items and core accents</th><td class="good">The target and above</td><td class="ok">Up to 1 below</td><td class="poor">More than 1 below</td><td>Targets of ${focusTargets.default}, ${focusTargets.medium} and ${focusTargets.high} by contrast level; WCAG asks for 3 for UI parts</td></tr>
        ${legendRow('ui', 'Checkboxes, radios and sliders', 'WCAG: 3 for UI parts')}
        <tr><th scope="row">Disabled</th><td colspan="3">Not rated</td><td>Compare enabled against disabled</td></tr>
      </tbody>
    </table></div>
  </div>

  <div class="bar">
    <div class="tabs" role="tablist">${tabs}</div>
    <div class="compare" role="group" aria-label="Compare with">Compare with ${compareOptions}</div>
    <label class="drops-toggle"><input type="checkbox" data-drops-only> Show drops only</label>
  </div>
  ${panels}
</main>
<script>
  const snapshots = ${snapshotJson};
  const changeThreshold = ${changeThreshold};
  // Good and OK minimums by contrast level and kind, from the same rules as the tables
  const bandsByContrast = ${JSON.stringify(bandsByContrast)};

  // Matches the report's good, OK and poor ratings, so each previous value can show its own rating
  const rate = (kind, ratio, contrast) => {
    const band = bandsByContrast[contrast][kind];
    if (!band) return 'none';
    return ratio >= band[0] ? 'good' : ratio >= band[1] ? 'ok' : 'poor';
  };

  document.querySelectorAll('.tabs button').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tabs button').forEach((other) => other.setAttribute('aria-selected', other === tab));
      document.querySelectorAll('.panel').forEach((panel) => (panel.hidden = panel.id !== tab.dataset.panel));
    });
  });

  const ratings = ['poor', 'ok', 'good'];
  const select = document.querySelector('[data-compare-select]');

  // Marks each ratio that differs from the chosen snapshot with a pill showing its previous value, plus per-tab
  // counts. Drop pills have a red border, and a ⚠ when they lower the rating
  const compare = (id) => {
    const snapshot = snapshots[id];
    // Up, down and worse counts per contrast panel, plus a total under 'all'
    const counts = {};
    const countFor = (key) => (counts[key] = counts[key] || { up: 0, down: 0, worse: 0 });
    const summary = ({ up, down, worse }) =>
      '<span class="ups">↑' + up + '</span> <span class="drops">↓' + down + (worse ? ' ⚠️' + worse : '') + '</span>';

    document.querySelectorAll('td[data-key]').forEach((cell) => {
      const previous = snapshot ? snapshot.ratios[cell.dataset.key] : undefined;
      const ratio = Number(cell.dataset.ratio);
      const panel = cell.closest('.panel').id;
      const hasChanged = previous !== undefined && Math.abs(ratio - previous) >= changeThreshold;
      const isDown = hasChanged && ratio < previous;
      const previousRating = hasChanged ? rate(cell.dataset.kind, previous, panel) : '';
      const isWorse = isDown && ratings.indexOf(rate(cell.dataset.kind, ratio, panel)) < ratings.indexOf(previousRating);
      cell.classList.toggle('down', isDown);
      // A pill with the previous value, coloured by its own rating. Ratios missing from the snapshot (e.g. a dev
      // theme added since) are marked new rather than unchanged
      const delta = cell.querySelector('.delta');
      delta.className = 'delta' + (hasChanged ? ' ' + previousRating : snapshot && previous === undefined ? ' none' : '');
      delta.textContent = hasChanged
        ? (isWorse ? '⚠️ ' : '') + (isDown ? '↓' : '↑') + ' from ' + previous.toFixed(2)
        : snapshot && previous === undefined
          ? 'new'
          : '';
      if (hasChanged) {
        for (const key of [panel, 'all']) {
          const count = countFor(key);
          count[isDown ? 'down' : 'up']++;
          if (isWorse) count.worse++;
        }
      }
    });

    document.querySelectorAll('[data-count]').forEach((count) => {
      count.innerHTML = snapshot ? summary(countFor(count.dataset.count)) : '';
    });
    document.querySelectorAll('[data-compare]').forEach((button) => {
      button.setAttribute('aria-pressed', button.dataset.compare === id);
    });
    if (select) {
      select.value = select.querySelector('option[value="' + id + '"]') ? id : '';
      select.classList.toggle('active', !!select.value);
    }
    const note = document.getElementById('compare-note');
    note.textContent = snapshot
      ? 'Compared with ' + snapshot.label + ': '
      : Object.keys(snapshots).length
        ? 'Not comparing.'
        : 'Not comparing. Save a baseline with npm run test:colors:baseline, then pick it above.';
    if (snapshot) {
      note.insertAdjacentHTML('beforeend', summary(countFor('all')) + ' ratios changed, each marked with its previous value. Drops are red, and ⚠️ marks a lower rating.');
    }
  };

  document.querySelectorAll('[data-compare]').forEach((button) => {
    button.addEventListener('click', () => compare(button.dataset.compare));
  });
  select?.addEventListener('change', () => compare(select.value || '${initialCompare}'));
  document.querySelector('[data-drops-only]').addEventListener('change', (event) => {
    document.body.classList.toggle('drops-only', event.target.checked);
  });
  compare('${initialCompare}');
</script>
</body>
</html>
`;
};

// ======================================================================
// TEST
// ======================================================================

describe('Colour contrast audit', () => {
  test.runIf(process.env.COLORS_REPORT)('Writes the HTML report for every dev theme at each contrast level', () => {
    const ratios: Record<string, number> = {};
    const panels = renderPanels(ratios);

    if (saveAs) saveSnapshot(saveAs, ratios);
    const html = renderReport(panels, readSnapshots());

    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, html);

    expect(html).toContain(devThemes[0].label);
  });
});

// ======================================================================
// GUARDRAILS
// ======================================================================

// Minimum ratios every dev theme must meet at each contrast level, skipping themes limited by their own colours. `min`
// can depend on the tokens and contrast level, e.g. when a target can't be reached with the theme's colours
type GuardrailTarget = (t: Record<string, string>, contrast: ColorContrast) => number;
type GuardrailMin = number | GuardrailTarget;

// A focus border reaches its target, or matches the text colour when the field background is too close to it
const focusMin =
  (surface: string): GuardrailTarget =>
  (t, contrast) =>
    Math.min(focusTargets[contrast], chroma.contrast(t['--color-text'], t[`--color-field-on-${surface}-bg`]));

// A hover reaches its target, or matches its surface's border when the border is too close to the fill
const hoverMin =
  (fill: string, border: string): GuardrailTarget =>
  (t, contrast) =>
    Math.min(hoverTargets[contrast], chroma.contrast(t[border], t[fill]));

// Core's hover reaches the hover target, or as far as core can shift towards black or white (not at all when it's
// already there)
const coreHoverMin: GuardrailTarget = (t, contrast) => {
  const core = t['--color-core-main'];
  const hover = t['--color-core-hover'];
  if (hover === core) return 1;
  const furthest = chroma(hover).luminance() > chroma(core).luminance() ? '#ffffff' : '#000000';
  return Math.min(hoverTargets[contrast], chroma.contrast(core, furthest));
};

// Core button text reaches its target, or is the better of the background and the text colour when neither can. Higher
// levels' targets only apply when the text colour reaches them, otherwise the default target does
const coreTextMin =
  (background: string): GuardrailTarget =>
  (t, contrast) =>
    Math.min(
      chroma.contrast(t['--color-text'], t['--color-core-main']) >= contrastLevels[contrast].coreTextContrast
        ? contrastLevels[contrast].coreTextContrast
        : contrastLevels.default.coreTextContrast,
      Math.max(
        chroma.contrast(t[background], t['--color-core-main']),
        chroma.contrast(t['--color-text'], t['--color-core-main'])
      )
    );

// Shifted core reaches its target (the focus target for checked and slider fills, the item accent target for selected
// select items and active items), or is the better of core and the text colour when neither can
const shiftedCoreMin =
  (background: string, targets = focusTargets): GuardrailTarget =>
  (t, contrast) =>
    Math.min(
      targets[contrast],
      Math.max(
        chroma.contrast(t['--color-core-main'], t[background]),
        chroma.contrast(t['--color-text'], t[background])
      )
    );

const guardrails: { name: string; min: GuardrailMin; fg: string; bg: string }[] = [
  {
    name: 'Core button text on primary',
    min: coreTextMin('--color-primary-bg'),
    fg: '--color-core-on-primary-text',
    bg: '--color-core-main',
  },
  {
    name: 'Core button text on secondary',
    min: coreTextMin('--color-secondary-bg'),
    fg: '--color-core-on-secondary-text',
    bg: '--color-core-main',
  },
  { name: 'Core border on fill', min: 1.05, fg: '--color-core-border', bg: '--color-core-main' },
  { name: 'Core border on hover', min: 1.05, fg: '--color-core-border', bg: '--color-core-hover' },
  {
    name: 'Core hover on fill',
    min: coreHoverMin,
    fg: '--color-core-hover',
    bg: '--color-core-main',
  },
  { name: 'Mono border on fill', min: 1.05, fg: '--color-button-mono-border', bg: '--color-button-mono-bg' },
  { name: 'Mono border on hover', min: 1.05, fg: '--color-button-mono-border', bg: '--color-button-mono-hover' },
  { name: 'Mono hover on fill', min: 1.05, fg: '--color-button-mono-hover', bg: '--color-button-mono-bg' },
  {
    name: 'Button on primary hover on fill',
    min: hoverMin('--color-secondary-bg', '--color-secondary-border'),
    fg: '--color-button-on-primary-hover',
    bg: '--color-button-on-primary-bg',
  },
  {
    name: 'Button on secondary hover on fill',
    min: hoverMin('--color-tertiary-bg', '--color-tertiary-border'),
    fg: '--color-button-on-secondary-hover',
    bg: '--color-button-on-secondary-bg',
  },
  {
    name: 'Item on secondary hover',
    min: hoverMin('--color-secondary-bg', '--color-secondary-border'),
    fg: '--color-item-on-secondary-hover',
    bg: '--color-secondary-bg',
  },
  {
    name: 'Item on tertiary hover',
    min: hoverMin('--color-tertiary-bg', '--color-tertiary-border'),
    fg: '--color-item-on-tertiary-hover',
    bg: '--color-tertiary-bg',
  },
  // The selected sidebar item stays distinct from a hovered one
  {
    name: 'Item on secondary active on hover',
    min: 1.05,
    fg: '--color-item-on-secondary-active',
    bg: '--color-item-on-secondary-hover',
  },
  {
    name: 'Button on primary border on hover',
    min: 1.05,
    fg: '--color-button-on-primary-border',
    bg: '--color-button-on-primary-hover',
  },
  {
    name: 'Button on secondary border on hover',
    min: 1.05,
    fg: '--color-button-on-secondary-border',
    bg: '--color-button-on-secondary-hover',
  },
  {
    name: 'Checked checkbox fill',
    min: shiftedCoreMin('--color-primary-bg'),
    fg: '--color-checkbox-on-primary-checked-bg',
    bg: '--color-primary-bg',
  },
  {
    name: 'Slider fill on primary',
    min: shiftedCoreMin('--color-primary-bg'),
    fg: '--color-slider-on-primary-fill',
    bg: '--color-primary-bg',
  },
  {
    name: 'Slider fill on secondary',
    min: shiftedCoreMin('--color-secondary-bg'),
    fg: '--color-slider-on-secondary-fill',
    bg: '--color-secondary-bg',
  },
  {
    name: 'Selected select item on popup',
    min: shiftedCoreMin('--color-secondary-bg', itemAccentTargets),
    fg: '--color-select-on-secondary-checked-text',
    bg: '--color-secondary-bg',
  },
  {
    name: 'Selected select item on highlighted row',
    min: shiftedCoreMin('--color-item-on-secondary-hover', itemAccentTargets),
    fg: '--color-select-on-secondary-checked-text',
    bg: '--color-item-on-secondary-hover',
  },
  {
    name: 'Active item on secondary',
    min: shiftedCoreMin('--color-secondary-bg', itemAccentTargets),
    fg: '--color-item-on-secondary-active-text',
    bg: '--color-secondary-bg',
  },
  {
    name: 'Active item on secondary hover',
    min: shiftedCoreMin('--color-item-on-secondary-hover', itemAccentTargets),
    fg: '--color-item-on-secondary-active-text',
    bg: '--color-item-on-secondary-hover',
  },
  {
    name: 'Active item on secondary active row',
    min: shiftedCoreMin('--color-item-on-secondary-active', itemAccentTargets),
    fg: '--color-item-on-secondary-active-text',
    bg: '--color-item-on-secondary-active',
  },
  {
    name: 'Active item on primary',
    min: shiftedCoreMin('--color-primary-bg', itemAccentTargets),
    fg: '--color-item-on-primary-active-text',
    bg: '--color-primary-bg',
  },
  {
    name: 'Active item on primary hover',
    min: shiftedCoreMin('--color-item-on-primary-hover', itemAccentTargets),
    fg: '--color-item-on-primary-active-text',
    bg: '--color-item-on-primary-hover',
  },
  {
    name: 'Field focus border on primary',
    min: focusMin('primary'),
    fg: '--color-field-on-primary-focus-border',
    bg: '--color-field-on-primary-bg',
  },
  {
    name: 'Field focus border on secondary',
    min: focusMin('secondary'),
    fg: '--color-field-on-secondary-focus-border',
    bg: '--color-field-on-secondary-bg',
  },
];

describe('Colour guardrails', () => {
  for (const guardrail of guardrails) {
    const title = typeof guardrail.min === 'number' ? `is at least ${guardrail.min}` : 'reaches its target';
    test(`${guardrail.name} ${title}`, () => {
      for (const contrast of contrasts) {
        for (const devTheme of devThemes) {
          const t = getColorTokens(toInput(devTheme, contrast)).tokens as Record<string, string>;
          if (chroma.contrast(t['--color-text'], t['--color-primary-bg']) < limitedThemeRatio) continue;

          const min = typeof guardrail.min === 'number' ? guardrail.min : guardrail.min(t, contrast);
          const ratio = chroma.contrast(t[guardrail.fg], t[guardrail.bg]);
          expect(ratio, `${devTheme.label} at ${contrast} contrast`).toBeGreaterThanOrEqual(min);
        }
      }
    });
  }

  test('Core text makes the same choice on both surfaces unless the text colour cannot beat both', () => {
    for (const contrast of contrasts) {
      for (const devTheme of devThemes) {
        const t = getColorTokens(toInput(devTheme, contrast)).tokens as Record<string, string>;
        if (chroma.contrast(t['--color-text'], t['--color-primary-bg']) < limitedThemeRatio) continue;

        const onCore = (color: string) => chroma.contrast(color, t['--color-core-main']);
        const textBeatsBoth =
          onCore(t['--color-text']) > onCore(t['--color-primary-bg']) &&
          onCore(t['--color-text']) > onCore(t['--color-secondary-bg']);
        if (!textBeatsBoth) continue;

        const isText = (token: string) => t[token] === t['--color-text'];
        expect(isText('--color-core-on-primary-text'), `${devTheme.label} at ${contrast} contrast`).toBe(
          isText('--color-core-on-secondary-text')
        );
      }
    }
  });
});

describe('Disabled states', () => {
  test('Other disabled opacities still match their stylesheets', () => {
    const collapse = (value: string) => value.replace(/\s+/g, ' ');
    for (const [name, { file, snippet }] of Object.entries(otherDisabledOpacities)) {
      const source = collapse(fs.readFileSync(path.resolve('src/js', file), 'utf8'));
      expect(source.includes(snippet), `${name}: "${snippet}" in ${file}`).toBe(true);
    }
  });
});
