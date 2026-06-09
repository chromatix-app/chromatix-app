// Generated using GitHub Copilot

import getLocalStorage from './getLocalStorage';
import setLocalStorage from './setLocalStorage';

describe('Testing "setLocalStorage" and "getLocalStorage" functions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ROUND-TRIP

  test('Stores and retrieves a string value', () => {
    setLocalStorage('test-key', 'hello');
    expect(getLocalStorage('test-key')).toBe('hello');
  });

  test('Stores and retrieves a number value', () => {
    setLocalStorage('test-key', 42);
    expect(getLocalStorage('test-key')).toBe('42');
  });

  test('Stores and retrieves a boolean value', () => {
    setLocalStorage('test-key', true);
    expect(getLocalStorage('test-key')).toBe('true');
  });

  test('Stores and retrieves an object value as a JSON string', () => {
    setLocalStorage('test-key', { foo: 'bar', count: 1 });
    expect(getLocalStorage('test-key')).toBe('{"foo":"bar","count":1}');
  });

  test('Stores and retrieves an array value as a JSON string', () => {
    setLocalStorage('test-key', [1, 2, 3]);
    expect(getLocalStorage('test-key')).toBe('[1,2,3]');
  });

  test('Stores and retrieves an empty string', () => {
    setLocalStorage('test-key', '');
    expect(getLocalStorage('test-key')).toBe('');
  });

  // ENCRYPTION

  test('Stored value is not stored as plaintext', () => {
    setLocalStorage('test-key', 'secret');
    const raw = localStorage.getItem('test-key');
    expect(raw).not.toBe('secret');
    expect(raw).not.toContain('secret');
  });

  test('Different keys are stored independently', () => {
    setLocalStorage('key-a', 'alpha');
    setLocalStorage('key-b', 'beta');
    expect(getLocalStorage('key-a')).toBe('alpha');
    expect(getLocalStorage('key-b')).toBe('beta');
  });

  test('Overwriting a key returns the new value', () => {
    setLocalStorage('test-key', 'first');
    setLocalStorage('test-key', 'second');
    expect(getLocalStorage('test-key')).toBe('second');
  });

  // MISSING KEY

  test('Returns null for a key that has not been set', () => {
    expect(getLocalStorage('nonexistent-key')).toBeNull();
  });

  // CORRUPTION / TAMPERING

  test('Returns an empty string when the stored value is not valid ciphertext', () => {
    // Use only non-base64 characters so CryptoJS deterministically produces zero bytes
    localStorage.setItem('test-key', '!@#$%^&*()');
    expect(getLocalStorage('test-key')).toBe('');
  });
});
