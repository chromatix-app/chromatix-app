// Tests generated using AI

import getJellyAuthHeader from './getJellyAuthHeader';

const details = {
  client: 'Chromatix',
  device: 'Chromatix for Web',
  deviceId: 'abc123',
  version: '0.72.0',
};

describe('Testing "getJellyAuthHeader" function', () => {
  test('Test without a token', () => {
    expect(getJellyAuthHeader(details)).toBe(
      'MediaBrowser Client="Chromatix", Device="Chromatix%20for%20Web", DeviceId="abc123", Version="0.72.0"'
    );
  });

  test('Test with a token', () => {
    expect(getJellyAuthHeader({ ...details, token: 'token123' })).toBe(
      'MediaBrowser Client="Chromatix", Device="Chromatix%20for%20Web", DeviceId="abc123", Version="0.72.0", Token="token123"'
    );
  });

  test('Test with an empty or null token', () => {
    expect(getJellyAuthHeader({ ...details, token: '' })).not.toContain('Token=');
    expect(getJellyAuthHeader({ ...details, token: null })).not.toContain('Token=');
  });

  test('Test with a missing version', () => {
    expect(getJellyAuthHeader({ ...details, version: null })).toContain('Version="0.0.0"');
    expect(getJellyAuthHeader({ ...details, version: undefined })).toContain('Version="0.0.0"');
    expect(getJellyAuthHeader({ ...details, version: '' })).toContain('Version="0.0.0"');
  });

  test('Test that quotes and commas in values are encoded', () => {
    const header = getJellyAuthHeader({ ...details, device: 'My "PC", Home' });
    expect(header).toContain('Device="My%20%22PC%22%2C%20Home"');
    expect(header.match(/"/g)).toHaveLength(8);
  });
});
