import { describe, it, expect } from 'vitest';
import { advanceClock, acknowledgeInterruption, scheduleEvent } from './clock';
import type { EventDefinition, SceneState } from './types';

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

describe('advanceClock', () => {
  it('advances elapsed minutes by the given amount', () => {
    const next = advanceClock(baseState(), 5, []);
    expect(next.elapsedMinutes).toBe(5);
  });

  it('does not advance time or fire events while a critical interruption is pending', () => {
    const state = baseState({ pendingAcknowledgmentEventId: 'something', elapsedMinutes: 10 });
    const next = advanceClock(state, 5, []);
    expect(next.elapsedMinutes).toBe(10);
  });

  it('fires a time-triggered event once elapsed minutes reach it', () => {
    const event: EventDefinition = {
      id: 'e1',
      trigger: { type: 'time', atMinute: 5 },
      label: 'test event',
      detail: 'x',
      apply: (s) => ({ ...s, hazardFlags: [...s.hazardFlags, 'fired'] }),
    };
    const next = advanceClock(baseState(), 5, [event]);
    expect(next.hazardFlags).toContain('fired');
    expect(next.firedEventIds).toContain('e1');
    expect(next.timeline).toHaveLength(1);
  });

  it('does not re-fire an event that already fired', () => {
    const event: EventDefinition = {
      id: 'e1',
      trigger: { type: 'time', atMinute: 0 },
      label: 'x',
      detail: 'x',
      apply: (s) => ({ ...s, hazardFlags: [...s.hazardFlags, 'fired'] }),
    };
    const once = advanceClock(baseState(), 1, [event]);
    const twice = advanceClock(once, 1, [event]);
    expect(twice.hazardFlags).toEqual(['fired']);
  });

  it('fires a condition-triggered event when the predicate becomes true', () => {
    const event: EventDefinition = {
      id: 'e1',
      trigger: { type: 'condition', check: (s) => s.familyState === 'agitated' },
      label: 'x',
      detail: 'x',
      apply: (s) => ({ ...s, hazardFlags: ['fired'] }),
    };
    const next = advanceClock(baseState({ familyState: 'agitated' }), 0, [event]);
    expect(next.hazardFlags).toEqual(['fired']);
  });

  it('fires a missed-decision event only once the deadline passes with the check still true', () => {
    const event: EventDefinition = {
      id: 'e1',
      trigger: { type: 'missed_decision', deadlineMinute: 10, check: (s) => !s.actionsTaken.includes('called_for_help') },
      label: 'x',
      detail: 'x',
      apply: (s) => ({ ...s, hazardFlags: ['fired'] }),
    };
    const early = advanceClock(baseState(), 5, [event]);
    expect(early.hazardFlags).toEqual([]);
    const late = advanceClock(early, 6, [event]);
    expect(late.hazardFlags).toEqual(['fired']);
  });

  it('does not fire a missed-decision event if the required condition was already satisfied', () => {
    const event: EventDefinition = {
      id: 'e1',
      trigger: { type: 'missed_decision', deadlineMinute: 10, check: (s) => !s.actionsTaken.includes('called_for_help') },
      label: 'x',
      detail: 'x',
      apply: (s) => ({ ...s, hazardFlags: ['fired'] }),
    };
    const state = baseState({ actionsTaken: ['called_for_help'] });
    const next = advanceClock(state, 15, [event]);
    expect(next.hazardFlags).toEqual([]);
  });

  it('pauses the clock when a critical event fires, stopping further events from firing in the same pass', () => {
    const critical: EventDefinition = {
      id: 'e1', trigger: { type: 'time', atMinute: 1 }, critical: true, label: 'x', detail: 'x', apply: (s) => s,
    };
    const other: EventDefinition = {
      id: 'e2', trigger: { type: 'time', atMinute: 1 }, label: 'x', detail: 'x',
      apply: (s) => ({ ...s, hazardFlags: ['should-not-fire-yet'] }),
    };
    const next = advanceClock(baseState(), 1, [critical, other]);
    expect(next.pendingAcknowledgmentEventId).toBe('e1');
    expect(next.hazardFlags).toEqual([]);
  });

  it('fires the remaining due event once the critical interruption is acknowledged', () => {
    const critical: EventDefinition = {
      id: 'e1', trigger: { type: 'time', atMinute: 1 }, critical: true, label: 'x', detail: 'x', apply: (s) => s,
    };
    const other: EventDefinition = {
      id: 'e2', trigger: { type: 'time', atMinute: 1 }, label: 'x', detail: 'x',
      apply: (s) => ({ ...s, hazardFlags: ['now-fires'] }),
    };
    const paused = advanceClock(baseState(), 1, [critical, other]);
    const resumed = acknowledgeInterruption(paused, [critical, other]);
    expect(resumed.pendingAcknowledgmentEventId).toBeUndefined();
    expect(resumed.hazardFlags).toEqual(['now-fires']);
  });

  it('checks dynamic (runtime-scheduled) events in addition to the static list', () => {
    const dynamic: EventDefinition = {
      id: 'dyn1', trigger: { type: 'time', atMinute: 4 }, label: 'x', detail: 'x',
      apply: (s) => ({ ...s, hazardFlags: ['dynamic-fired'] }),
    };
    const withScheduled = scheduleEvent(baseState(), dynamic);
    const next = advanceClock(withScheduled, 4, []);
    expect(next.hazardFlags).toEqual(['dynamic-fired']);
  });
});

describe('acknowledgeInterruption', () => {
  it('does nothing if there is no pending interruption', () => {
    const state = baseState();
    expect(acknowledgeInterruption(state, [])).toBe(state);
  });

  it('costs no simulated time', () => {
    const state = baseState({ pendingAcknowledgmentEventId: 'e1', elapsedMinutes: 12 });
    const next = acknowledgeInterruption(state, []);
    expect(next.elapsedMinutes).toBe(12);
  });
});
