import type {
  BehavioralTag,
  CriticalFlag,
  ScenarioDefinition,
  SceneState,
  ScoringCategory,
  ScoringObservation,
  TimelineEntry,
} from './types';

/** Raises a critical safety flag. It must be acknowledged before the mission can close — checked at completion, not mid-action. */
export function raiseCriticalFlag(
  state: SceneState,
  flag: Omit<CriticalFlag, 'acknowledged' | 'atMinute' | 'id'> & { readonly id: string },
): SceneState {
  const fullFlag: CriticalFlag = { ...flag, acknowledged: false, atMinute: state.elapsedMinutes };
  const entry: TimelineEntry = {
    atMinute: state.elapsedMinutes,
    kind: 'event',
    label: 'Critical safety flag',
    detail: flag.whatHappened,
  };
  return {
    ...state,
    criticalFlags: [...state.criticalFlags, fullFlag],
    timeline: [...state.timeline, entry],
  };
}

export function acknowledgeCriticalFlag(state: SceneState, flagId: string): SceneState {
  return {
    ...state,
    criticalFlags: state.criticalFlags.map((flag) =>
      flag.id === flagId ? { ...flag, acknowledged: true } : flag,
    ),
  };
}

export function allCriticalFlagsAcknowledged(state: SceneState): boolean {
  return state.criticalFlags.every((flag) => flag.acknowledged);
}

export interface HiddenScoreSummary {
  readonly categoryTally: Readonly<Record<ScoringCategory, { positive: number; notable: number; minor: number; critical: number }>>;
  readonly behavioralTagsDemonstrated: readonly BehavioralTag[];
  readonly behavioralTagsMissed: readonly BehavioralTag[];
  readonly criticalFlagCount: number;
}

const ALL_CATEGORIES: readonly ScoringCategory[] = [
  'scene_safety',
  'situational_awareness',
  'resource_management',
  'timing',
  'communication',
  'prioritization',
  'adaptability',
  'differential_accuracy',
  'mission_completion',
];

/** Aggregates every observation recorded across the timeline into category tallies and behavioral tag coverage. Administrator-only. */
export function computeHiddenSummary(
  state: SceneState,
  scenario: ScenarioDefinition,
): HiddenScoreSummary {
  const allObservations: ScoringObservation[] = state.timeline.flatMap((e) => e.observations ?? []);

  const categoryTally = Object.fromEntries(
    ALL_CATEGORIES.map((category) => [category, { positive: 0, notable: 0, minor: 0, critical: 0 }]),
  ) as HiddenScoreSummary['categoryTally'];

  const demonstrated = new Set<BehavioralTag>();
  for (const observation of allObservations) {
    categoryTally[observation.category][
      observation.severity === 'critical'
        ? 'critical'
        : observation.severity === 'positive'
          ? 'positive'
          : observation.severity === 'notable'
            ? 'notable'
            : 'minor'
    ] += 1;
    if (observation.tag) demonstrated.add(observation.tag);
  }

  const behavioralTagsDemonstrated = scenario.relevantBehavioralTags.filter((tag) => demonstrated.has(tag));
  const behavioralTagsMissed = scenario.relevantBehavioralTags.filter((tag) => !demonstrated.has(tag));

  return {
    categoryTally,
    behavioralTagsDemonstrated,
    behavioralTagsMissed,
    criticalFlagCount: state.criticalFlags.length,
  };
}
