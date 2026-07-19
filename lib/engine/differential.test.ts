import { describe, it, expect } from 'vitest';
import { updateDifferential } from './differential';
import type { SceneState } from './types';

function baseState(overrides: Partial<SceneState> = {}): SceneState {
  return {
    phase: 'arrival',
    elapsedMinutes: 8,
    resources: {
      additional_ems: { kind: 'additional_ems', status: 'not_requested' },
      fire_lift_assist: { kind: 'fire_lift_assist', status: 'not_requested' },
    },
    hazardFlags: [],
    familyState: 'calm',
    stairChairPrepped: false,
    patientCanBearWeight: true,
    differential: { current: [], history: [] },
    timeline: [],
    criticalFlags: [],
    actionsTaken: [],
    firedEventIds: [],
    dynamicEvents: [],
    ...overrides,
  };
}

describe('updateDifferential', () => {
  it('sets the current read and appends to history', () => {
    const next = updateDifferential(baseState(), ['possible_medical_event_caused_fall'], 'family report');
    expect(next.differential.current).toEqual(['possible_medical_event_caused_fall']);
    expect(next.differential.history).toHaveLength(1);
    expect(next.differential.history[0].reason).toBe('family report');
    expect(next.differential.history[0].atMinute).toBe(8);
  });

  it('preserves prior history when revised again', () => {
    const first = updateDifferential(baseState(), ['unclear_needs_more_info']);
    const second = updateDifferential({ ...first, elapsedMinutes: 15 }, ['possible_medical_event_caused_fall'], 'new info');
    expect(second.differential.history).toHaveLength(2);
    expect(second.differential.current).toEqual(['possible_medical_event_caused_fall']);
  });

  it('logs a timeline entry', () => {
    const next = updateDifferential(baseState(), ['mechanical_fall_only']);
    expect(next.timeline).toHaveLength(1);
    expect(next.timeline[0].kind).toBe('differential_update');
  });
});
