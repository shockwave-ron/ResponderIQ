import { describe, it, expect } from 'vitest';
import { bls01 } from './bls-01';
import { applyAction, acknowledge } from '../engine/reducer';
import type { SceneState } from '../engine/types';

function play(actionIds: readonly string[]): SceneState {
  let state = bls01.buildInitialState();
  for (const id of actionIds) {
    if (id === '__acknowledge__') {
      state = acknowledge(state, bls01);
      continue;
    }
    const before = state;
    state = applyAction(state, bls01, id);
    if (state === before) {
      throw new Error(`Action "${id}" was not actually available/applied at minute ${state.elapsedMinutes}`);
    }
  }
  return state;
}

describe('BLS-01 — good path: resources requested early', () => {
  it('reaches transport_initiated with zero critical flags', () => {
    const final = play([
      'request_additional_ems',
      'brief_partner_at_dispatch',
      'prep_stair_chair',
      'respond_to_call',
      'position_ambulance_clear',
      'calm_family_member',
      'check_stairwell_safety',
      'differential_possible_medical_cause',
      'approach_patient',
      'delegate_downstairs_commotion',
      'move_patient_with_help',
      'initiate_transport',
    ]);
    expect(final.phase).toBe('complete');
    expect(final.completion?.status).toBe('transport_initiated');
    expect(final.criticalFlags).toHaveLength(0);
    expect(final.resources.additional_ems.status).toBe('on_scene');
  });
});

describe('BLS-01 — critical path: no resources requested, unsafe carry attempted', () => {
  it('raises a critical flag and completes as unsafe', () => {
    const final = play([
      'brief_partner_at_dispatch',
      'respond_to_call',
      'position_ambulance_clear',
      'calm_family_member',
      'differential_possible_medical_cause',
      'approach_patient',
      'delegate_downstairs_commotion',
      'wait_and_monitor',
      '__acknowledge__',
      'attempt_carry_unsafely',
      'initiate_transport',
    ]);
    expect(final.phase).toBe('complete');
    expect(final.completion?.status).toBe('unsafe_extrication_completed');
    expect(final.criticalFlags).toHaveLength(1);
    expect(final.criticalFlags[0].acknowledged).toBe(false);
    expect(final.criticalFlags[0].whyDangerous).toContain('injury risk');
  });
});

describe('BLS-01 — late but adaptive path: requested late, waited for real help instead of forcing it', () => {
  it('still reaches a clean transport_initiated completion', () => {
    const final = play([
      'respond_to_call',
      'position_ambulance_clear',
      'calm_family_member',
      'differential_unclear',
      'approach_patient',
      'delegate_downstairs_commotion',
      'wait_and_monitor',
      'wait_and_monitor',
      '__acknowledge__',
      'request_additional_ems',
      'wait_and_monitor',
      'wait_and_monitor',
      'wait_and_monitor',
      'wait_and_monitor',
      'move_patient_with_help',
      'initiate_transport',
    ]);
    expect(final.phase).toBe('complete');
    expect(final.completion?.status).toBe('transport_initiated');
    expect(final.criticalFlags).toHaveLength(0);
    // Late request is still logged honestly, even though the outcome was safe.
    const lateRequestNote = final.timeline
      .flatMap((e) => e.observations ?? [])
      .find((o) => o.note === 'requested additional EMS late');
    expect(lateRequestNote).toBeDefined();
  });
});

describe('BLS-01 — administrator traceability', () => {
  it('every action entry records the full set of options that were actually offered', () => {
    const final = play(['brief_partner_at_dispatch']);
    const entry = final.timeline.find((e) => e.chosenActionId === 'brief_partner_at_dispatch');
    expect(entry?.availableActionIds).toEqual(expect.arrayContaining(['request_additional_ems', 'request_fire_lift_assist', 'prep_stair_chair', 'respond_to_call']));
  });
});
