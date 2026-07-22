import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY, loadSettings, saveSettings } from './storage';

describe('settings storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns defaults when nothing is stored', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips a saved value', () => {
    saveSettings({ reducedMotion: true });
    expect(loadSettings()).toEqual({ reducedMotion: true });
  });

  it('falls back to defaults on corrupt JSON rather than throwing', () => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, '{not valid json');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('falls back to the default for a field with the wrong type instead of trusting it', () => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ reducedMotion: 'yes' }));
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('ignores unknown extra fields without throwing', () => {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ reducedMotion: true, somethingFromAFutureVersion: 'x' }),
    );
    expect(loadSettings()).toEqual({ reducedMotion: true });
  });
});
