/**
 * Determines if the current page was loaded via a browser reload.
 * Uses modern PerformanceNavigationTiming API with fallback to deprecated navigation API.
 * @returns True if page was reloaded, false otherwise
 */

const pageWasReloaded = (): boolean => {
  // Check if the page was reloaded using the modern PerformanceNavigationTiming API
  if (performance && performance.getEntriesByType) {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (entries.length > 0) {
      return entries[0].type === 'reload';
    }
  }

  // Fallback to the deprecated navigation type
  if (performance && performance.navigation) {
    return performance.navigation.type === performance.navigation.TYPE_RELOAD;
  }

  // Cannot determine if the page was reloaded
  return false;
};

export default pageWasReloaded;
