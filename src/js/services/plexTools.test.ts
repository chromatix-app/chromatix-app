// Tests generated using AI

import axios from 'axios';

import { getBestConnection } from './plexTools';

// ======================================================================
// MOCKS
// ======================================================================

const env = vi.hoisted(() => ({ isElectron: true }));

vi.mock('axios', () => ({ default: { head: vi.fn() } }));

vi.mock('js/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('js/utils')>()),
  getEnvironment: () => env,
}));

// ======================================================================
// HELPERS
// ======================================================================

const local = {
  uri: 'https://192-168-1-2.abc123.plex.direct:32400',
  address: '192.168.1.2',
  port: 32400,
  local: true,
  relay: false,
};
const remote = {
  uri: 'https://1-2-3-4.abc123.plex.direct:32400',
  address: '1.2.3.4',
  port: 32400,
  local: false,
  relay: false,
};
const relay = {
  uri: 'https://5-6-7-8.abc123.plex.direct:8443',
  address: '5.6.7.8',
  port: 8443,
  local: false,
  relay: true,
};

const directHttps = 'https://192.168.1.2:32400';
const directHttp = 'http://192.168.1.2:32400';

const headMock = vi.mocked(axios.head);

/** Makes only the given URIs respond successfully (optionally after a delay in ms), then resolves the best connection. */
const resolveWith = async (
  workingUris: string[],
  connections = [local, remote, relay],
  responseDelays: Record<string, number> = {}
) => {
  headMock.mockImplementation((uri: string) => {
    if (!workingUris.includes(uri)) return Promise.reject(new Error('Unreachable'));
    if (!responseDelays[uri]) return Promise.resolve({});
    return new Promise((resolve) => setTimeout(() => resolve({}), responseDelays[uri]));
  });
  const result = getBestConnection({ server: { accessToken: 'token', connections } });
  const settled = result.then(
    (value) => ({ value }),
    (error) => ({ error })
  );
  await vi.runAllTimersAsync();
  return settled;
};

const requestedUris = () => headMock.mock.calls.map(([uri]) => uri);

// ======================================================================
// TESTS
// ======================================================================

describe('Testing "getBestConnection" function', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    headMock.mockReset();
    env.isElectron = true;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('Prefers the local plex.direct connection and never tries http or relay', async () => {
    expect(await resolveWith([local.uri, remote.uri, relay.uri, directHttp])).toEqual({ value: local.uri });
    expect(requestedUris()).not.toContain(directHttp);
    expect(requestedUris()).not.toContain(relay.uri);
  });

  test('Gives local a head start over remote, so a slightly slow local still wins over an instant remote', async () => {
    const result = await resolveWith([local.uri, remote.uri], [local, remote], { [local.uri]: 100 });
    expect(result).toEqual({ value: local.uri });
    expect(requestedUris()).not.toContain(remote.uri);
  });

  test('Skips attempts still waiting on their delay once a connection has succeeded', async () => {
    expect(await resolveWith([local.uri, directHttps])).toEqual({ value: local.uri });
    expect(requestedUris()).not.toContain(directHttps);
  });

  test('Falls back to a direct https IP connection when plex.direct DNS fails', async () => {
    expect(await resolveWith([directHttps, directHttp, relay.uri])).toEqual({ value: directHttps });
    expect(requestedUris()).not.toContain(directHttp);
    expect(requestedUris()).not.toContain(relay.uri);
  });

  test('Only tries plain http once every secure local candidate has failed', async () => {
    expect(await resolveWith([directHttp, relay.uri])).toEqual({ value: directHttp });
    expect(requestedUris().indexOf(directHttp)).toBeGreaterThan(requestedUris().indexOf(directHttps));
    expect(requestedUris()).not.toContain(relay.uri);
  });

  test('Uses a remote connection rather than relay when local is unreachable', async () => {
    expect(await resolveWith([remote.uri, relay.uri])).toEqual({ value: remote.uri });
    expect(requestedUris()).not.toContain(relay.uri);
  });

  test('Falls back to relay only once local and remote have all failed', async () => {
    expect(await resolveWith([relay.uri])).toEqual({ value: relay.uri });
    expect(requestedUris().at(-1)).toBe(relay.uri);
  });

  test('Never tries direct IP connections outside Electron', async () => {
    env.isElectron = false;
    expect(await resolveWith([directHttps, directHttp, relay.uri])).toEqual({ value: relay.uri });
    expect(requestedUris()).not.toContain(directHttps);
    expect(requestedUris()).not.toContain(directHttp);
  });

  test('Wraps IPv6 addresses in brackets for direct IP connections', async () => {
    const localIPv6 = { ...local, address: 'fd00::2', IPv6: true };
    expect(await resolveWith(['https://[fd00::2]:32400'], [localIPv6])).toEqual({ value: 'https://[fd00::2]:32400' });
  });

  test('Rejects when no connection responds', async () => {
    const { error } = (await resolveWith([])) as { error: Error };
    expect(error.message).toBe('No active connection found');
  });
});
