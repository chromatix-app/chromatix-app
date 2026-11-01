// Tests generated using AI

import path from 'path';

/** Folder holding the saved login and session state files (gitignored). */
export const AUTH_DIR = path.resolve(import.meta.dirname, '.auth');

/** Saved login, written by `npm run test:login`. */
export const AUTH_SESSION_FILE = path.join(AUTH_DIR, 'session.json');

/** Logged-in session with grid views, written by the session setup. */
export const AUTH_GRID_FILE = path.join(AUTH_DIR, 'session-grid.json');

/** Logged-in session with list views, written by the session setup. */
export const AUTH_LIST_FILE = path.join(AUTH_DIR, 'session-list.json');

/** The selected library's ID, written by the session setup. */
export const AUTH_LIBRARY_ID_FILE = path.join(AUTH_DIR, 'library-id.json');

/** Folder holding each suite's outputs (gitignored). */
export const RESULTS_DIR = path.resolve(import.meta.dirname, '../test-results');
