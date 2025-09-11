import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navigation from '../Navigation';

function renderWithRouter(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<><Navigation /><div data-testid="home-page">Home Page</div></>} />
        <Route path="/timeline" element={<><Navigation /><div data-testid="timeline-page">Timeline Page</div></>} />
        <Route path="/faces" element={<><Navigation /><div data-testid="faces-page">Faces Page</div></>} />
        <Route path="/places" element={<><Navigation /><div data-testid="places-page">Places Page</div></>} />
        <Route path="/create" element={<><Navigation /><div data-testid="create-page">Create Page</div></>} />
        <Route path="/profile" element={<><Navigation /><div data-testid="profile-page">Profile Page</div></>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Navigation', () => {
  test('renders labels', () => {
    renderWithRouter('/');
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Faces')).toBeInTheDocument();
    expect(screen.getByText('Places')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('navigates to Timeline on click', async () => {
    const user = userEvent.setup();
    renderWithRouter('/');
    await user.click(screen.getByText('Timeline'));
    expect(await screen.findByTestId('timeline-page')).toBeInTheDocument();
  });

  test('navigates to Places on click', async () => {
    const user = userEvent.setup();
    renderWithRouter('/');
    await user.click(screen.getByText('Places'));
    expect(await screen.findByTestId('places-page')).toBeInTheDocument();
  });
});

