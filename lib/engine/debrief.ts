import type { CriticalFlag, SceneState } from './types';

export interface DebriefContent {
  readonly headline: string;
  readonly strengths: readonly string[];
  readonly missedOpportunities: readonly string[];
  readonly criticalSafetyNotes: readonly CriticalFlag[];
}

/** Builds the learner-facing debrief strictly from this playthrough's own timeline — never generic, never numeric. */
export function buildDebrief(state: SceneState): DebriefContent {
  const observations = state.timeline.flatMap((entry) => entry.observations ?? []);

  const strengths = observations
    .filter((o) => o.severity === 'positive' && o.learnerNarrative)
    .map((o) => o.learnerNarrative as string);

  const missedOpportunities = observations
    .filter((o) => (o.severity === 'notable' || o.severity === 'minor') && o.learnerNarrative)
    .map((o) => o.learnerNarrative as string);

  const headline =
    state.completion?.status === 'transport_initiated'
      ? 'Transport was initiated and the patient was moved to the ambulance.'
      : state.completion?.status === 'unsafe_extrication_completed'
        ? 'The patient was moved, but not safely — see the critical safety note below.'
        : 'The mission did not reach a completed disposition.';

  return {
    headline,
    strengths,
    missedOpportunities,
    criticalSafetyNotes: state.criticalFlags,
  };
}
