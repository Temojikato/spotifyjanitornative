import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileModal from '../../src/components/ProfileModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../src/context/AuthContext';

const mockReplace = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ replace: mockReplace }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());

const sampleProfile = {
  display_name: 'Test User',
  images: [{ url: 'http://example.com/profile.jpg' }],
  product: 'premium',
  country: 'US',
  email: 'test@example.com',
  id: 'user1',
  followers: { total: 100 },
  external_urls: { spotify: 'http://spotify.com/user1' },
};

describe('ProfileModal', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (AsyncStorage.multiRemove as jest.Mock).mockClear();
    mockReplace.mockClear();
  });


  it('calls navigation.replace with "Login" when logout is pressed', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(sampleProfile));
    const onCloseMock = jest.fn();

    const logoutMock = jest.fn().mockImplementation(async () => {
      await AsyncStorage.multiRemove([
        'access_token',
        'code_verifier',
        'profile_pic',
        'user_profile'
      ]);
      mockReplace('Login');
    });

    const { getByText } = render(
      <AuthContext.Provider
        value={{
          isAuthenticated: false,
          setIsAuthenticated: jest.fn(),
          logout: logoutMock,
        }}
      >
        <ProfileModal open={true} onClose={onCloseMock} />
      </AuthContext.Provider>

    );

    await waitFor(() => {
      expect(getByText('Test User')).toBeTruthy();
    });
    const logoutButton = getByText('Logout');
    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalled();
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'access_token',
        'code_verifier',
        'profile_pic',
        'user_profile'
      ]);
      expect(mockReplace).toHaveBeenCalledWith('Login');
    });
  });
});
