// Tests generated using AI

// Writes an HTML report of WCAG contrast ratios for key token pairs across every dev theme and contrast level.
// Run on its own with `npm run test:colors`, which opens the report in the browser. `npm run test:colors:baseline`
// saves the current ratios as a baseline, and later reports show each change from it. The guardrails at the end
// enforce minimum ratios, and run with the normal tests

import fs from 'node:fs';
import path from 'node:path';

import chroma from 'chroma-js';
import clsx from 'clsx';

import { devThemes } from 'js/_config/devThemes';
import { themes } from 'js/_config/themes';

import getColorTokens, { ColorContrast, ColorTokensInput } from './getColorTokens';

// ======================================================================
// SETUP
// ======================================================================

const reportPath = path.resolve('test-results/colors/audit.html');
const baselinePath = path.resolve('test-results/colors/baseline.json');
const shouldSaveBaseline = process.env.COLORS_BASELINE === '1';

interface Baseline {
  savedAt: string;
  ratios: Record<string, number>;
}

const readBaseline = (): Baseline | null => {
  try {
    return JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  } catch {
    return null;
  }
};

// Ratios below this difference from the baseline are treated as unchanged
const changeThreshold = 0.005;

const contrasts: ColorContrast[] = ['default', 'medium', 'high'];

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

type Kind = 'text' | 'focus' | 'border' | 'hover' | 'disabled';
type Rating = 'good' | 'ok' | 'poor' | 'none';

// fg is the text, border or hover colour; bg is the surface or resting fill it sits on
type Pair = (t: Record<string, string>, opacityDisabled: number) => { fg: string; bg: string };

interface Group {
  title: string;
  description: string;
  kind: Kind;
  pairs: Record<string, Pair>;
}

// Good and OK minimums per kind; text and focus follow WCAG, border and hover are suggestions
const bands: Record<Kind, [number, number] | null> = {
  text: [4.5, 3],
  focus: [3, 2],
  border: [1.15, 1.05],
  hover: [1.2, 1.1],
  disabled: null,
};

const rate = (kind: Kind, ratio: number): Rating => {
  const band = bands[kind];
  if (!band) return 'none';
  return ratio >= band[0] ? 'good' : ratio >= band[1] ? 'ok' : 'poor';
};

const groups: Group[] = [
  {
    title: 'Text',
    description: 'Text on each surface, and core button text on the core colour.',
    kind: 'text',
    pairs: {
      'On primary': (t) => ({ fg: t['--color-text'], bg: t['--color-primary-bg'] }),
      'On secondary': (t) => ({ fg: t['--color-text'], bg: t['--color-secondary-bg'] }),
      'On tertiary': (t) => ({ fg: t['--color-text'], bg: t['--color-tertiary-bg'] }),
      'Core button': (t) => ({ fg: t['--color-core-on-primary-text'], bg: t['--color-core-main'] }),
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
      // Disabled-all onPrimary buttons use opacity colour tokens for the text and fill
      'On primary disabled': (t) => {
        const fill = over(t['--color-primary-bg'], t['--color-opacity-005']);
        return { fg: over(fill, t['--color-opacity-03']), bg: fill };
      },
    },
  },
];

// ======================================================================
// HTML
// ======================================================================

const escape = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const swatch = (kind: Kind, fg: string, bg: string): string => {
  if (kind === 'text' || kind === 'disabled') {
    return `<span class="swatch" style="background:${bg};color:${fg}">Aa</span>`;
  }
  if (kind === 'hover') {
    return `<span class="swatch" style="background:linear-gradient(90deg, ${bg} 50%, ${fg} 50%)"></span>`;
  }
  return `<span class="swatch" style="background:${bg};border:2px solid ${fg}"></span>`;
};

// Every ratio in the report by contrast, group, theme and pair, for saving and comparing baselines
const ratioKey = (...parts: string[]): string => parts.join(' | ');

const renderGroup = (
  group: Group,
  contrast: ColorContrast,
  ratios: Record<string, number>,
  baseline: Baseline | null
): { html: string; changed: number } => {
  let changed = 0;

  const head = Object.keys(group.pairs)
    .map((name) => `<th>${escape(name)}</th>`)
    .join('');

  const rows = devThemes
    .map((devTheme) => {
      const { tokens, isLightTheme } = getColorTokens(toInput(devTheme, contrast));
      const t = tokens as Record<string, string>;
      const opacityDisabled = Number(tokens['--opacity-04']);
      const isLimited = chroma.contrast(t['--color-text'], t['--color-primary-bg']) < limitedThemeRatio;

      const cells = Object.entries(group.pairs)
        .map(([name, pair]) => {
          const { fg, bg } = pair(t, opacityDisabled);
          const ratio = Number(chroma.contrast(fg, bg).toFixed(2));
          const key = ratioKey(contrast, group.title, devTheme.label, name);
          ratios[key] = ratio;

          const previous = baseline?.ratios[key];
          const hasChanged = previous !== undefined && Math.abs(ratio - previous) >= changeThreshold;
          if (hasChanged) changed++;
          const delta = hasChanged
            ? `<span class="delta">${ratio > previous ? '↑' : '↓'} from ${previous.toFixed(2)}</span>`
            : '';

          return `<td class="${clsx(rate(group.kind, ratio), hasChanged && 'changed')}">${swatch(group.kind, fg, bg)}<span class="ratio">${ratio.toFixed(2)}</span>${delta}</td>`;
        })
        .join('');

      const tags = `<span class="tag">${isLightTheme ? 'Light' : 'Dark'}</span>${
        isLimited ? '<span class="tag limited-tag">Limited by the theme’s colours</span>' : ''
      }`;

      return `<tr class="${isLimited ? 'limited' : ''}"><th scope="row">${escape(devTheme.label)}${tags}</th>${cells}</tr>`;
    })
    .join('');

  const html = `
    <section>
      <h2>${escape(group.title)}</h2>
      <p>${escape(group.description)}</p>
      <div class="scroll"><table><thead><tr><th>Theme</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>
    </section>`;

  return { html, changed };
};

const legendRow = (kind: Kind, label: string, basis: string): string => {
  const band = bands[kind]!;
  return `<tr><th scope="row">${label}</th><td class="good">${band[0]} and above</td><td class="ok">${band[1]}–${band[0]}</td><td class="poor">Below ${band[1]}</td><td>${basis}</td></tr>`;
};

const renderReport = (ratios: Record<string, number>, baseline: Baseline | null): string => {
  const rendered = contrasts.map((contrast) => {
    const sections = groups.map((group) => renderGroup(group, contrast, ratios, baseline));
    return {
      contrast,
      html: sections.map((section) => section.html).join(''),
      changed: sections.reduce((total, section) => total + section.changed, 0),
    };
  });

  const tabs = rendered
    .map(
      ({ contrast, changed }, index) =>
        `<button type="button" role="tab" aria-selected="${index === 0}" data-panel="${contrast}">${contrast[0].toUpperCase()}${contrast.slice(1)} contrast${baseline ? ` <span class="count">${changed} changed</span>` : ''}</button>`
    )
    .join('');

  const panels = rendered
    .map(
      ({ contrast, html }, index) =>
        `<div class="panel" role="tabpanel" id="${contrast}"${index === 0 ? '' : ' hidden'}>${html}</div>`
    )
    .join('');

  const totalChanged = rendered.reduce((total, { changed }) => total + changed, 0);
  const baselineNote = baseline
    ? `Compared with the baseline saved ${new Date(baseline.savedAt).toLocaleString('en-GB')}: ${totalChanged} ratios changed, outlined with their previous value.`
    : 'No baseline saved. Run <code>npm run test:colors:baseline</code> to save the current ratios, and later reports will show each change from them.';

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
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --page: #141418; --surface: #1d1d23; --line: #2e2e36; --ink: #ececf1; --muted: #9a9aa6;
      --good: #173d24; --good-ink: #bbf7d0; --ok: #43360f; --ok-ink: #fde68a; --poor: #4a1a1a; --poor-ink: #fecaca;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 32px 16px 64px; background: var(--page); color: var(--ink); font: 14px/1.5 system-ui, sans-serif; }
  main { max-width: 1400px; margin: 0 auto; }
  h1 { margin: 0 0 4px; font-size: 24px; }
  h2 { margin: 0 0 2px; font-size: 17px; }
  p { margin: 0 0 12px; color: var(--muted); }
  section, .legend { margin-top: 28px; }
  .scroll { overflow-x: auto; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px 10px; border-bottom: 1px solid var(--line); text-align: left; white-space: nowrap; }
  thead th { font-size: 12px; color: var(--muted); font-weight: 600; }
  tbody tr:last-child > * { border-bottom: 0; }
  tbody th { font-weight: 500; }
  td.good { background: var(--good); color: var(--good-ink); }
  td.ok { background: var(--ok); color: var(--ok-ink); }
  td.poor { background: var(--poor); color: var(--poor-ink); font-weight: 600; }
  td.changed { outline: 2px solid var(--ink); outline-offset: -2px; }
  .delta { margin-left: 8px; font-size: 12px; font-weight: 600; }
  .count { margin-left: 4px; font-size: 12px; opacity: 0.7; }
  tr.limited td { background: transparent; color: var(--muted); font-weight: 400; }
  .swatch { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 22px; margin-right: 8px; border-radius: 5px; font-weight: 600; vertical-align: middle; box-shadow: 0 0 0 1px rgba(127,127,127,0.25); }
  .ratio { font-variant-numeric: tabular-nums; }
  .tag { display: inline-block; margin-left: 8px; padding: 0 6px; border: 1px solid var(--line); border-radius: 999px; font-size: 11px; color: var(--muted); }
  .limited-tag { border-style: dashed; }
  .tabs { position: sticky; top: 0; z-index: 1; padding: 12px 0; background: var(--page); }
  .tabs button { margin-right: 6px; padding: 6px 14px; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); color: var(--ink); font: inherit; cursor: pointer; }
  .tabs button[aria-selected='true'] { background: var(--ink); border-color: var(--ink); color: var(--page); }
</style>
</head>
<body>
<main>
  <h1>Colour Audit</h1>
  <p>WCAG contrast ratios for key colour pairs from <code>getColorTokens</code>, for every dev theme. 1 means identical colours, 21 is black on white. Generated ${new Date().toLocaleString('en-GB')}.</p>
  <p>${baselineNote}</p>

  <div class="legend">
    <h2>Ratings</h2>
    <p>Rows marked “Limited by the theme’s colours” have text below ${limitedThemeRatio} on their own background, so the UI can’t fully fix them. Their ratings are greyed out.</p>
    <div class="scroll"><table>
      <thead><tr><th>Pair</th><th>Good</th><th>OK</th><th>Poor</th><th>Basis</th></tr></thead>
      <tbody>
        ${legendRow('text', 'Text', 'WCAG: 4.5 for normal text, 3 for large text')}
        ${legendRow('focus', 'Focus borders', 'WCAG: 3 for UI parts')}
        ${legendRow('hover', 'Hover', 'Suggestion, no WCAG target')}
        ${legendRow('border', 'Borders', 'Suggestion, no WCAG target; below 1.05 is invisible')}
        <tr><th scope="row">Disabled</th><td colspan="3">Not rated</td><td>Compare enabled against disabled</td></tr>
      </tbody>
    </table></div>
  </div>

  <div class="tabs" role="tablist">${tabs}</div>
  ${panels}
</main>
<script>
  document.querySelectorAll('.tabs button').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tabs button').forEach((other) => other.setAttribute('aria-selected', other === tab));
      document.querySelectorAll('.panel').forEach((panel) => (panel.hidden = panel.id !== tab.dataset.panel));
    });
  });
</script>
</body>
</html>
`;
};

// ======================================================================
// TEST
// ======================================================================

describe('Colour contrast audit', () => {
  test('Writes the HTML report for every dev theme at each contrast level', () => {
    const ratios: Record<string, number> = {};
    const baseline = shouldSaveBaseline ? null : readBaseline();
    const html = renderReport(ratios, baseline);

    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, html);

    if (shouldSaveBaseline) {
      fs.writeFileSync(baselinePath, JSON.stringify({ savedAt: new Date().toISOString(), ratios }, null, 2));
    }

    expect(html).toContain(devThemes[0].label);
  });
});

// ======================================================================
// GUARDRAILS
// ======================================================================

// Minimum ratios every dev theme must meet at each contrast level, skipping themes limited by their own colours
const guardrails: { name: string; min: number; fg: string; bg: string }[] = [
  { name: 'Core border on fill', min: 1.05, fg: '--color-core-border', bg: '--color-core-main' },
  { name: 'Core border on hover', min: 1.05, fg: '--color-core-border', bg: '--color-core-hover' },
  { name: 'Mono border on fill', min: 1.05, fg: '--color-button-mono-border', bg: '--color-button-mono-bg' },
  { name: 'Mono border on hover', min: 1.05, fg: '--color-button-mono-border', bg: '--color-button-mono-hover' },
  { name: 'Mono hover on fill', min: 1.05, fg: '--color-button-mono-hover', bg: '--color-button-mono-bg' },
];

describe('Colour guardrails', () => {
  for (const guardrail of guardrails) {
    test(`${guardrail.name} is at least ${guardrail.min}`, () => {
      for (const contrast of contrasts) {
        for (const devTheme of devThemes) {
          const t = getColorTokens(toInput(devTheme, contrast)).tokens as Record<string, string>;
          if (chroma.contrast(t['--color-text'], t['--color-primary-bg']) < limitedThemeRatio) continue;

          const ratio = chroma.contrast(t[guardrail.fg], t[guardrail.bg]);
          expect(ratio, `${devTheme.label} at ${contrast} contrast`).toBeGreaterThanOrEqual(guardrail.min);
        }
      }
    });
  }
});
