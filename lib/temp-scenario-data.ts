/**
 * TEMPORARY PLACEHOLDER DATA — Milestone 1 only.
 *
 * This file exists to prove the application flow (landing -> scenario
 * selection -> scene -> one decision point -> completion) end to end.
 * It is NOT an approved ResponderIQ scenario and contains no clinical
 * scoring, no correctness evaluation, and no connection to the real
 * Performance Engine.
 *
 * Replace this file (and the `getTempScenario` / `getAllTempScenarios`
 * accessors below) with real scenario data once the approved
 * ResponderIQ scenario files and the Scenario Engine are wired in.
 * Nothing outside this file should hardcode scenario content — every
 * other module reads through these two functions so that swap is a
 * one-file change.
 */

export interface TempResponseOption {
  readonly id: string;
  readonly label: string;
}

export interface TempScenario {
  readonly id: string;
  readonly title: string;
  readonly briefDescription: string;
  readonly initialScene: string;
  readonly decisionPrompt: string;
  readonly responseOptions: readonly [
    TempResponseOption,
    TempResponseOption,
    TempResponseOption,
  ];
  readonly completionMessage: string;
}

/**
 * A single placeholder scenario. Deliberately simple and low-detail —
 * this is a flow test, not a training scenario. No response option is
 * marked correct or incorrect; Milestone 1 does not evaluate choices.
 */
const TEMP_SCENARIOS: readonly TempScenario[] = [
  {
    id: 'temp-scenario-001',
    title: 'Placeholder Scenario — Residential Call',
    briefDescription:
      'A short, temporary walkthrough used to verify the application flow. Not an approved training scenario.',
    initialScene:
      'You arrive at a residence for a reported fall. A family member meets you at the door and leads you inside.',
    decisionPrompt: 'What do you do first?',
    responseOptions: [
      { id: 'option-a', label: 'Confirm scene safety before approaching the patient' },
      { id: 'option-b', label: 'Go directly to the patient and begin assessment' },
      { id: 'option-c', label: 'Ask the family member what happened before entering further' },
    ],
    completionMessage:
      'Placeholder scenario complete. In the full application, this screen will show adaptive feedback, an updated learner profile, and a link to the After-Action Review — none of which are wired in yet for Milestone 1.',
  },
];

/** Returns every temporary scenario available for selection. */
export function getAllTempScenarios(): readonly TempScenario[] {
  return TEMP_SCENARIOS;
}

/** Returns one temporary scenario by id, or undefined if not found. */
export function getTempScenario(id: string): TempScenario | undefined {
  return TEMP_SCENARIOS.find((scenario) => scenario.id === id);
}
