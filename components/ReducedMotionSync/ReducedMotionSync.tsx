'use client';

import { useEffect } from 'react';
import { loadSettings } from '@/lib/settings/storage';

/**
 * Applies the stored reduced-motion preference to <html> on first load
 * of any page, via a `data-reduced-motion` attribute matched by a rule
 * in globals.css. Renders nothing.
 *
 * This only covers the "fresh page load" case. The Settings page
 * applies the attribute immediately on toggle itself, since layout-level
 * components don't remount on client-side navigation within the app.
 */
export function ReducedMotionSync() {
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = loadSettings().reducedMotion ? 'true' : 'false';
  }, []);

  return null;
}
