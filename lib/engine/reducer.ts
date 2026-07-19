import type { ActionDefinition, ScenarioDefinition, SceneState, TimelineEntry } from './types';
import { advanceClock, acknowledgeInterruption } from './clock';
import { checkResourceArrivals } from './resources';

/** Every action currently offered — filtered by its own availability condition, never a fixed list per phase. */
export function getAvailableActions(
  state: SceneState,
  scenario: ScenarioDefinition,
): readonly ActionDefinition[] {
  return scenario.actions.filter(
    (action) => action.availableWhen(state) && !(action.oneTime && state.actionsTaken.includes(action.id)),
  );
}

/**
 * Applies a learner's chosen action. No action is accepted while a
 * critical interruption is pending acknowledgment. Observations are
 * computed against the resulting state (so timing-dependent judgments
 * see the real elapsed time) and attached to the action's own timeline
 * entry, which is logged before any clock- or resource-triggered
 * entries that result from the time this action costs — so the log
 * reads in real narrative order: what the learner did, then what
 * happened as a result.
 */
export function applyAction(state: SceneState, scenario: ScenarioDefinition, actionId: string): SceneState {
  if (state.pendingAcknowledgmentEventId) return state;
  const available = getAvailableActions(state, scenario);
  const action = available.find((a) => a.id === actionId);
  if (!action) return state;

  const afterApply = action.apply(state);

  // Peek at the eventual state purely to compute observations correctly; discarded and redone for real below.
  const peek = checkResourceArrivals(advanceClock(afterApply, action.timeCostMinutes, scenario.events));
  const observations = action.observe?.(peek) ?? [];

  const actionEntry: TimelineEntry = {
    atMinute: state.elapsedMinutes,
    kind: 'action',
    label: action.label,
    availableActionIds: available.map((a) => a.id),
    chosenActionId: action.id,
    observations,
  };

  const withActionLogged: SceneState = {
    ...afterApply,
    actionsTaken: [...afterApply.actionsTaken, action.id],
    timeline: [...afterApply.timeline, actionEntry],
  };

  const afterClock = advanceClock(withActionLogged, action.timeCostMinutes, scenario.events);
  return checkResourceArrivals(afterClock);
}

/** Clears a pending critical interruption — the only thing allowed while one is pending. */
export function acknowledge(state: SceneState, scenario: ScenarioDefinition): SceneState {
  return checkResourceArrivals(acknowledgeInterruption(state, scenario.events));
}
