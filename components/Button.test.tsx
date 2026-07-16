import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders as a link when href is provided', () => {
    render(<Button href="/scenarios">Begin training</Button>);
    const link = screen.getByRole('link', { name: 'Begin training' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/scenarios');
  });

  it('renders as a button and fires onClick when no href is provided', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Continue</Button>);
    const button = screen.getByRole('button', { name: 'Continue' });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders children text correctly', () => {
    render(<Button href="/">Home</Button>);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
