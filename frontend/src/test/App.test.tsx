import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../App';

describe('SCOTOMA App Integration', () => {
  it('renders landing page title and pitch', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'SCOTOMA' })).toBeInTheDocument();
    expect(screen.getByText(/Begin Decision Analysis/i)).toBeInTheDocument();
  });

  it('navigates to describe screen on clicking Begin', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Begin Decision Analysis/i));
    expect(screen.getByText(/Describe Your Decision/i)).toBeInTheDocument();
  });

  it('validates decision input minimum lengths', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Begin Decision Analysis/i));
    fireEvent.click(screen.getByText(/Run Neuro-Symbolic Scan/i));
    expect(screen.getByText(/Title must be at least 3 characters/i)).toBeInTheDocument();
  });
});
