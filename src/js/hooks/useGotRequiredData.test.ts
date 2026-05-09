// Generated using GitHub Copilot

import { useSelector } from 'react-redux';

import useGotRequiredData from './useGotRequiredData';

vi.mock('react-redux', () => ({ useSelector: vi.fn() }));

// Calls each useSelector invocation with the provided mock state, mirroring
// how the real Redux store would supply state to the hook's selectors.
const useSetup = (appModel: object, sessionModel: object) => {
  const state = { appModel, sessionModel };
  vi.mocked(useSelector).mockImplementation((selector: (s: typeof state) => unknown) => selector(state));
  return useGotRequiredData();
};

describe('Testing "useGotRequiredData" hook', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // USERS NOT LOADED YET

  test('Returns false when allUsers is null (data not yet loaded)', () => {
    const result = useSetup(
      { allUsers: null, allServers: null, allLibraries: null, currentService: 'plex' },
      { currentUser: null, currentServer: null, currentLibrary: null }
    );
    expect(result).toBe(false);
  });

  // PLEX — SHORT-CIRCUIT ON NO USERS

  test('Returns true on Plex when allUsers is empty (no users to select)', () => {
    const result = useSetup(
      { allUsers: [], allServers: null, allLibraries: null, currentService: 'plex' },
      { currentUser: null, currentServer: null, currentLibrary: null }
    );
    expect(result).toBe(true);
  });

  // PLEX — SHORT-CIRCUIT ON NO CURRENT USER

  test('Returns true on Plex when users exist but no current user is selected', () => {
    const result = useSetup(
      { allUsers: [{ id: 1 }], allServers: null, allLibraries: null, currentService: 'plex' },
      { currentUser: null, currentServer: null, currentLibrary: null }
    );
    expect(result).toBe(true);
  });

  // SERVERS NOT LOADED YET

  test('Returns false when allServers is null (data not yet loaded)', () => {
    const result = useSetup(
      { allUsers: [{ id: 1 }], allServers: null, allLibraries: null, currentService: 'plex' },
      { currentUser: { id: 1 }, currentServer: null, currentLibrary: null }
    );
    expect(result).toBe(false);
  });

  // SHORT-CIRCUIT ON NO SERVERS

  test('Returns true when allServers is empty (no servers to select)', () => {
    const result = useSetup(
      { allUsers: [{ id: 1 }], allServers: [], allLibraries: null, currentService: 'plex' },
      { currentUser: { id: 1 }, currentServer: null, currentLibrary: null }
    );
    expect(result).toBe(true);
  });

  // SHORT-CIRCUIT ON NO CURRENT SERVER

  test('Returns true when servers exist but no current server is selected', () => {
    const result = useSetup(
      { allUsers: [{ id: 1 }], allServers: [{ id: 1 }], allLibraries: null, currentService: 'plex' },
      { currentUser: { id: 1 }, currentServer: null, currentLibrary: null }
    );
    expect(result).toBe(true);
  });

  // LIBRARIES NOT LOADED YET

  test('Returns false when allLibraries is null (data not yet loaded)', () => {
    const result = useSetup(
      { allUsers: [{ id: 1 }], allServers: [{ id: 1 }], allLibraries: null, currentService: 'plex' },
      { currentUser: { id: 1 }, currentServer: { id: 1 }, currentLibrary: null }
    );
    expect(result).toBe(false);
  });

  // SHORT-CIRCUIT ON NO LIBRARIES

  test('Returns true when allLibraries is empty (no libraries to select)', () => {
    const result = useSetup(
      { allUsers: [{ id: 1 }], allServers: [{ id: 1 }], allLibraries: [], currentService: 'plex' },
      { currentUser: { id: 1 }, currentServer: { id: 1 }, currentLibrary: null }
    );
    expect(result).toBe(true);
  });

  // SHORT-CIRCUIT ON NO CURRENT LIBRARY

  test('Returns true when libraries exist but no current library is selected', () => {
    const result = useSetup(
      {
        allUsers: [{ id: 1 }],
        allServers: [{ id: 1 }],
        allLibraries: [{ id: 1 }],
        currentService: 'plex',
      },
      { currentUser: { id: 1 }, currentServer: { id: 1 }, currentLibrary: null }
    );
    expect(result).toBe(true);
  });

  // FULLY LOADED

  test('Returns true when all data is loaded and all selections are made', () => {
    const result = useSetup(
      {
        allUsers: [{ id: 1 }],
        allServers: [{ id: 1 }],
        allLibraries: [{ id: 1 }],
        currentService: 'plex',
      },
      { currentUser: { id: 1 }, currentServer: { id: 1 }, currentLibrary: { id: 1 } }
    );
    expect(result).toBe(true);
  });

  // JELLYFIN — no user-level short-circuit paths apply

  test('Does not short-circuit on Jellyfin when allUsers is empty (continues to server check)', () => {
    // Plex returns true here; Jellyfin must not — it should fall through to check servers
    const result = useSetup(
      { allUsers: [], allServers: null, allLibraries: null, currentService: 'jellyfin' },
      { currentUser: null, currentServer: null, currentLibrary: null }
    );
    expect(result).toBe(false);
  });

  test('Returns false on Jellyfin when allServers is null', () => {
    const result = useSetup(
      { allUsers: [{ id: 1 }], allServers: null, allLibraries: null, currentService: 'jellyfin' },
      { currentUser: null, currentServer: null, currentLibrary: null }
    );
    expect(result).toBe(false);
  });

  test('Returns true on Jellyfin when fully loaded with all selections made', () => {
    const result = useSetup(
      {
        allUsers: [{ id: 1 }],
        allServers: [{ id: 1 }],
        allLibraries: [{ id: 1 }],
        currentService: 'jellyfin',
      },
      { currentUser: null, currentServer: { id: 1 }, currentLibrary: { id: 1 } }
    );
    expect(result).toBe(true);
  });
});
