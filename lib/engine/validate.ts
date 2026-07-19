import type { ScenarioDefinition } from './types';

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Structural checks only — this can't judge whether a scenario is
 * *good*, only whether it has the basic shape required to not be a
 * hardcoded linear quiz. A scenario can pass this and still be weak;
 * it cannot fail this and still be dynamic.
 */
export function validateScenario(scenario: ScenarioDefinition): ValidationResult {
  const errors: string[] = [];

  if (!scenario.events.some((e) => e.trigger.type === 'time')) {
    errors.push('No time-triggered event — the clock has nothing to drive.');
  }

  if (!scenario.events.some((e) => e.trigger.type === 'missed_decision')) {
    errors.push('No missed-decision event — hesitation or a skipped decision has no consequence.');
  }

  if (scenario.events.length < 2) {
    errors.push('Fewer than 2 events defined — too static to be a dynamic scene.');
  }

  if (scenario.actions.length < 6) {
    errors.push('Fewer than 6 actions defined — too thin to support more than one reasonable plan.');
  }

  const initialState = scenario.buildInitialState();
  const availableAtStart = scenario.actions.filter((a) => a.availableWhen(initialState)).length;
  if (scenario.actions.length > 3 && availableAtStart === scenario.actions.length) {
    errors.push('Every action is available at the very start — nothing is phase-gated, the fixed-menu shape.');
  }

  if (scenario.relevantBehavioralTags.length < 3) {
    errors.push('Fewer than 3 relevant behavioral tags declared.');
  }

  return { valid: errors.length === 0, errors };
}
