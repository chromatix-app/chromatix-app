// Tests generated using AI

import { defineSuiteConfig, sessionProject, SESSION_PROJECT } from '../playwright.base';
import { AUTH_GRID_FILE, AUTH_LIST_FILE, AUTH_SESSION_FILE } from '../paths';

export default defineSuiteConfig('snapshots', {
  testDir: './specs',
  snapshotPathTemplate: './baselines/{projectName}/{arg}{ext}',
  projects: [
    sessionProject,

    // Pre-login (no auth)
    {
      name: 'home',
      testMatch: '**/1.home.spec.ts',
    },

    // Setup pages (users/servers/libraries)
    {
      name: 'setup',
      use: {
        storageState: AUTH_SESSION_FILE,
      },
      testMatch: '**/2.setup.auth.spec.ts',
    },

    // Library pages (artists/albums/folders/playlists)
    {
      name: 'library-grid',
      use: {
        storageState: AUTH_GRID_FILE,
      },
      testMatch: '**/3.library.auth.spec.ts',
      dependencies: [SESSION_PROJECT],
    },
    {
      name: 'library-list',
      use: {
        storageState: AUTH_LIST_FILE,
      },
      testMatch: '**/3.library.auth.spec.ts',
      dependencies: [SESSION_PROJECT],
    },

    // Settings pages
    {
      name: 'settings',
      use: {
        storageState: AUTH_GRID_FILE,
      },
      testMatch: '**/4.settings.auth.spec.ts',
      dependencies: [SESSION_PROJECT],
    },

    // UI interactions
    {
      name: 'ui',
      use: {
        storageState: AUTH_GRID_FILE,
      },
      testMatch: '**/5.ui.auth.spec.ts',
      dependencies: [SESSION_PROJECT],
    },

    // Windows (Electron simulation)
    {
      name: 'windows',
      use: {
        storageState: AUTH_GRID_FILE,
      },
      testMatch: '**/6.windows.auth.spec.ts',
      dependencies: [SESSION_PROJECT],
    },

    // Dev pages (components/icons)
    {
      name: 'dev',
      use: {
        storageState: AUTH_GRID_FILE,
      },
      testMatch: '**/7.dev.auth.spec.ts',
      dependencies: [SESSION_PROJECT],
    },
  ],
});
