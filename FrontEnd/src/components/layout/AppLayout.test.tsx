import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppLayout from './AppLayout';

describe('AppLayout', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppLayout />
      </MemoryRouter>
    );
    expect(container).toBeInTheDocument();
  });
});
