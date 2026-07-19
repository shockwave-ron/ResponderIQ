import type { ResourceKind, SceneState, TimelineEntry } from './types';

const RESOURCE_LABELS: Record<ResourceKind, string> = {
  additional_ems: 'Additional EMS unit',
  fire_lift_assist: 'Fire department (lift assist)',
};

/** Requests a resource, scheduling its real arrival `etaMinutes` from now rather than flipping status instantly. */
export function requestResource(
  state: SceneState,
  kind: ResourceKind,
  etaMinutes: number,
): SceneState {
  const existing = state.resources[kind];
  if (existing.status !== 'not_requested') return state;
  const arrivesAtMinute = state.elapsedMinutes + etaMinutes;
  const entry: TimelineEntry = {
    atMinute: state.elapsedMinutes,
    kind: 'action',
    label: `Requested ${RESOURCE_LABELS[kind]}`,
    detail: `ETA ${etaMinutes} min`,
  };
  return {
    ...state,
    resources: {
      ...state.resources,
      [kind]: {
        kind,
        status: 'en_route',
        requestedAtMinute: state.elapsedMinutes,
        etaMinutes,
        arrivesAtMinute,
      },
    },
    timeline: [...state.timeline, entry],
  };
}

/** Cancels a resource that has not yet arrived on scene. */
export function cancelResource(state: SceneState, kind: ResourceKind): SceneState {
  const existing = state.resources[kind];
  if (existing.status !== 'en_route') return state;
  const entry: TimelineEntry = {
    atMinute: state.elapsedMinutes,
    kind: 'action',
    label: `Canceled ${RESOURCE_LABELS[kind]}`,
  };
  return {
    ...state,
    resources: { ...state.resources, [kind]: { kind, status: 'canceled' } },
    timeline: [...state.timeline, entry],
  };
}

/**
 * Checks every en-route resource against the current elapsed time and
 * marks any that have reached their ETA as on scene, logging the
 * arrival. Does nothing while a critical interruption is pending —
 * time isn't really passing yet, so nothing should arrive.
 */
export function checkResourceArrivals(state: SceneState): SceneState {
  if (state.pendingAcknowledgmentEventId) return state;
  let next = state;
  for (const kind of Object.keys(next.resources) as ResourceKind[]) {
    const resource = next.resources[kind];
    if (
      resource.status === 'en_route' &&
      resource.arrivesAtMinute !== undefined &&
      next.elapsedMinutes >= resource.arrivesAtMinute
    ) {
      const entry: TimelineEntry = {
        atMinute: next.elapsedMinutes,
        kind: 'event',
        label: `${RESOURCE_LABELS[kind]} has arrived on scene`,
      };
      next = {
        ...next,
        resources: { ...next.resources, [kind]: { ...resource, status: 'on_scene' } },
        timeline: [...next.timeline, entry],
      };
    }
  }
  return next;
}
