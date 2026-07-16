import { describe, it, expect } from 'vitest';
import { getAllTempScenarios, getTempScenario } from './temp-scenario-data';

describe('getAllTempScenarios', () => {
  it('returns at least one scenario', () => {
    const scenarios = getAllTempScenarios();
    expect(scenarios.length).toBeGreaterThan(0);
  });

  it('returns scenarios with exactly three response options each', () => {
    const scenarios = getAllTempScenarios();
    scenarios.forEach((scenario) => {
      expect(scenario.responseOptions).toHaveLength(3);
    });
  });

  it('returns scenarios with unique ids', () => {
    const scenarios = getAllTempScenarios();
    const ids = scenarios.map((scenario) => scenario.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getTempScenario', () => {
  it('returns the matching scenario for a known id', () => {
    const scenario = getTempScenario('temp-scenario-001');
    expect(scenario).toBeDefined();
    expect(scenario?.id).toBe('temp-scenario-001');
  });

  it('returns undefined for an unknown id', () => {
    const scenario = getTempScenario('does-not-exist');
    expect(scenario).toBeUndefined();
  });

  it('returns a scenario with non-empty title, scene, and prompt text', () => {
    const scenario = getTempScenario('temp-scenario-001');
    expect(scenario?.title.length).toBeGreaterThan(0);
    expect(scenario?.initialScene.length).toBeGreaterThan(0);
    expect(scenario?.decisionPrompt.length).toBeGreaterThan(0);
    expect(scenario?.completionMessage.length).toBeGreaterThan(0);
  });

  it('returns response options with unique ids within a scenario', () => {
    const scenario = getTempScenario('temp-scenario-001');
    const optionIds = scenario?.responseOptions.map((option) => option.id) ?? [];
    expect(new Set(optionIds).size).toBe(optionIds.length);
  });
});
