function pageWasReloaded() {
  if (performance && performance.navigation) {
    return performance.navigation.type === 1;
  } else {
    // Fallback for browsers that do not support Performance API
    if (window.performance) {
      return performance.getEntriesByType('navigation')[0].type === 'reload';
    } else {
      return false; // Cannot determine if the page was reloaded
    }
  }
}

export default pageWasReloaded;
