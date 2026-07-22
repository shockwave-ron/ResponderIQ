/**
 * Local, per-browser app preferences. Deliberately separate from
 * SceneState (lib/engine/types.ts) — settings are a cross-scenario,
 * cross-session concern, not part of any one scenario's state.
 *
 * Scoped to what's actually wired up right now. Extend only when a
 * real, working feature needs a new field — not ahead of one.
 */
export interface AppSettings {
  /** Forces the same reduced-motion CSS the app already applies when the OS requests it (globals.css), regardless of OS setting. */
  readonly reducedMotion: boolean;
}
