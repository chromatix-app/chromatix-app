// ======================================================================
// VITEST SETUP
// ======================================================================

import { MockHTMLAudioElement } from './__mocks__/HTMLAudioElement';

// Replace the global HTMLAudioElement with the mock
Object.defineProperty(global, 'HTMLAudioElement', {
  writable: true,
  value: MockHTMLAudioElement,
});
