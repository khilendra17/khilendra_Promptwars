import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import { useScotomaStore } from '../store/useScotomaStore';

describe('SCOTOMA App Integration', () => {
  beforeEach(() => {
    useScotomaStore.getState().reset();
  });

  it('renders landing page title and pitch', () => {
    render(<App />);
    const headings = screen.getAllByRole('heading', { level: 1, name: 'SCOTOMA' });
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getByText(/Begin Decision Analysis|Start Visual Field Analysis/i)).toBeInTheDocument();
  });

  it('navigates to describe screen on clicking Begin', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Start Visual Field Analysis/i));
    expect(screen.getByText(/Describe Your Decision/i)).toBeInTheDocument();
  });

  it('validates decision input minimum lengths', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Start Visual Field Analysis/i));
    fireEvent.click(screen.getByText(/Run Neuro-Symbolic Scan/i));
    expect(screen.getByText(/Title must be at least 3 characters/i)).toBeInTheDocument();
  });
});
