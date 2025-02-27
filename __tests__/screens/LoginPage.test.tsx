import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginPage from '../../src/screens/LoginPage';
import { redirectToSpotifyAuth } from '../../src/services/auth';

jest.mock('../../src/services/auth', () => ({
  redirectToSpotifyAuth: jest.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header and button', () => {
    const { getByText } = render(<LoginPage />);
    expect(getByText('Spotify Janitor')).toBeTruthy();
    expect(getByText('Login with Spotify')).toBeTruthy();
  });

  it('calls redirectToSpotifyAuth when button is pressed', async () => {
    (redirectToSpotifyAuth as jest.Mock).mockResolvedValueOnce(undefined);
    const { getByText } = render(<LoginPage />);
    fireEvent.press(getByText('Login with Spotify'));
    await waitFor(() => {
      expect(redirectToSpotifyAuth).toHaveBeenCalled();
    });
  });

  it('logs error if redirectToSpotifyAuth throws', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (redirectToSpotifyAuth as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
    const { getByText } = render(<LoginPage />);
    fireEvent.press(getByText('Login with Spotify'));
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error during Spotify authentication', expect.any(Error));
    });
    consoleErrorSpy.mockRestore();
  });
});
