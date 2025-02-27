import { render, waitFor, screen } from '@testing-library/react';
import HomeRedirect from '../../components/HomeRedirect';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

describe('HomeRedirect', () => {
  afterEach(() => {
    localStorage.clear();
  });

  test('redirects to /saved-tracks when token exists', async () => {
    localStorage.setItem('access_token', 'dummy_token');
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/saved-tracks" element={<div data-testid="saved-tracks" />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('saved-tracks')).toBeInTheDocument();
    });
  });

  test('redirects to /login when token does not exist', async () => {
    localStorage.removeItem('access_token');
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<div data-testid="login" />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('login')).toBeInTheDocument();
    });
  });
});
