import type { DifferentialRead, SceneState, TimelineEntry } from './types';

/** Records a new (or revised) operational differential and logs why it changed. */
export function updateDifferential(
  state: SceneState,
  reads: readonly DifferentialRead[],
  reason?: string,
): SceneState {
  const entry: TimelineEntry = {
    atMinute: state.elapsedMinutes,
    kind: 'differential_update',
    label: 'Updated operational read',
    detail: reason,
  };
  return {
    ...state,
    differential: {
      current: reads,
      history: [...state.differential.history, { atMinute: state.elapsedMinutes, reads, reason }],
    },
    timeline: [...state.timeline, entry],
  };
}
