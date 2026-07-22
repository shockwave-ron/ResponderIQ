import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// Required for React 19 so act(...) (used to flush updates triggered by
// manually-dispatched DOM events, e.g. simulating a cross-tab storage
// event) doesn't warn that the test environment isn't configured for it.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  cleanup();
});
