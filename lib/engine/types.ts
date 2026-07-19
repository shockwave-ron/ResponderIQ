/**
 * Core types for the ResponderIQ simulator engine.
 *
 * Scoped deliberately to what BLS-01 needs — this is the minimum
 * reusable engine, not a general-purpose EMS ontology. Extend when a
 * second scenario actually needs something new, not before.
 */

export type ScoringCategory =
  | 'scene_safety'
  | 'situational_awareness'
  | 'resource_management'
  | 'timing'
  | 'communication'
  | 'prioritization'
  | 'adaptability'
  | 'differential_accuracy'
  | 'mission_completion';

export type BehavioralTag =
  | 'scene_safety'
  | 'situational_awareness'
  | 'communication'
  | 'leadership'
  | 'differential_thinking'
  | 'crew_resource_management'
  | 'emotional_intelligence'
  | 'professionalism'
  | 'bias_recognition'
  | 'patient_advocacy';

/** Operational read, not a medical diagnosis. */
export type DifferentialRead =
  | 'mechanical_fall_only'
  | 'possible_medical_event_caused_fall'
  | 'unclear_needs_more_info'
  | 'unsafe_scene'
  | 'resource_need_extraction';

export type ResourceKind = 'additional_ems' | 'fire_lift_assist';

export type ResourceStatus = 'not_requested' | 'en_route' | 'on_scene' | 'canceled';

export interface ResourceInstance {
  readonly kind: ResourceKind;
  readonly status: ResourceStatus;
  readonly requestedAtMinute?: number;
  readonly etaMinutes?: number;
  readonly arrivesAtMinute?: number;
}

export type ScenarioPhase =
  | 'dispatch'
  | 'en_route'
  | 'arrival'
  | 'assessment'
  | 'complication'
  | 'resolution'
  | 'complete';

export interface ScoringObservation {
  readonly category: ScoringCategory;
  readonly severity: 'critical' | 'notable' | 'minor' | 'positive';
  readonly tag?: BehavioralTag;
  /** Internal note for the administrator view — never learner-facing. */
  readonly note: string;
  /** Plain-language sentence for the learner debrief. Omit for purely administrative observations that shouldn't surface in the debrief at all. */
  readonly learnerNarrative?: string;
  readonly atMinute: number;
}

export interface TimelineEntry {
  readonly atMinute: number;
  readonly kind:
    | 'action'
    | 'event'
    | 'acknowledgment'
    | 'differential_update'
    | 'phase_change'
    | 'completion';
  readonly label: string;
  readonly detail?: string;
  /** Every action id that was actually offered at this moment, not just the one chosen — required for admin review. */
  readonly availableActionIds?: readonly string[];
  readonly chosenActionId?: string;
  readonly observations?: readonly ScoringObservation[];
}

export interface CriticalFlag {
  readonly id: string;
  readonly whatHappened: string;
  readonly whyDangerous: string;
  readonly consequence: string;
  readonly saferAlternative: string;
  readonly acknowledged: boolean;
  readonly atMinute: number;
}

export interface DifferentialHistoryEntry {
  readonly atMinute: number;
  readonly reads: readonly DifferentialRead[];
  readonly reason?: string;
}

export interface SceneState {
  readonly phase: ScenarioPhase;
  readonly elapsedMinutes: number;
  /** True while a critical interruption is awaiting acknowledgment — no further time-costing action is allowed until cleared. */
  readonly pendingAcknowledgmentEventId?: string;
  readonly resources: Readonly<Record<ResourceKind, ResourceInstance>>;
  readonly hazardFlags: readonly string[];
  readonly ambulancePosition?: 'blocking_lane' | 'clear_spot';
  readonly familyState: 'calm' | 'agitated';
  readonly stairChairPrepped: boolean;
  readonly patientCanBearWeight: boolean;
  readonly differential: {
    readonly current: readonly DifferentialRead[];
    readonly history: readonly DifferentialHistoryEntry[];
  };
  readonly timeline: readonly TimelineEntry[];
  readonly criticalFlags: readonly CriticalFlag[];
  readonly actionsTaken: readonly string[];
  readonly firedEventIds: readonly string[];
  /** Events scheduled at runtime relative to when something happened (e.g. "arrive 6 minutes after departing"), as opposed to the scenario's fixed events. */
  readonly dynamicEvents: readonly EventDefinition[];
  readonly completion?: {
    readonly status: 'transport_initiated' | 'unsafe_extrication_completed';
    readonly atMinute: number;
  };
}

export interface ActionDefinition {
  readonly id: string;
  readonly label: string;
  readonly availableWhen: (state: SceneState) => boolean;
  /** Simulated minutes this action costs. Reading/deciding costs nothing — only doing does. */
  readonly timeCostMinutes: number;
  /** If true, the action disappears from the list once taken once. */
  readonly oneTime?: boolean;
  readonly apply: (state: SceneState) => SceneState;
  /** Computed against the state AFTER apply() — lets an observation depend on timing (e.g. "requested late") rather than being a fixed label. */
  readonly observe?: (state: SceneState) => readonly ScoringObservation[];
}

export type EventTrigger =
  | { readonly type: 'time'; readonly atMinute: number }
  | { readonly type: 'condition'; readonly check: (state: SceneState) => boolean }
  | { readonly type: 'missed_decision'; readonly deadlineMinute: number; readonly check: (state: SceneState) => boolean };

export interface EventDefinition {
  readonly id: string;
  readonly trigger: EventTrigger;
  /** Critical events pause the clock and require explicit acknowledgment before play continues. */
  readonly critical?: boolean;
  readonly label: string;
  readonly detail: string;
  readonly apply: (state: SceneState) => SceneState;
  /** Computed against the state AFTER apply() — for consequences that reflect on an earlier decision (or the absence of one). */
  readonly observe?: (state: SceneState) => readonly ScoringObservation[];
}

export interface ScenarioDefinition {
  readonly id: string;
  readonly title: string;
  readonly dispatchSummary: string;
  readonly buildInitialState: () => SceneState;
  readonly actions: readonly ActionDefinition[];
  readonly events: readonly EventDefinition[];
  readonly isComplete: (state: SceneState) => boolean;
  /** Which of the 10 behavioral tags this scenario is actually designed to test — 'missed' is only ever computed against this list. */
  readonly relevantBehavioralTags: readonly BehavioralTag[];
}
