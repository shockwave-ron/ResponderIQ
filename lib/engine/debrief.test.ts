import { describe, it, expect } from 'vitest';
import { buildDebrief } from './debrief';
import type { SceneState } from './types';

function baseState(overrides: Partial<SceneState> = {}): SceneState {
  return {
    phase: 'complete',
    elapsedMinutes: 25,
    resources: {
      additional_ems: { kind: 'additional_ems', status: 'not_requested' },
      fire_lift_assist: { kind: 'fire_lift_assist', status: 'not_requested' },
    },
    hazardFlags: [],
    familyState: 'calm',
    stairChairPrepped: true,
    patientCanBearWeight: false,
    differential: { current: [], history: [] },
    timeline: [],
    criticalFlags: [],
    actionsTaken: [],
    firedEventIds: [],
    dynamicEvents: [],
    ...overrides,
  };
}

describe('buildDebrief', () => {
  it('pulls strengths only from positive observations that carry learner narrative', () => {
    const state = baseState({
      completion: { status: 'transport_initiated', atMinute: 24 },
      timeline: [
        { atMinute: 1, kind: 'action', label: 'x', observations: [{ category: 'communication', severity: 'positive', note: 'internal', atMinute: 1, learnerNarrative: 'You handled that well.' }] },
        { atMinute: 2, kind: 'action', label: 'y', observations: [{ category: 'timing', severity: 'positive', note: 'internal, no learner text' }] as never },
      ],
    });
    const debrief = buildDebrief(state);
    expect(debrief.strengths).toEqual(['You handled that well.']);
  });

  it('pulls missed opportunities from notable and minor observations only', () => {
    const state = baseState({
      timeline: [
        { atMinute: 1, kind: 'action', label: 'x', observations: [{ category: 'timing', severity: 'notable', note: 'n', atMinute: 1, learnerNarrative: 'You were slow to call for help.' }] },
        { atMinute: 2, kind: 'action', label: 'y', observations: [{ category: 'timing', severity: 'critical', note: 'n', atMinute: 2, learnerNarrative: 'should not appear here' }] },
      ],
    });
    const debrief = buildDebrief(state);
    expect(debrief.missedOpportunities).toEqual(['You were slow to call for help.']);
  });

  it('reflects an unsafe completion in the headline and includes the critical flag', () => {
    const state = baseState({
      completion: { status: 'unsafe_extrication_completed', atMinute: 22 },
      criticalFlags: [{ id: 'f1', whatHappened: 'a', whyDangerous: 'b', consequence: 'c', saferAlternative: 'd', acknowledged: false, atMinute: 21 }],
    });
    const debrief = buildDebrief(state);
    expect(debrief.headline).toContain('not safely');
    expect(debrief.criticalSafetyNotes).toHaveLength(1);
  });

  it('reflects an incomplete mission when there is no completion status', () => {
    expect(buildDebrief(baseState()).headline).toContain('did not reach a completed disposition');
  });
});
