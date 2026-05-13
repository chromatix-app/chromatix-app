// Generated using GitHub Copilot

export class MockHTMLAudioElement {
  src = '';
  volume = 1;
  currentTime = 0;
  duration = 100; // Mock 100 second track
  readyState = 4; // HTMLMediaElement.HAVE_ENOUGH_DATA
  preload = 'auto';
  paused = true;

  private eventListeners: { [key: string]: Function[] } = {};

  addEventListener(event: string, listener: Function, options?: any) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }

    // Handle 'once' option
    const wrappedListener = options?.once
      ? (...args: any[]) => {
          listener(...args);
          this.removeEventListener(event, wrappedListener);
        }
      : listener;

    this.eventListeners[event].push(wrappedListener);
  }

  removeEventListener(event: string, listener: Function) {
    if (this.eventListeners[event]) {
      const index = this.eventListeners[event].indexOf(listener);
      if (index > -1) {
        this.eventListeners[event].splice(index, 1);
      }
    }
  }

  play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }

  load() {
    // Real browsers reset currentTime to 0 and pause on load()
    this.currentTime = 0;
    this.paused = true;
    // Simulate loading sequence
    setTimeout(() => {
      this.triggerEvent('loadstart');
      setTimeout(() => {
        this.readyState = 2; // HAVE_CURRENT_DATA
        this.triggerEvent('canplay');
        setTimeout(() => {
          this.readyState = 4; // HAVE_ENOUGH_DATA
          this.triggerEvent('canplaythrough');
        }, 100);
      }, 100);
    }, 50);
  }

  private triggerEvent(eventName: string) {
    if (this.eventListeners[eventName]) {
      // Create a copy to avoid issues with listeners removing themselves
      const listeners = [...this.eventListeners[eventName]];
      listeners.forEach((listener) => {
        try {
          listener();
        } catch (error) {
          console.warn(`Error in mock event listener for ${eventName}:`, error);
        }
      });
    }
  }

  // Helper method for tests to manually trigger events
  mockTriggerEvent(eventName: string) {
    this.triggerEvent(eventName);
  }

  // Helper to simulate error
  mockTriggerError(error: any) {
    const errorEvent = { target: this, currentTarget: this };
    if (this.eventListeners['error']) {
      this.eventListeners['error'].forEach((listener) => listener(errorEvent));
    }
  }
}

// Mock HTMLMediaElement constants
(global as any).HTMLMediaElement = {
  HAVE_NOTHING: 0,
  HAVE_METADATA: 1,
  HAVE_CURRENT_DATA: 2,
  HAVE_FUTURE_DATA: 3,
  HAVE_ENOUGH_DATA: 4,
};
