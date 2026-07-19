import { describe, it, expect } from 'vitest';
import { raiseCriticalFlag, acknowledgeCriticalFlag, allCriticalFlagsAcknowledged, computeHiddenSummary } from './scoring';
import type { ScenarioDefinition, SceneState } from './types';

function baseState(overrides: Partial<SceneState> = {}): SceneState {
  return {
    phase: 'assessment',
    elapsedMinutes: 20,
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

const minimalScenario: ScenarioDefinition = {
  id: 'test',
  title: 'test',
  dispatchSummary: 'test',
  buildInitialState: baseState,
  actions: [],
  events: [],
  isComplete: () => false,
  relevantBehavioralTags: ['scene_safety', 'communication', 'leadership'],
};

describe('raiseCriticalFlag', () => {
  it('adds an unacknowledged flag and logs a timeline entry', () => {
    const next = raiseCriticalFlag(baseState(), {
      id: 'unsafe_carry',
      whatHappened: 'x',
      whyDangerous: 'y',
      consequence: 'z',
      saferAlternative: 'w',
    });
    expect(next.criticalFlags).toHaveLength(1);
    expect(next.criticalFlags[0].acknowledged).toBe(false);
    expect(next.criticalFlags[0].atMinute).toBe(20);
    expect(next.timeline).toHaveLength(1);
  });
});

describe('acknowledgeCriticalFlag / allCriticalFlagsAcknowledged', () => {
  it('flips only the matching flag to acknowledged', () => {
    const withFlag = raiseCriticalFlag(baseState(), {
      id: 'f1', whatHappened: 'a', whyDangerous: 'b', consequence: 'c', saferAlternative: 'd',
    });
    expect(allCriticalFlagsAcknowledged(withFlag)).toBe(false);
    const acked = acknowledgeCriticalFlag(withFlag, 'f1');
    expect(acked.criticalFlags[0].acknowledged).toBe(true);
    expect(allCriticalFlagsAcknowledged(acked)).toBe(true);
  });

  it('a scene with no critical flags is trivially fully acknowledged', () => {
    expect(allCriticalFlagsAcknowledged(baseState())).toBe(true);
  });
});

describe('computeHiddenSummary', () => {
  it('tallies observations by category and severity', () => {
    const state = baseState({
      timeline: [
        { atMinute: 1, kind: 'action', label: 'x', observations: [{ category: 'communication', severity: 'positive', note: 'n', atMinute: 1 }] },
        { atMinute: 2, kind: 'action', label: 'y', observations: [{ category: 'communication', severity: 'notable', note: 'n', atMinute: 2 }] },
      ],
    });
    const summary = computeHiddenSummary(state, minimalScenario);
    expect(summary.categoryTally.communication.positive).toBe(1);
    expect(summary.categoryTally.communication.notable).toBe(1);
  });

  it('only reports behavioral tags the scenario actually declares as relevant', () => {
    const state = baseState({
      timeline: [
        { atMinute: 1, kind: 'action', label: 'x', observations: [{ category: 'communication', severity: 'positive', tag: 'leadership', note: 'n', atMinute: 1 }] },
        { atMinute: 2, kind: 'action', label: 'y', observations: [{ category: 'communication', severity: 'positive', tag: 'bias_recognition', note: 'n', atMinute: 2 }] },
      ],
    });
    const summary = computeHiddenSummary(state, minimalScenario);
    // bias_recognition isn't in minimalScenario.relevantBehavioralTags, so it must not appear anywhere.
    expect(summary.behavioralTagsDemonstrated).toContain('leadership');
    expect(summary.behavioralTagsDemonstrated).not.toContain('bias_recognition');
    expect(summary.behavioralTagsMissed).not.toContain('bias_recognition');
    expect(summary.behavioralTagsMissed).toContain('scene_safety');
  });

  it('counts critical flags', () => {
    const withFlag = raiseCriticalFlag(baseState(), {
      id: 'f1', whatHappened: 'a', whyDangerous: 'b', consequence: 'c', saferAlternative: 'd',
    });
    expect(computeHiddenSummary(withFlag, minimalScenario).criticalFlagCount).toBe(1);
  });
});
