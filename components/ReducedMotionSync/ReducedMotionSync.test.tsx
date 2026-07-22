import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { ReducedMotionSync } from './ReducedMotionSync';
import { SETTINGS_STORAGE_KEY } from '@/lib/settings/storage';

describe('ReducedMotionSync', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    delete document.documentElement.dataset.reducedMotion;
  });

  it('renders nothing', () => {
    const { container } = render(<ReducedMotionSync />);
    expect(container).toBeEmptyDOMElement();
  });

  it('sets data-reduced-motion="false" on <html> when nothing is stored', () => {
    render(<ReducedMotionSync />);
    expect(document.documentElement.dataset.reducedMotion).toBe('false');
  });

  it('sets data-reduced-motion="true" on <html> when the stored preference is true', () => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ reducedMotion: true }));
    render(<ReducedMotionSync />);
    expect(document.documentElement.dataset.reducedMotion).toBe('true');
  });
});
