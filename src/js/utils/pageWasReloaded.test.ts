// Generated using GitHub Copilot

import pageWasReloaded from './pageWasReloaded';

// Helper to stub performance.getEntriesByType to return a given navigation type
const stubModernApi = (type: string) => {
  vi.spyOn(performance, 'getEntriesByType').mockReturnValue([{ type } as PerformanceNavigationTiming]);
};

describe('Testing "pageWasReloaded" function', () => {
  // Capture the original value so Object.defineProperty overrides can be rolled back.
  // vi.restoreAllMocks() only restores spies, not defineProperty overrides.
  const originalNavigation = performance.navigation;

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(performance, 'navigation', {
      value: originalNavigation,
      configurable: true,
    });
  });

  // MODERN API (PerformanceNavigationTiming)

  test('Returns true when modern API reports a reload', () => {
    stubModernApi('reload');
    expect(pageWasReloaded()).toBe(true);
  });

  test('Returns false when modern API reports a navigate', () => {
    stubModernApi('navigate');
    expect(pageWasReloaded()).toBe(false);
  });

  test('Returns false when modern API reports back_forward', () => {
    stubModernApi('back_forward');
    expect(pageWasReloaded()).toBe(false);
  });

  // LEGACY API FALLBACK (performance.navigation)

  test('Falls back to legacy API and returns true when type is TYPE_RELOAD', () => {
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([]);
    Object.defineProperty(performance, 'navigation', {
      value: { type: 1, TYPE_RELOAD: 1 },
      configurable: true,
    });
    expect(pageWasReloaded()).toBe(true);
  });

  test('Falls back to legacy API and returns false when type is not TYPE_RELOAD', () => {
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([]);
    Object.defineProperty(performance, 'navigation', {
      value: { type: 0, TYPE_RELOAD: 1 },
      configurable: true,
    });
    expect(pageWasReloaded()).toBe(false);
  });

  // NO API AVAILABLE

  test('Returns false when no performance API is available', () => {
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([]);
    Object.defineProperty(performance, 'navigation', {
      value: null,
      configurable: true,
    });
    expect(pageWasReloaded()).toBe(false);
  });
});
