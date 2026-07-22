import type { AppSettings } from './types';

/** Local-browser-only storage key. Never sent anywhere; only readable in this same browser. */
export const SETTINGS_STORAGE_KEY = 'responderiq:local-settings';

export const DEFAULT_SETTINGS: AppSettings = {
  reducedMotion: false,
};

/**
 * Reads stored settings, falling back to defaults on missing or
 * corrupt data. Never throws — settings are a convenience layer, not
 * something that should be able to break the app.
 */
export function loadSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      reducedMotion:
        typeof parsed.reducedMotion === 'boolean' ? parsed.reducedMotion : DEFAULT_SETTINGS.reducedMotion,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage can fail (private browsing, quota). Settings simply won't persist across reloads.
  }
}
