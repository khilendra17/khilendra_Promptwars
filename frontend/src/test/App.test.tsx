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
    expect(screen.getByText(/Launch Visual Field Workspace/i)).toBeInTheDocument();
  });

  it('navigates to describe screen on clicking Launch Workspace', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Launch Visual Field Workspace/i));
    expect(screen.getByText(/Describe Decision/i)).toBeInTheDocument();
  });

  it('validates decision input minimum lengths', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Launch Visual Field Workspace/i));
    fireEvent.click(screen.getByText(/Run Neuro-Symbolic Scan/i));
    expect(screen.getByText(/Title must be at least 3 characters/i)).toBeInTheDocument();
  });
});
