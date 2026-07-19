import type { EventDefinition, SceneState, TimelineEntry } from './types';

function isDue(state: SceneState, event: EventDefinition): boolean {
  if (state.firedEventIds.includes(event.id)) return false;
  switch (event.trigger.type) {
    case 'time':
      return state.elapsedMinutes >= event.trigger.atMinute;
    case 'condition':
      return event.trigger.check(state);
    case 'missed_decision':
      return state.elapsedMinutes >= event.trigger.deadlineMinute && event.trigger.check(state);
    default:
      return false;
  }
}

function applyEvent(state: SceneState, event: EventDefinition): SceneState {
  const applied = event.apply(state);
  const entry: TimelineEntry = {
    atMinute: applied.elapsedMinutes,
    kind: 'event',
    label: event.label,
    detail: event.detail,
    observations: event.observe?.(applied) ?? [],
  };
  const withTimeline: SceneState = {
    ...applied,
    timeline: [...applied.timeline, entry],
    firedEventIds: [...applied.firedEventIds, event.id],
  };
  return event.critical ? { ...withTimeline, pendingAcknowledgmentEventId: event.id } : withTimeline;
}

function drainDueEvents(state: SceneState, staticEvents: readonly EventDefinition[]): SceneState {
  let next = state;
  const combined = [...staticEvents, ...next.dynamicEvents];
  for (const event of combined) {
    if (next.pendingAcknowledgmentEventId) break;
    if (isDue(next, event)) {
      next = applyEvent(next, event);
    }
  }
  return next;
}

/**
 * Advances simulated time by `minutes` and fires any events that
 * become due — both the scenario's fixed events and anything
 * scheduled at runtime (see scheduleEvent). If time is currently
 * paused for an unacknowledged critical interruption, no time passes
 * at all. If firing an event turns out to be critical, the clock
 * stops there even if other events were also due.
 */
export function advanceClock(
  state: SceneState,
  minutes: number,
  staticEvents: readonly EventDefinition[],
): SceneState {
  if (state.pendingAcknowledgmentEventId) return state;
  const advanced: SceneState = { ...state, elapsedMinutes: state.elapsedMinutes + minutes };
  return drainDueEvents(advanced, staticEvents);
}

/**
 * Clears a pending critical interruption and re-checks for anything
 * else already due at the current minute. Costs zero simulated time —
 * acknowledging a critical update never penalizes the learner for
 * having read it.
 */
export function acknowledgeInterruption(
  state: SceneState,
  staticEvents: readonly EventDefinition[],
): SceneState {
  if (!state.pendingAcknowledgmentEventId) return state;
  const entry: TimelineEntry = {
    atMinute: state.elapsedMinutes,
    kind: 'acknowledgment',
    label: 'Acknowledged interruption',
  };
  const acknowledged: SceneState = {
    ...state,
    pendingAcknowledgmentEventId: undefined,
    timeline: [...state.timeline, entry],
  };
  return drainDueEvents(acknowledged, staticEvents);
}

/** Schedules a one-off event relative to right now (e.g. "arrive in 6 minutes") rather than a fixed scenario-wide minute. */
export function scheduleEvent(state: SceneState, event: EventDefinition): SceneState {
  return { ...state, dynamicEvents: [...state.dynamicEvents, event] };
}
