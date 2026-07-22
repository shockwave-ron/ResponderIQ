import { describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react';
import { render, screen } from '@testing-library/react';
import { AdminReview } from './AdminReview';
import { LOCAL_ADMIN_REVIEW_STORAGE_KEY } from '@/components/SimulatorPlayer/SimulatorPlayer';
import type { SceneState } from '@/lib/engine/types';

const richState: SceneState = {
  phase: 'complete',
  elapsedMinutes: 14,
  resources: {
    additional_ems: {
      kind: 'additional_ems',
      status: 'on_scene',
      requestedAtMinute: 2,
      etaMinutes: 8,
      arrivesAtMinute: 10,
    },
    fire_lift_assist: { kind: 'fire_lift_assist', status: 'not_requested' },
  },
  hazardFlags: [],
  familyState: 'calm',
  stairChairPrepped: true,
  patientCanBearWeight: false,
  differential: {
    current: ['possible_medical_event_caused_fall'],
    history: [{ atMinute: 5, reads: ['unclear_needs_more_info'], reason: 'Awaiting further assessment' }],
  },
  timeline: [
    {
      atMinute: 0,
      kind: 'action',
      label: 'Brief your partner on the plan before you roll',
      availableActionIds: ['brief-partner', 'roll-immediately'],
      chosenActionId: 'brief-partner',
      observations: [
        {
          category: 'communication',
          severity: 'positive',
          tag: 'crew_resource_management',
          note: 'Learner briefed partner before rolling.',
          learnerNarrative: 'You briefed your partner before responding, setting up a coordinated approach.',
          atMinute: 0,
        },
      ],
    },
  ],
  criticalFlags: [
    {
      id: 'unsafe-lift',
      whatHappened: 'The patient was lifted without the stair chair prepped.',
      whyDangerous: 'This risks a fall injury to both the patient and crew.',
      consequence: 'The patient was jarred during the lift.',
      saferAlternative: 'Prep the stair chair before attempting to move the patient.',
      acknowledged: true,
      atMinute: 6,
    },
  ],
  actionsTaken: ['brief-partner'],
  firedEventIds: [],
  dynamicEvents: [],
  completion: { status: 'transport_initiated', atMinute: 14 },
};

describe('AdminReview', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('always shows the non-authenticated, single-browser disclaimer', () => {
    render(<AdminReview />);
    expect(screen.getByText(/local administrator review/i)).toBeInTheDocument();
    expect(screen.getByText(/not authenticated, not secure/i)).toBeInTheDocument();
  });

  it('shows the empty state when nothing is saved in this browser', () => {
    render(<AdminReview />);
    expect(screen.getByText(/no completed bls-01 playthrough found in this browser yet/i)).toBeInTheDocument();
  });

  it('falls back to the empty state for corrupt saved data rather than crashing', () => {
    window.localStorage.setItem(LOCAL_ADMIN_REVIEW_STORAGE_KEY, '{not valid json');
    render(<AdminReview />);
    expect(screen.getByText(/no completed bls-01 playthrough found in this browser yet/i)).toBeInTheDocument();
  });

  it('renders real completion status and minute from saved state', () => {
    window.localStorage.setItem(LOCAL_ADMIN_REVIEW_STORAGE_KEY, JSON.stringify(richState));
    render(<AdminReview />);
    expect(screen.getByText(/status: transport_initiated at minute 14/i)).toBeInTheDocument();
  });

  it('renders a saved critical flag in full, including acknowledgment', () => {
    window.localStorage.setItem(LOCAL_ADMIN_REVIEW_STORAGE_KEY, JSON.stringify(richState));
    render(<AdminReview />);
    expect(screen.getByText(/the patient was lifted without the stair chair prepped/i)).toBeInTheDocument();
    expect(screen.getByText(/prep the stair chair before attempting to move the patient/i)).toBeInTheDocument();
    expect(screen.getByText(/acknowledged by learner: yes/i)).toBeInTheDocument();
  });

  it('renders "None." for critical flags when there are none', () => {
    const noFlags: SceneState = { ...richState, criticalFlags: [] };
    window.localStorage.setItem(LOCAL_ADMIN_REVIEW_STORAGE_KEY, JSON.stringify(noFlags));
    render(<AdminReview />);
    expect(screen.getByText('None.')).toBeInTheDocument();
  });

  it('renders the hidden category scoring table with every category', () => {
    window.localStorage.setItem(LOCAL_ADMIN_REVIEW_STORAGE_KEY, JSON.stringify(richState));
    render(<AdminReview />);
    expect(screen.getByText('communication')).toBeInTheDocument();
    expect(screen.getByText('scene safety')).toBeInTheDocument();
  });

  it('renders demonstrated and missed behavioral tags', () => {
    window.localStorage.setItem(LOCAL_ADMIN_REVIEW_STORAGE_KEY, JSON.stringify(richState));
    render(<AdminReview />);
    expect(screen.getByText(/demonstrated:/i)).toBeInTheDocument();
    expect(screen.getByText(/missed \(relevant to this scenario\):/i)).toBeInTheDocument();
  });

  it('renders real differential history entries', () => {
    window.localStorage.setItem(LOCAL_ADMIN_REVIEW_STORAGE_KEY, JSON.stringify(richState));
    render(<AdminReview />);
    expect(screen.getByText(/awaiting further assessment/i)).toBeInTheDocument();
  });

  it('renders "Never updated." when differential history is empty', () => {
    const noDifferential: SceneState = { ...richState, differential: { current: [], history: [] } };
    window.localStorage.setItem(LOCAL_ADMIN_REVIEW_STORAGE_KEY, JSON.stringify(noDifferential));
    render(<AdminReview />);
    expect(screen.getByText('Never updated.')).toBeInTheDocument();
  });

  it('renders real resource request/ETA/arrival data', () => {
    window.localStorage.setItem(LOCAL_ADMIN_REVIEW_STORAGE_KEY, JSON.stringify(richState));
    render(<AdminReview />);
    expect(screen.getByText(/requested at minute 2, eta 8 min, arrival minute 10/i)).toBeInTheDocument();
  });

  it('renders the full timeline, including which other actions were available', () => {
    window.localStorage.setItem(LOCAL_ADMIN_REVIEW_STORAGE_KEY, JSON.stringify(richState));
    render(<AdminReview />);
    expect(screen.getByText('Brief your partner on the plan before you roll')).toBeInTheDocument();
    expect(screen.getByText(/also available: roll-immediately/i)).toBeInTheDocument();
  });

  it('reflects a change made in another tab via the storage event', () => {
    render(<AdminReview />);
    expect(screen.getByText(/no completed bls-01 playthrough found in this browser yet/i)).toBeInTheDocument();

    window.localStorage.setItem(LOCAL_ADMIN_REVIEW_STORAGE_KEY, JSON.stringify(richState));
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: LOCAL_ADMIN_REVIEW_STORAGE_KEY }));
    });

    expect(screen.getByText(/status: transport_initiated at minute 14/i)).toBeInTheDocument();
  });
});
