import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ActivityIndicator } from 'react-native';
import HomeRedirect from '../../src/components/HomeRedirect';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

describe('HomeRedirect', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    (AsyncStorage.getItem as jest.Mock).mockReset();
  });

  it('navigates to SavedTracks when token exists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('dummy_token');
    render(<HomeRedirect />);
    await waitFor(() =>
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('access_token')
    );
    expect(mockReplace).toHaveBeenCalledWith('SavedTracks');
  });

  it('navigates to Login when token does not exist', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    render(<HomeRedirect />);
    await waitFor(() =>
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('access_token')
    );
    expect(mockReplace).toHaveBeenCalledWith('Login');
  });

  it('renders an ActivityIndicator', () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const { getByTestId } = render(<HomeRedirect />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
