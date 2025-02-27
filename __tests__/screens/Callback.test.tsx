import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Callback from '../../src/screens/Callback';
import { getToken } from '../../src/services/auth';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../src/services/auth', () => ({ getToken: jest.fn() }));
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

let mockRouteParams: { code?: string } = { code: 'sampleCode' };
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, replace: jest.fn() }),
  useRoute: () => ({ params: mockRouteParams }),
}));

describe('Callback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { code: 'sampleCode' };
  });

  it('obtains token, fetches profile, caches data and navigates to SavedTracks', async () => {
    (getToken as jest.Mock).mockResolvedValueOnce(undefined);
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: {
        images: [{ url: 'http://example.com/profile.jpg' }],
        display_name: 'Test User',
      },
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('dummy_token');
    render(<Callback />);
    await waitFor(() => {
      expect(getToken).toHaveBeenCalledWith('sampleCode');
      expect(axios.get).toHaveBeenCalledWith('https://api.spotify.com/v1/me', {
        headers: { Authorization: 'Bearer dummy_token' },
      });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_profile',
        JSON.stringify({
          images: [{ url: 'http://example.com/profile.jpg' }],
          display_name: 'Test User',
        })
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('profile_pic', 'http://example.com/profile.jpg');
      expect(mockNavigate).toHaveBeenCalledWith('SavedTracks');
    });
  });

  it('logs error if code is not provided in route parameters', async () => {
    mockRouteParams = {}; 
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<Callback />);
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Authorization code not found in route parameters');
    });
    consoleErrorSpy.mockRestore();
  });
});
