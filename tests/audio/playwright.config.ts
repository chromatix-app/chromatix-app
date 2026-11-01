// Tests generated using AI

import { defineSuiteConfig, sessionProject, SESSION_PROJECT } from '../playwright.base';
import { AUTH_GRID_FILE } from '../paths';

export default defineSuiteConfig('audio', {
  testDir: '.',
  projects: [
    sessionProject,

    // Player playback
    {
      name: 'player',
      use: {
        storageState: AUTH_GRID_FILE,
        launchOptions: {
          args: ['--autoplay-policy=no-user-gesture-required'],
        },
      },
      testMatch: '**/playback.spec.ts',
      dependencies: [SESSION_PROJECT],
    },
  ],
});
