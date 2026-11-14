// Tests generated using AI
// Settings shared by the snapshots and audio Playwright configs.

import path from 'path';
import { defineConfig, PlaywrightTestConfig, Project } from '@playwright/test';
import { AUTH_SESSION_FILE, RESULTS_DIR } from './paths';

/** Name of the session setup project, for other projects' `dependencies`. */
export const SESSION_PROJECT = 'session';

/** Builds the grid/list sessions and library ID from the saved login before dependent projects. */
export const sessionProject: Project = {
  name: SESSION_PROJECT,
  testDir: path.resolve(import.meta.dirname, 'setup'),
  testMatch: 'session.setup.ts',
  use: {
    storageState: AUTH_SESSION_FILE,
  },
};

/** Creates a config whose output and report are kept in `test-results/<suite>/`. */
export function defineSuiteConfig(suite: string, config: PlaywrightTestConfig) {
  return defineConfig({
    timeout: 120000,
    workers: 1,
    outputDir: path.join(RESULTS_DIR, suite, 'output'),
    reporter: [['html', { outputFolder: path.join(RESULTS_DIR, suite, 'report'), open: 'never' }]],
    use: {
      baseURL: 'http://localhost:4000',
    },
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:4000',
      reuseExistingServer: !process.env.CI,
    },
    ...config,
  });
}
