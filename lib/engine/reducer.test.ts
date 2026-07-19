import { describe, it, expect } from 'vitest';
import { getAvailableActions, applyAction, acknowledge } from './reducer';
import type { ActionDefinition, EventDefinition, ScenarioDefinition, SceneState } from './types';

function baseState(overrides: Partial<SceneState> = {}): SceneState {
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
    ...overrides,
  };
}

const alwaysAvailable: ActionDefinition = {
  id: 'ping', label: 'Ping', availableWhen: () => true, timeCostMinutes: 1, apply: (s) => s,
};
const onceOnly: ActionDefinition = {
  id: 'once', label: 'Once', availableWhen: () => true, timeCostMinutes: 0, oneTime: true, apply: (s) => s,
};
const gatedByPhase: ActionDefinition = {
  id: 'gated', label: 'Gated', availableWhen: (s) => s.phase === 'arrival', timeCostMinutes: 0, apply: (s) => s,
};
const withObservation: ActionDefinition = {
  id: 'observed', label: 'Observed', availableWhen: () => true, timeCostMinutes: 0, apply: (s) => s,
  observe: () => [{ category: 'communication', severity: 'positive', note: 'n', atMinute: 0, learnerNarrative: 'good job' }],
};
const triggersEvent: ActionDefinition = {
  id: 'trigger', label: 'Trigger', availableWhen: () => true, timeCostMinutes: 3, apply: (s) => s,
};
const dueAtThree: EventDefinition = {
  id: 'ev', trigger: { type: 'time', atMinute: 3 }, label: 'Event fired', detail: 'x',
  apply: (s) => ({ ...s, hazardFlags: ['event-fired'] }),
};

const scenario: ScenarioDefinition = {
  id: 'test', title: 'test', dispatchSummary: 'x',
  buildInitialState: baseState,
  actions: [alwaysAvailable, onceOnly, gatedByPhase, withObservation, triggersEvent],
  events: [dueAtThree],
  isComplete: () => false,
  relevantBehavioralTags: ['communication'],
};

describe('getAvailableActions', () => {
  it('excludes phase-gated actions when the phase does not match', () => {
    const available = getAvailableActions(baseState(), scenario);
    expect(available.map((a) => a.id)).not.toContain('gated');
  });

  it('includes phase-gated actions once the phase matches', () => {
    const available = getAvailableActions(baseState({ phase: 'arrival' }), scenario);
    expect(available.map((a) => a.id)).toContain('gated');
  });

  it('excludes a oneTime action once it has already been taken', () => {
    const available = getAvailableActions(baseState({ actionsTaken: ['once'] }), scenario);
    expect(available.map((a) => a.id)).not.toContain('once');
  });
});

describe('applyAction', () => {
  it('refuses to act while a critical interruption is pending', () => {
    const state = baseState({ pendingAcknowledgmentEventId: 'e1' });
    const next = applyAction(state, scenario, 'ping');
    expect(next).toBe(state);
  });

  it('ignores an action id that is not actually currently available', () => {
    const state = baseState();
    const next = applyAction(state, scenario, 'gated');
    expect(next).toBe(state);
  });

  it('records the action in actionsTaken and advances the clock by its time cost', () => {
    const next = applyAction(baseState(), scenario, 'ping');
    expect(next.actionsTaken).toContain('ping');
    expect(next.elapsedMinutes).toBe(1);
  });

  it("logs the action's own entry with the full available-actions list and the chosen id", () => {
    const next = applyAction(baseState(), scenario, 'ping');
    const entry = next.timeline.find((e) => e.chosenActionId === 'ping');
    expect(entry).toBeDefined();
    expect(entry?.availableActionIds).toContain('ping');
    expect(entry?.availableActionIds).toContain('once');
  });

  it('attaches observe() output to the action entry', () => {
    const next = applyAction(baseState(), scenario, 'observed');
    const entry = next.timeline.find((e) => e.chosenActionId === 'observed');
    expect(entry?.observations).toHaveLength(1);
  });

  it("logs the action's own entry before any event it triggers, in real narrative order", () => {
    const next = applyAction(baseState(), scenario, 'trigger');
    const actionIndex = next.timeline.findIndex((e) => e.chosenActionId === 'trigger');
    const eventIndex = next.timeline.findIndex((e) => e.label === 'Event fired');
    expect(actionIndex).toBeGreaterThanOrEqual(0);
    expect(eventIndex).toBeGreaterThan(actionIndex);
    expect(next.hazardFlags).toEqual(['event-fired']);
  });
});

describe('acknowledge', () => {
  it('clears the pending interruption', () => {
    const state = baseState({ pendingAcknowledgmentEventId: 'ev', elapsedMinutes: 3 });
    const next = acknowledge(state, scenario);
    expect(next.pendingAcknowledgmentEventId).toBeUndefined();
  });
});
