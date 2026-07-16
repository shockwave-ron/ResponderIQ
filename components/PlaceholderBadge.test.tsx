import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlaceholderBadge } from './PlaceholderBadge';

describe('PlaceholderBadge', () => {
  it('renders visible text marking the content as temporary', () => {
    render(<PlaceholderBadge />);
    expect(screen.getByText(/temporary placeholder content/i)).toBeInTheDocument();
  });
});
