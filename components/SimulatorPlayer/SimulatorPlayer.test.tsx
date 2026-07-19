import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SimulatorPlayer } from './SimulatorPlayer';

describe('SimulatorPlayer', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the dispatch narrative and starting elapsed time', () => {
    render(<SimulatorPlayer />);
    expect(screen.getByText(/Elapsed: 0 min/)).toBeInTheDocument();
    expect(screen.getByText(/Residential fall/)).toBeInTheDocument();
  });

  it('advances the clock when an action is chosen', () => {
    render(<SimulatorPlayer />);
    fireEvent.click(screen.getByRole('button', { name: 'Brief your partner on the plan before you roll' }));
    expect(screen.getByText(/Elapsed: 1 min/)).toBeInTheDocument();
  });

  it('never renders a score, percentage, points, or correct/incorrect label anywhere in the learner UI', () => {
    const { container } = render(<SimulatorPlayer />);
    fireEvent.click(screen.getByRole('button', { name: 'Brief your partner on the plan before you roll' }));
    fireEvent.click(screen.getByRole('button', { name: 'Request an additional EMS unit' }));
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bscore\b/i);
    expect(text).not.toMatch(/%/);
    expect(text).not.toMatch(/\bpoints?\b/i);
    expect(text).not.toMatch(/\bcorrect\b/i);
    expect(text).not.toMatch(/\bincorrect\b/i);
    expect(text).not.toMatch(/question \d/i);
  });

  it('never shows a fixed question-number style progress indicator', () => {
    render(<SimulatorPlayer />);
    expect(screen.queryByText(/question \d+ of \d+/i)).not.toBeInTheDocument();
  });
});
