import { describe, it, expect } from 'vitest';
import { requestResource, cancelResource, checkResourceArrivals } from './resources';
import type { SceneState } from './types';

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

describe('requestResource', () => {
  it('moves the resource to en_route with a computed arrival minute', () => {
    const state = requestResource(baseState({ elapsedMinutes: 3 }), 'additional_ems', 9);
    expect(state.resources.additional_ems.status).toBe('en_route');
    expect(state.resources.additional_ems.requestedAtMinute).toBe(3);
    expect(state.resources.additional_ems.arrivesAtMinute).toBe(12);
  });

  it('does nothing if already requested', () => {
    const requested = requestResource(baseState(), 'additional_ems', 9);
    const again = requestResource(requested, 'additional_ems', 9);
    expect(again).toBe(requested);
  });

  it('logs a timeline entry', () => {
    const state = requestResource(baseState(), 'fire_lift_assist', 7);
    expect(state.timeline).toHaveLength(1);
    expect(state.timeline[0].label).toContain('Fire department');
  });
});

describe('checkResourceArrivals', () => {
  it('marks a resource on scene once elapsed time reaches its arrival minute', () => {
    const requested = requestResource(baseState(), 'additional_ems', 5);
    const before = checkResourceArrivals({ ...requested, elapsedMinutes: 4 });
    expect(before.resources.additional_ems.status).toBe('en_route');

    const arrived = checkResourceArrivals({ ...requested, elapsedMinutes: 5 });
    expect(arrived.resources.additional_ems.status).toBe('on_scene');
    expect(arrived.timeline.some((e) => e.label.includes('arrived'))).toBe(true);
  });

  it('does nothing while a critical interruption is pending', () => {
    const requested = requestResource(baseState(), 'additional_ems', 5);
    const pending = { ...requested, elapsedMinutes: 10, pendingAcknowledgmentEventId: 'e1' };
    const next = checkResourceArrivals(pending);
    expect(next.resources.additional_ems.status).toBe('en_route');
  });
});

describe('cancelResource', () => {
  it('cancels a resource that has not yet arrived', () => {
    const requested = requestResource(baseState(), 'additional_ems', 9);
    const canceled = cancelResource(requested, 'additional_ems');
    expect(canceled.resources.additional_ems.status).toBe('canceled');
  });

  it('does nothing if not currently en route', () => {
    const state = baseState();
    expect(cancelResource(state, 'additional_ems')).toBe(state);
  });
});
