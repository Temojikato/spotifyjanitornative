import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as auth from '../../services/auth';

jest.mock('../../services/auth');

const TestComponent = () => <div data-testid="protected">Protected Content</div>;
const HomeRedirect = () => <div data-testid="redirect">Redirected</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders children when token exists and is valid', async () => {
    localStorage.setItem('access_token', 'valid_token');
    localStorage.setItem('token_expiry', (Date.now() + 10000).toString());
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<HomeRedirect />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByTestId('protected')).toBeInTheDocument()
    );
  });

  test('redirects when no token is present', async () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<HomeRedirect />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByTestId('redirect')).toBeInTheDocument()
    );
  });

  test('attempts to refresh token when expired and renders children on success', async () => {
    localStorage.setItem('token_expiry', (Date.now() - 10000).toString());
    localStorage.setItem('refresh_token', 'refresh_token');
    (auth.refreshAccessToken as jest.Mock).mockResolvedValue({
      access_token: 'new_token',
      expires_in: 3600,
    });
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<HomeRedirect />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByTestId('protected')).toBeInTheDocument()
    );
  });

  test('attempts to refresh token when expired and redirects on failure', async () => {
    localStorage.setItem('token_expiry', (Date.now() - 10000).toString());
    localStorage.setItem('refresh_token', 'refresh_token');
    (auth.refreshAccessToken as jest.Mock).mockRejectedValue(new Error('Refresh failed'));
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<HomeRedirect />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByTestId('redirect')).toBeInTheDocument()
    );
  });
});
