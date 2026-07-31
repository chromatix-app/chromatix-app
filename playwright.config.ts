// Tests generated using AI

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: '**/setup/**',
  timeout: 120000,
  workers: 1,
  outputDir: './test-results',
  reporter: [['html', { outputFolder: 'test-report', open: 'never' }]],
  snapshotPathTemplate: './tests/snapshots/{projectName}/{arg}{ext}',
  use: {
    baseURL: 'http://localhost:4000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    // Pre-login (no auth)
    {
      name: 'home',
      testIgnore: ['**/setup/**', '**/*.auth.spec.ts'],
    },

    // Setup pages (users/servers/libraries)
    {
      name: 'setup',
      use: {
        storageState: 'tests/.auth/session.json',
      },
      testMatch: '**/2.setup.auth.spec.ts',
    },

    // Library pages (artists/albums/folders/playlists)
    {
      name: 'library-grid',
      use: {
        storageState: 'tests/.auth/session-grid.json',
      },
      testMatch: '**/3.library.auth.spec.ts',
    },
    {
      name: 'library-list',
      use: {
        storageState: 'tests/.auth/session-list.json',
      },
      testMatch: '**/3.library.auth.spec.ts',
    },

    // Settings pages
    {
      name: 'settings',
      use: {
        storageState: 'tests/.auth/session-grid.json',
      },
      testMatch: '**/4.settings.auth.spec.ts',
    },

    // UI interactions
    {
      name: 'ui',
      use: {
        storageState: 'tests/.auth/session-grid.json',
      },
      testMatch: '**/5.ui.auth.spec.ts',
    },

    // Windows (Electron simulation)
    {
      name: 'windows',
      use: {
        storageState: 'tests/.auth/session-grid.json',
      },
      testMatch: '**/6.windows.auth.spec.ts',
    },

    // Player testing
    {
      name: 'player',
      use: {
        storageState: 'tests/.auth/session-grid.json',
        launchOptions: {
          args: ['--autoplay-policy=no-user-gesture-required'],
        },
      },
      testMatch: '**/7.player.auth.spec.ts',
    },
  ],
});
