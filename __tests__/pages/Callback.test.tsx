import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import Callback from '../../pages/Callback';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import * as auth from '../../services/auth';
import axios from 'axios';

jest.mock('../../services/auth');
jest.mock('axios');

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  const navigateMock = jest.fn();
  return {
    __esModule: true,
    ...originalModule,
    useNavigate: () => navigateMock,
    useLocation: () => ({ search: globalThis.location.search }),
    _navigateMock: navigateMock,
  };
});

describe('Callback', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('fetches token and profile then navigates to /saved-tracks', async () => {
    Object.defineProperty(globalThis, 'location', {
      writable: true,
      value: { search: '?code=test123' }
    });
    localStorage.setItem('access_token', 'fake_access_token');

    const fakeTokenData = { access_token: 'fake_access_token', expires_in: 3600 };
    (auth.getToken as jest.Mock).mockResolvedValue(fakeTokenData);
    const fakeProfileData = {
      display_name: 'Test User',
      images: [{ url: 'http://example.com/profile.png' }],
      product: 'premium',
      country: 'US',
      email: 'test@example.com',
      id: 'test123',
      followers: { total: 100 },
      external_urls: { spotify: 'http://spotify.com/test' }
    };
    (axios.get as jest.Mock).mockResolvedValue({ data: fakeProfileData });

    await act(async () => {
      render(
        <MemoryRouter>
          <Callback />
        </MemoryRouter>
      );
    });
    
    await act(async () => {
      await Promise.resolve();
    });

    const { _navigateMock: navigateMock } = require('react-router-dom');

    await waitFor(() => {
      expect(auth.getToken).toHaveBeenCalledWith('test123');
      expect(axios.get).toHaveBeenCalledWith('https://api.spotify.com/v1/me', {
        headers: { Authorization: 'Bearer fake_access_token' }
      });
      expect(navigateMock).toHaveBeenCalledWith('/saved-tracks');
      expect(localStorage.getItem('user_profile')).toEqual(JSON.stringify(fakeProfileData));
      expect(localStorage.getItem('profile_pic')).toEqual('http://example.com/profile.png');
    });
  });

  test('logs error when authorization code is missing', async () => {
    Object.defineProperty(globalThis, 'location', {
      writable: true,
      value: { search: '' }
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <Callback />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Authorization code not found in URL');
    });
    consoleErrorSpy.mockRestore();
  });
});
