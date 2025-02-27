import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../../pages/LoginPage';
import { redirectToSpotifyAuth } from '../../services/auth';

jest.mock('../../services/auth');

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders title and login button', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /spotify janitor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login with spotify/i })).toBeInTheDocument();
  });

  test('calls redirectToSpotifyAuth when login button is clicked', async () => {
    const redirectMock = redirectToSpotifyAuth as jest.Mock;
    redirectMock.mockResolvedValueOnce(undefined);
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /login with spotify/i }));
    await waitFor(() => expect(redirectMock).toHaveBeenCalledTimes(1));
  });

  test('logs error when redirectToSpotifyAuth fails', async () => {
    const error = new Error('Auth failed');
    const redirectMock = redirectToSpotifyAuth as jest.Mock;
    redirectMock.mockRejectedValueOnce(error);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /login with spotify/i }));
    await waitFor(() => expect(consoleErrorSpy).toHaveBeenCalledWith("Error during Spotify authentication", error));
    consoleErrorSpy.mockRestore();
  });
});
