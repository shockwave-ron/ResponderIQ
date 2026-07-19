import { describe, it, expect } from 'vitest';
import { validateScenario } from './validate';
import { bls01 } from '../scenarios/bls-01';
import type { ScenarioDefinition, SceneState } from './types';

function trivialState(): SceneState {
  return {
    phase: 'dispatch',
    elapsedMinutes: 0,
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
  };
}

describe('validateScenario', () => {
  it('rejects a scenario shaped like a fixed linear quiz', () => {
    const linearQuiz: ScenarioDefinition = {
      id: 'bad',
      title: 'bad',
      dispatchSummary: 'x',
      buildInitialState: trivialState,
      actions: [
        { id: 'a', label: 'A', availableWhen: () => true, timeCostMinutes: 0, apply: (s) => s },
        { id: 'b', label: 'B', availableWhen: () => true, timeCostMinutes: 0, apply: (s) => s },
      ],
      events: [],
      isComplete: () => false,
      relevantBehavioralTags: [],
    };
    const result = validateScenario(linearQuiz);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('accepts BLS-01 as built', () => {
    const result = validateScenario(bls01);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
